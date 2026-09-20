import { REVALIDATE_SECONDS } from '@/constants';
import { env } from '@/lib/env';

/**
 * Options accepted by {@link gqlFetch}. Deliberately narrow: this layer only
 * ever reads, so there is no place for `cache: 'no-store'` or `method`.
 */
type GqlFetchOptions = {
  /** Cache tags used by the revalidate webhook. Namespaced, e.g. `post:slug`. */
  tags?: string[];
  /** ISR window in seconds. Defaults to `REVALIDATE_SECONDS`. */
  revalidate?: number;
  /** Extra request headers, e.g. `Authorization`. */
  headers?: Record<string, string>;
};

/** A single error entry as returned by a spec-compliant GraphQL server. */
interface GraphQLError {
  message: string;
  path?: (string | number)[];
}

/** The GraphQL over HTTP envelope. */
interface GraphQLResponse<T> {
  data?: T | null;
  errors?: GraphQLError[];
}

/**
 * Cache tags for portfolio projects. Namespaced so the revalidate webhook can
 * bust one project without dropping the whole collection.
 *
 * @example
 * projectTags.all // 'project'
 * projectTags.bySlug('robocon-2025') // 'project:robocon-2025'
 */
export const projectTags = {
  all: 'project',
  bySlug: (slug: string) => `project:${slug}`,
} as const;

/**
 * Minimal GraphQL client over native `fetch`.
 *
 * We do not use `GraphQLClient` from `graphql-request` because it gives no way
 * to set per-request Next.js cache options, and ISR is the whole point here:
 * the CMS should be hit on publish, not once per visitor. Never pass
 * `cache: 'no-store'` - reads are always cached.
 *
 * @example
 * const data = await gqlFetch<{ portfolios: { slug: string }[] }>(
 *   'https://ap-southeast-2.cdn.hygraph.com/content/abc123/master',
 *   'query { portfolios { slug } }',
 *   undefined,
 *   { tags: ['project'], revalidate: 3_600 }
 * );
 */
export async function gqlFetch<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
  opts?: GqlFetchOptions
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers,
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: opts?.revalidate ?? REVALIDATE_SECONDS,
      tags: opts?.tags ?? [],
    },
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL request to ${endpoint} failed: ` +
        `${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    const detail = json.errors.map((error) => error.message).join('; ');
    throw new Error(`GraphQL errors from ${endpoint}: ${detail}`);
  }

  if (json.data == null) {
    throw new Error(`GraphQL response from ${endpoint} contained no data`);
  }

  return json.data;
}

/**
 * Whether the Hygraph credentials are present. When they are not, the data
 * layer degrades to empty results so the site still builds and renders.
 *
 * @example
 * if (!isHygraphConfigured()) return [];
 */
export function isHygraphConfigured(): boolean {
  return Boolean(env.HYGRAPH_ENDPOINT);
}

/**
 * Query Hygraph for portfolio content.
 *
 * Returns `null` instead of throwing when Hygraph is unconfigured or
 * unreachable, so an un-provisioned CMS degrades to an empty page rather than
 * a failed build. The token is server-only and never reaches the client.
 *
 * @example
 * const data = await hygraphFetch<{ portfolios: Portfolio[] }>(
 *   PROJECTS_QUERY,
 *   undefined,
 *   { tags: [projectTags.all] }
 * );
 */
export async function hygraphFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: GqlFetchOptions
): Promise<T | null> {
  const endpoint = env.HYGRAPH_ENDPOINT;

  if (!endpoint) {
    console.warn(
      '[hygraph] HYGRAPH_ENDPOINT is not set - returning empty content. ' +
        'Set it in .env.local to enable portfolio projects.'
    );
    return null;
  }

  const headers: Record<string, string> = { ...opts?.headers };

  if (env.HYGRAPH_TOKEN) {
    headers.Authorization = `Bearer ${env.HYGRAPH_TOKEN}`;
  }

  try {
    return await gqlFetch<T>(endpoint, query, variables, {
      ...opts,
      headers,
    });
  } catch (error) {
    console.warn('[hygraph] query failed:', error);
    return null;
  }
}
