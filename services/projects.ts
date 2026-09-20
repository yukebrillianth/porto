import { REVALIDATE_SECONDS } from '@/constants';
import { hygraphFetch, projectTags } from '@/lib/hygraph';
import type {
  ProjectDetail,
  ProjectImage,
  ProjectStatus,
  ProjectSummary,
} from '@/types/content';

/** Raw `Portfolio` node as returned by Hygraph. */
interface HygraphPortfolio {
  slug: string;
  title: string;
  category: string[] | null;
  cover: { url: string } | null;
  description?: string | null;
  date?: string | null;
  endDate?: string | null;
  projectStatus?: ProjectStatus | null;
  techStack?: string[] | null;
  role?: string | null;
  featured?: boolean | null;
  updatedAt?: string | null;
  highlights?: string[] | null;
  projectUri?: string | null;
  repoUrl?: string | null;
  images?: ProjectImage[] | null;
  details?: { raw: unknown } | null;
}

/** Summary shape shared by every listing query. */
const SUMMARY_FIELDS = /* GraphQL */ `
  slug
  title
  description
  date
  category
  projectStatus
  techStack
  role
  featured
  updatedAt
  cover {
    url
  }
`;

/**
 * Hygraph cannot sort by `priority` then `date`, so ordering is finished in
 * memory by `sortProjects`. Fetching ordered by date keeps that sort stable.
 */
const PROJECTS_QUERY = /* GraphQL */ `
  query Projects($category: [PortfolioCategory!]) {
    portfolios(
      where: { public: true, category_contains_some: $category }
      orderBy: date_DESC
      first: 100
    ) {
      ${SUMMARY_FIELDS}
      priority
    }
  }
`;

const ALL_PROJECTS_QUERY = /* GraphQL */ `
  query AllProjects {
    portfolios(where: { public: true }, orderBy: date_DESC, first: 100) {
      ${SUMMARY_FIELDS}
      priority
    }
  }
`;

const PROJECT_SLUGS_QUERY = /* GraphQL */ `
  query ProjectSlugs {
    portfolios(where: { public: true }, orderBy: date_DESC, first: 100) {
      slug
    }
  }
`;

const PROJECT_BY_SLUG_QUERY = /* GraphQL */ `
  query ProjectBySlug($slug: String!) {
    portfolio(where: { slug: $slug }) {
      ${SUMMARY_FIELDS}
      endDate
      highlights
      projectUri
      repoUrl
      images {
        fileName
        url
      }
      details {
        raw
      }
    }
  }
`;

/**
 * Categories defined on the `PortfolioCategory` enum in Hygraph. A value
 * outside this list would fail GraphQL validation, so it is filtered in memory
 * instead.
 */
const VALID_CATEGORIES = [
  'Website',
  'Design',
  'Mobile',
  'Robotics',
  'Systems',
  'Embedded',
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

function normalizeCategory(category?: string): ValidCategory | undefined {
  if (!category || category.toLowerCase() === 'all') return undefined;

  const lowered = category.toLowerCase();

  return VALID_CATEGORIES.find(
    (valid) =>
      valid.toLowerCase() === lowered ||
      (lowered === 'web' && valid === 'Website')
  );
}

/** Year the project started, derived from `date` so it cannot drift. */
function toYear(date?: string | null): number | null {
  if (!date) return null;

  const year = new Date(date).getFullYear();

  return Number.isNaN(year) ? null : year;
}

/** Normalize a Hygraph node into the `ProjectSummary` contract. */
function toProjectSummary(portfolio: HygraphPortfolio): ProjectSummary {
  return {
    slug: portfolio.slug,
    title: portfolio.title,
    coverUrl: portfolio.cover?.url ?? '',
    category: portfolio.category ?? [],
    description: portfolio.description ?? '',
    year: toYear(portfolio.date),
    status: portfolio.projectStatus ?? null,
    techStack: portfolio.techStack ?? [],
    role: portfolio.role ?? null,
    featured: portfolio.featured ?? false,
    updatedAt: portfolio.updatedAt ?? null,
  };
}

/** Highest `priority` first, newest first within the same priority. */
function sortProjects(
  portfolios: (HygraphPortfolio & { priority?: number | null })[]
): ProjectSummary[] {
  return [...portfolios]
    .sort((a, b) => {
      const byPriority = (b.priority ?? 0) - (a.priority ?? 0);

      if (byPriority !== 0) return byPriority;

      return (b.date ?? '').localeCompare(a.date ?? '');
    })
    .map(toProjectSummary);
}

async function fetchAllProjects(): Promise<ProjectSummary[]> {
  const data = await hygraphFetch<{
    portfolios: (HygraphPortfolio & { priority?: number | null })[];
  }>(ALL_PROJECTS_QUERY, undefined, {
    tags: [projectTags.all],
    revalidate: REVALIDATE_SECONDS,
  });

  return data?.portfolios ? sortProjects(data.portfolios) : [];
}

/**
 * List public projects, highest priority first.
 *
 * Pass a category to filter; `'all'` (or nothing) returns everything. Returns
 * `[]` when Hygraph is unconfigured or unreachable.
 *
 * @example
 * const all = await getProjects();
 * const robotics = await getProjects('Robotics');
 */
export async function getProjects(
  category?: string
): Promise<ProjectSummary[]> {
  const isFiltered = Boolean(category) && category?.toLowerCase() !== 'all';

  if (!isFiltered) return fetchAllProjects();

  const normalized = normalizeCategory(category);

  if (!normalized) {
    // Unknown category: filter what we have rather than failing validation.
    const all = await fetchAllProjects();

    return all.filter((project) =>
      project.category.some(
        (value) => value.toLowerCase() === category?.toLowerCase()
      )
    );
  }

  const data = await hygraphFetch<{
    portfolios: (HygraphPortfolio & { priority?: number | null })[];
  }>(
    PROJECTS_QUERY,
    { category: [normalized] },
    { tags: [projectTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return data?.portfolios ? sortProjects(data.portfolios) : [];
}

/**
 * Projects flagged `featured` in Hygraph, for the homepage preview.
 *
 * Falls back to the most recent projects when nothing is flagged, so the
 * homepage never renders an empty section.
 *
 * @example
 * const preview = await getFeaturedProjects(3);
 */
export async function getFeaturedProjects(
  limit = 3
): Promise<ProjectSummary[]> {
  const all = await fetchAllProjects();
  const featured = all.filter((project) => project.featured);

  return (featured.length > 0 ? featured : all).slice(0, limit);
}

/**
 * Every public project slug - for `generateStaticParams`.
 *
 * @example
 * export async function generateStaticParams() {
 *   const slugs = await getProjectSlugs();
 *   return slugs.map((slug) => ({ slug }));
 * }
 */
export async function getProjectSlugs(): Promise<string[]> {
  const data = await hygraphFetch<{ portfolios: { slug: string }[] }>(
    PROJECT_SLUGS_QUERY,
    undefined,
    { tags: [projectTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return data?.portfolios?.map((portfolio) => portfolio.slug) ?? [];
}

/**
 * Fetch one project by slug, or `null` when it does not exist.
 *
 * Tagged `project:<slug>` so a single publish busts only this entry.
 *
 * @example
 * const project = await getProjectBySlug('ekartar');
 * if (!project) notFound();
 */
export async function getProjectBySlug(
  slug: string
): Promise<ProjectDetail | null> {
  const data = await hygraphFetch<{ portfolio: HygraphPortfolio | null }>(
    PROJECT_BY_SLUG_QUERY,
    { slug },
    {
      tags: [projectTags.all, projectTags.bySlug(slug)],
      revalidate: REVALIDATE_SECONDS,
    }
  );

  const portfolio = data?.portfolio;

  if (!portfolio) return null;

  return {
    ...toProjectSummary(portfolio),
    description: portfolio.description ?? '',
    projectUri: portfolio.projectUri ?? null,
    repoUrl: portfolio.repoUrl ?? null,
    startDate: portfolio.date ?? null,
    endDate: portfolio.endDate ?? null,
    highlights: portfolio.highlights ?? [],
    images: portfolio.images ?? [],
    details: portfolio.details ?? null,
  };
}
