import { siteConfig } from '@/constants';
import { env } from '@/lib/env';
import { gqlFetch } from '@/lib/hygraph';

/** Public Hashnode GraphQL gateway. No authentication required for reads. */
export const HASHNODE_ENDPOINT = 'https://gql.hashnode.com';

/** The publication we read posts from, e.g. `yukebrillianth.hashnode.dev`. */
export const HASHNODE_HOST = siteConfig.hashnodeHost;

/**
 * Cache tags for blog posts. Namespaced so the revalidate webhook can bust a
 * single post without dropping the whole feed.
 *
 * @example
 * postTags.all // 'post'
 * postTags.bySlug('building-a-ros-bridge') // 'post:building-a-ros-bridge'
 */
export const postTags = {
  all: 'post',
  bySlug: (slug: string) => `post:${slug}`,
} as const;

/** Hashnode wraps every collection in a Relay-style connection. */
export interface HashnodeConnection<T> {
  edges: { node: T }[];
}

const PUBLICATION_ID_QUERY = /* GraphQL */ `
  query PublicationId($host: String!) {
    publication(host: $host) {
      id
    }
  }
`;

/**
 * Query the public Hashnode API.
 *
 * Network and schema failures are swallowed into `null` so a blog outage
 * degrades to an empty feed instead of breaking the build.
 *
 * @example
 * const data = await hashnodeFetch<{ publication: { id: string } }>(
 *   PUBLICATION_ID_QUERY,
 *   { host: HASHNODE_HOST },
 *   { tags: [postTags.all] }
 * );
 */
export async function hashnodeFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { tags?: string[]; revalidate?: number }
): Promise<T | null> {
  try {
    return await gqlFetch<T>(HASHNODE_ENDPOINT, query, variables, opts);
  } catch (error) {
    console.warn('[hashnode] query failed:', error);
    return null;
  }
}

/**
 * Resolve the publication id required by `searchPostsOfPublication`.
 *
 * Prefers `HASHNODE_PUBLICATION_ID` when set (one fewer round trip per search)
 * and otherwise looks it up from the host, cached under the `post` tag.
 *
 * @example
 * const id = await getPublicationId(); // 'a1b2c3d4e5f6a7b8c9d0e1f2'
 */
export async function getPublicationId(): Promise<string | null> {
  if (env.HASHNODE_PUBLICATION_ID) {
    return env.HASHNODE_PUBLICATION_ID;
  }

  const data = await hashnodeFetch<{ publication: { id: string } | null }>(
    PUBLICATION_ID_QUERY,
    { host: HASHNODE_HOST },
    { tags: [postTags.all] }
  );

  return data?.publication?.id ?? null;
}

/**
 * Flatten a Relay connection into a plain array. Components must never see
 * `edges` or `node`.
 *
 * @example
 * flattenEdges({ edges: [{ node: { slug: 'a' } }] }) // [{ slug: 'a' }]
 */
export function flattenEdges<T>(
  connection: HashnodeConnection<T> | null | undefined
): T[] {
  return connection?.edges?.map((edge) => edge.node) ?? [];
}
