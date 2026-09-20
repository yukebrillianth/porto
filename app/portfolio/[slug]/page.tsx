import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { generateMetadata as buildMetadata } from '@/lib/seo';
import { getProjectBySlug, getProjectSlugs } from '@/services/projects';

import ProjectContainer from './container';

// Must be a literal — Next.js statically analyses this value.
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
 * would collide with Next's reserved dynamic export — hence the alias.
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
    url: `https://yukebrillianth.my.id/portfolio/${project.slug}`,
    type: 'article',
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return <ProjectContainer project={project} />;
}
