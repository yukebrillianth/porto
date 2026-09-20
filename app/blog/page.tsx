import type { Metadata } from 'next';

import { siteConfig } from '@/constants';
import {
  collectionPageJsonLd,
  generateMetadata as buildMetadata,
  websiteJsonLd,
} from '@/lib/seo';
import { getPosts, getSeries, searchPosts } from '@/services/posts';

import BlogContainer from './container';

/** Matches REVALIDATE_SECONDS; Next requires a statically analyzable literal. */
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description:
    'Notes on robotics, distributed systems, networking and full-stack engineering - written while building them.',
  url: `${siteConfig.url}/blog`,
});

/** How many posts the index pulls per render. Kept modest for quota discipline. */
const POSTS_PER_PAGE = 24;

type BlogPageProps = {
  searchParams: Promise<{ q?: string; series?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { q, series: seriesSlug } = await searchParams;
  const query = q?.trim() ?? '';

  const [posts, series] = await Promise.all([
    query ? searchPosts(query, POSTS_PER_PAGE) : getPosts(POSTS_PER_PAGE),
    getSeries(),
  ]);

  // The posts API exposes no series filter, so narrow the fetched page here.
  const visiblePosts = seriesSlug
    ? posts.filter((post) => post.series?.slug === seriesSlug)
    : posts;

  const collection = collectionPageJsonLd({
    name: "Yuke's Personal Blog",
    description:
      'Notes on robotics, distributed systems, networking and full-stack engineering.',
    path: '/blog',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <BlogContainer
        posts={visiblePosts}
        series={series}
        query={query}
        activeSeriesSlug={seriesSlug}
      />
    </>
  );
}
