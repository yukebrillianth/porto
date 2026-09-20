import { REVALIDATE_SECONDS } from '@/constants';
import { hygraphFetch, projectTags } from '@/lib/hygraph';
import type {
  ProjectDetail,
  ProjectImage,
  ProjectSummary,
} from '@/types/content';

/** Raw `Portfolio` node as returned by Hygraph. */
interface HygraphPortfolio {
  slug: string;
  title: string;
  category: string[] | null;
  cover: { url: string } | null;
  description?: string | null;
  projectUri?: string | null;
  portfolioStatus?: string | null;
  images?: ProjectImage[] | null;
  details?: { raw: unknown } | null;
}

const PROJECTS_QUERY = /* GraphQL */ `
  query Projects($category: [String!]) {
    portfolios(
      where: { public: true, category_contains_some: $category }
      orderBy: date_DESC
    ) {
      slug
      title
      category
      cover {
        url
      }
    }
  }
`;

const ALL_PROJECTS_QUERY = /* GraphQL */ `
  query AllProjects {
    portfolios(where: { public: true }, orderBy: date_DESC) {
      slug
      title
      category
      cover {
        url
      }
    }
  }
`;

const PROJECT_SLUGS_QUERY = /* GraphQL */ `
  query ProjectSlugs {
    portfolios(where: { public: true }, orderBy: date_DESC) {
      slug
    }
  }
`;

const PROJECT_BY_SLUG_QUERY = /* GraphQL */ `
  query ProjectBySlug($slug: String!) {
    portfolio(where: { slug: $slug }) {
      slug
      category
      title
      description
      projectUri
      portfolioStatus
      images {
        fileName
        url
      }
      details {
        raw
      }
      cover {
        url
      }
    }
  }
`;

/** Normalize a Hygraph node into the `ProjectSummary` contract. */
function toProjectSummary(portfolio: HygraphPortfolio): ProjectSummary {
  return {
    slug: portfolio.slug,
    title: portfolio.title,
    coverUrl: portfolio.cover?.url ?? '',
    category: portfolio.category ?? [],
  };
}

/**
 * List public portfolio projects, newest first.
 *
 * Pass a category to filter; `'all'` (or nothing) returns everything. Returns
 * `[]` when Hygraph is unconfigured or unreachable.
 *
 * @example
 * const all = await getProjects();
 * const web = await getProjects('Website');
 */
export async function getProjects(
  category?: string
): Promise<ProjectSummary[]> {
  const filtered = Boolean(category) && category !== 'all';

  const data = await hygraphFetch<{ portfolios: HygraphPortfolio[] }>(
    filtered ? PROJECTS_QUERY : ALL_PROJECTS_QUERY,
    filtered ? { category: [category] } : undefined,
    { tags: [projectTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return data?.portfolios?.map(toProjectSummary) ?? [];
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
 * const project = await getProjectBySlug('robocon-2025');
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
    portfolioStatus: portfolio.portfolioStatus ?? null,
    images: portfolio.images ?? [],
    details: portfolio.details ?? null,
  };
}
