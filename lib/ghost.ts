import { REVALIDATE_SECONDS } from '@/constants';
import { env } from '@/lib/env';

/**
 * Minimum Ghost API version this client targets. Ghost negotiates with the
 * `Accept-Version: v{major}.{minor}` header, where the value is the oldest
 * version the integration understands - `v5.0` is honoured by every current
 * self-hosted release, including 6.x.
 */
const GHOST_API_VERSION = 'v5.0';

/** Query params for a Content API browse or read request. */
export type GhostParams = Record<string, string | number | undefined>;

/**
 * Options accepted by {@link ghostFetch}. Deliberately narrow: this layer only
 * ever reads, so there is no place for `cache: 'no-store'` or `method`.
 */
type GhostFetchOptions = {
  /** Cache tags used by the revalidate webhook, e.g. `post:some-slug`. */
  tags?: string[];
  /** ISR window in seconds. Defaults to `REVALIDATE_SECONDS`. */
  revalidate?: number;
};

/**
 * Cache tags for blog posts. Namespaced so the revalidate webhook can bust a
 * single post without dropping the whole feed. Kept identical to the pre-Ghost
 * tags so existing webhooks and manual curls keep working.
 *
 * @example
 * postTags.all // 'post'
 * postTags.bySlug('building-a-ros-bridge') // 'post:building-a-ros-bridge'
 */
export const postTags = {
  all: 'post',
  bySlug: (slug: string) => `post:${slug}`,
} as const;

/** Set once we have complained about missing credentials, to avoid log spam. */
let hasWarnedAboutConfig = false;

/**
 * Whether the Ghost Content API credentials are present. When they are not,
 * the data layer degrades to empty results so the site still builds and
 * renders before a Ghost instance exists.
 *
 * @example
 * if (!isGhostConfigured()) return [];
 */
export function isGhostConfigured(): boolean {
  return Boolean(env.GHOST_URL && env.GHOST_CONTENT_KEY);
}

/**
 * Build a fully qualified Content API URL.
 *
 * Ghost's shape is `{GHOST_URL}/ghost/api/content/{resource}/?key={key}`, with
 * every other option passed as a query param. Trailing slashes on `GHOST_URL`
 * are normalized away so both forms of the env var work.
 *
 * @example
 * buildContentUrl('posts', { limit: 9, include: 'tags' });
 * // 'https://cms.example.com/ghost/api/content/posts/?key=abc&limit=9&…'
 */
export function buildContentUrl(
  resource: string,
  params: GhostParams = {}
): string | null {
  if (!env.GHOST_URL || !env.GHOST_CONTENT_KEY) return null;

  const base = env.GHOST_URL.replace(/\/+$/, '');
  const path = resource.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${base}/ghost/api/content/${path}/`);

  url.searchParams.set('key', env.GHOST_CONTENT_KEY);

  for (const [name, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(name, String(value));
  }

  return url.toString();
}

/**
 * Read from the Ghost Content API.
 *
 * Ghost is REST + JSON rather than GraphQL, so `gqlFetch` does not apply.
 * Every read goes through Next.js ISR - `next: { revalidate, tags }` - because
 * that is the entire caching strategy here: Ghost is hit on publish, not once
 * per visitor. Never pass `cache: 'no-store'`.
 *
 * Returns `null` when Ghost is unconfigured, unreachable, or answers 404, so
 * an un-provisioned CMS degrades to an empty page instead of a failed build.
 * A reachable server answering with any other non-ok status throws, so real
 * misconfiguration (bad key, wrong version) stays visible - callers in
 * `services/` catch it.
 *
 * @example
 * const data = await ghostFetch<GhostPostsResponse>(
 *   'posts',
 *   { limit: 9, include: 'tags', order: 'published_at desc' },
 *   { tags: [postTags.all] }
 * );
 * data?.posts.length; // 9
 */
export async function ghostFetch<T>(
  resource: string,
  params: GhostParams = {},
  opts?: GhostFetchOptions
): Promise<T | null> {
  const url = buildContentUrl(resource, params);

  if (!url) {
    if (!hasWarnedAboutConfig) {
      hasWarnedAboutConfig = true;
      console.warn(
        '[ghost] GHOST_URL or GHOST_CONTENT_KEY is not set - returning ' +
          'empty content. Set both in .env.local to enable the blog.'
      );
    }
    return null;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'Accept-Version': GHOST_API_VERSION,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: opts?.revalidate ?? REVALIDATE_SECONDS,
        tags: opts?.tags ?? [],
      },
    });
  } catch (error) {
    // Network-level failure: DNS, TLS, refused connection. The Ghost box may
    // simply not exist yet, so degrade instead of breaking the render.
    console.warn(`[ghost] request to /${resource}/ failed:`, error);
    return null;
  }

  // A missing post or tag is a normal outcome, not a misconfiguration.
  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `Ghost Content API request to /${resource}/ failed: ` +
        `${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}
