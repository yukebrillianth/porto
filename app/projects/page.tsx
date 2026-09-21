import type { Metadata } from 'next';

import { siteConfig } from '@/constants';
import { collectionPageJsonLd, generateMetadata } from '@/lib/seo';
import { getProjects } from '@/services/projects';

import ProjectsContainer from './container';

// Must be a literal - Next.js statically analyses this value.
export const revalidate = 3600;

export const metadata: Metadata = generateMetadata({
  title: 'Projects',
  description:
    'Selected work across full-stack applications, distributed systems, and autonomous robotics.',
  url: `${siteConfig.url}/projects`,
});

type ProjectsPageProps = {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
};

/** Cards per page. Keeps the 3-column grid filled with whole rows. */
const PAGE_SIZE = 9;

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { category = 'all', q = '', page = '1' } = await searchParams;

  const projects = await getProjects(category === 'all' ? undefined : category);

  const query = q.trim().toLowerCase();
  const matched = query
    ? projects.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.techStack.some((tech) => tech.toLowerCase().includes(query))
      )
    : projects;

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, Number.parseInt(page, 10) || 1),
    totalPages
  );

  const visible = matched.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const collection = collectionPageJsonLd({
    name: 'Projects',
    description:
      'Selected work across full-stack applications, distributed systems, and autonomous robotics.',
    path: '/projects',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />
      <ProjectsContainer
        projects={visible}
        category={category}
        query={q}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={matched.length}
      />
    </>
  );
}
