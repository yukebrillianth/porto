import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/constants';
import {
  breadcrumbJsonLd,
  generateMetadata as buildMetadata,
  projectJsonLd,
} from '@/lib/seo';
import { getProjectBySlug, getProjectSlugs } from '@/services/projects';

import ProjectContainer from './container';

// Must be a literal - Next.js statically analyses this value.
export const revalidate = 3600;

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();

  return slugs.map((slug) => ({ slug }));
}

/**
 * `lib/seo.ts` exports a plain helper literally named `generateMetadata`, which
 * would collide with Next's reserved dynamic export - hence the alias.
 */
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return buildMetadata({ title: 'Project not found', noIndex: true });
  }

  return buildMetadata({
    title: project.title,
    description: project.description,
    image: project.coverUrl,
    url: `${siteConfig.url}/projects/${project.slug}`,
    type: 'article',
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const url = `${siteConfig.url}/projects/${project.slug}`;
  const projectSchema = projectJsonLd({
    title: project.title,
    description: project.description,
    url,
    image: project.coverUrl,
    year: project.year,
    techStack: project.techStack,
    repoUrl: project.repoUrl,
  });
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: project.title },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ProjectContainer project={project} />
    </>
  );
}
