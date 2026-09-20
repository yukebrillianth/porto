import { REVALIDATE_SECONDS, siteConfig } from '@/constants';
import {
  flattenEdges,
  getPublicationId,
  HASHNODE_HOST,
  hashnodeFetch,
  postTags,
  type HashnodeConnection,
} from '@/lib/hashnode';
import type { PostDetail, PostSeries, PostSummary } from '@/types/content';

/** Raw `Post` node as returned by Hashnode. */
interface HashnodePost {
  id: string;
  slug: string;
  title: string;
  coverImage: { url: string } | null;
  publishedAt: string;
  brief: string;
  series: PostSeries | null;
  content?: { html: string } | null;
  readTimeInMinutes?: number | null;
}

const POST_FIELDS = /* GraphQL */ `
  id
  slug
  title
  coverImage {
    url
  }
  publishedAt
  brief
  series {
    name
    slug
  }
`;

const POSTS_QUERY = /* GraphQL */ `
  query Posts($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            ${POST_FIELDS}
          }
        }
      }
    }
  }
`;

const POST_SLUGS_QUERY = /* GraphQL */ `
  query PostSlugs($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  }
`;

const POST_BY_SLUG_QUERY = /* GraphQL */ `
  query PostBySlug($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        ${POST_FIELDS}
        readTimeInMinutes
        content {
          html
        }
      }
    }
  }
`;

const SERIES_QUERY = /* GraphQL */ `
  query Series($host: String!, $first: Int!) {
    publication(host: $host) {
      seriesList(first: $first) {
        edges {
          node {
            name
            slug
          }
        }
      }
    }
  }
`;

const SEARCH_POSTS_QUERY = /* GraphQL */ `
  query SearchPosts($first: Int!, $query: String!, $publicationId: ObjectId!) {
    searchPostsOfPublication(
      first: $first
      filter: { query: $query, publicationId: $publicationId }
    ) {
      edges {
        node {
          ${POST_FIELDS}
        }
      }
    }
  }
`;

/**
 * Hashnode rejects `first` above 20 on its connections, so this is both the
 * page size cap and the ceiling used when enumerating for static generation.
 */
const MAX_FIRST = 20;

/** Clamp a caller-supplied page size into Hashnode's accepted range. */
function clampFirst(first: number): number {
  return Math.min(Math.max(1, Math.trunc(first)), MAX_FIRST);
}

/** Normalize a Hashnode node into the `PostSummary` contract. */
function toPostSummary(post: HashnodePost): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    coverUrl: post.coverImage?.url ?? null,
    publishedAt: post.publishedAt,
    brief: post.brief,
    series: post.series ?? null,
  };
}

/**
 * Latest published posts, newest first.
 *
 * `first` is clamped to Hashnode's maximum of 20. Returns `[]` when Hashnode
 * is unreachable, so the blog page still renders.
 *
 * @example
 * const posts = await getPosts();
 * const three = await getPosts(3);
 */
export async function getPosts(first = 9): Promise<PostSummary[]> {
  const data = await hashnodeFetch<{
    publication: { posts: HashnodeConnection<HashnodePost> } | null;
  }>(
    POSTS_QUERY,
    { host: HASHNODE_HOST, first: clampFirst(first) },
    { tags: [postTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return flattenEdges(data?.publication?.posts).map(toPostSummary);
}

/**
 * Every post slug - for `generateStaticParams`.
 *
 * @example
 * export async function generateStaticParams() {
 *   const slugs = await getPostSlugs();
 *   return slugs.map((slug) => ({ slug }));
 * }
 */
export async function getPostSlugs(): Promise<string[]> {
  const data = await hashnodeFetch<{
    publication: { posts: HashnodeConnection<{ slug: string }> } | null;
  }>(
    POST_SLUGS_QUERY,
    { host: HASHNODE_HOST, first: MAX_FIRST },
    { tags: [postTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return flattenEdges(data?.publication?.posts).map((post) => post.slug);
}

/**
 * Fetch one post by slug, or `null` when it does not exist.
 *
 * `canonicalUrl` deliberately points at this domain rather than the Hashnode
 * URL, so search authority accrues here instead of `*.hashnode.dev`.
 *
 * @example
 * const post = await getPostBySlug('building-a-ros-bridge');
 * post?.canonicalUrl; // 'https://…/blog/building-a-ros-bridge'
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const data = await hashnodeFetch<{
    publication: { post: HashnodePost | null } | null;
  }>(
    POST_BY_SLUG_QUERY,
    { host: HASHNODE_HOST, slug },
    {
      tags: [postTags.all, postTags.bySlug(slug)],
      revalidate: REVALIDATE_SECONDS,
    }
  );

  const post = data?.publication?.post;

  if (!post) return null;

  return {
    ...toPostSummary(post),
    contentHtml: post.content?.html ?? '',
    canonicalUrl: `${siteConfig.url}/blog/${slug}`,
    readTimeMinutes: post.readTimeInMinutes ?? null,
  };
}

/**
 * All series in the publication, for blog filtering.
 *
 * @example
 * const series = await getSeries(); // [{ name: 'ROS Notes', slug: 'ros' }]
 */
export async function getSeries(): Promise<PostSeries[]> {
  const data = await hashnodeFetch<{
    publication: { seriesList: HashnodeConnection<PostSeries> } | null;
  }>(
    SERIES_QUERY,
    { host: HASHNODE_HOST, first: MAX_FIRST },
    { tags: [postTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return flattenEdges(data?.publication?.seriesList);
}

/**
 * Full-text search across the publication's posts.
 *
 * Results are cached like any other read - search terms are part of the fetch
 * cache key, so repeated queries do not burn quota.
 *
 * @example
 * const results = await searchPosts('robotics');
 */
export async function searchPosts(
  query: string,
  first = 9
): Promise<PostSummary[]> {
  const trimmed = query.trim();

  if (!trimmed) return [];

  const publicationId = await getPublicationId();

  if (!publicationId) {
    console.warn('[hashnode] search skipped - publication id unavailable');
    return [];
  }

  const data = await hashnodeFetch<{
    searchPostsOfPublication: HashnodeConnection<HashnodePost>;
  }>(
    SEARCH_POSTS_QUERY,
    { first: clampFirst(first), query: trimmed, publicationId },
    { tags: [postTags.all], revalidate: REVALIDATE_SECONDS }
  );

  return flattenEdges(data?.searchPostsOfPublication).map(toPostSummary);
}
