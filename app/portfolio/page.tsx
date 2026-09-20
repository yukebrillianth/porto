import { Metadata } from 'next';

import { generateMetadata } from '@/lib/seo';
import { getProjects } from '@/services/projects';

import PortfolioContainer from './container';

// Must be a literal — Next.js statically analyses this value.
export const revalidate = 3600;

export const metadata: Metadata = generateMetadata({
  title: 'Portfolio',
  description:
    'Selected work across full-stack applications, distributed systems, and autonomous robotics.',
  url: 'https://yukebrillianth.my.id/portfolio',
});

type PortfolioPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

/**
 * The fetch stays on the server: the category lives in the URL, so each
 * category is its own cacheable, shareable, server-rendered response. The
 * client container only reads and writes those params.
 */
export default async function PortfolioPage({
  searchParams,
}: PortfolioPageProps) {
  const { category = 'all', q = '' } = await searchParams;

  const projects = await getProjects(category === 'all' ? undefined : category);

  const query = q.trim().toLowerCase();
  const visible = query
    ? projects.filter((project) => project.title.toLowerCase().includes(query))
    : projects;

  return (
    <PortfolioContainer projects={visible} category={category} query={q} />
  );
}
