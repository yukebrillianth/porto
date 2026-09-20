import { siteConfig } from '@/constants';
import { ghostFetch, postTags } from '@/lib/ghost';
import type {
  PostDetail,
  PostLanguage,
  PostSeries,
  PostSummary,
  PostTranslation,
} from '@/types/content';
import type {
  GhostPost,
  GhostPostsResponse,
  GhostTag,
  GhostTagsResponse,
} from '@/types/ghost';

/** Fields every list view needs. Kept tight so responses stay small. */
const SUMMARY_FIELDS = [
  'id',
  'slug',
  'title',
  'feature_image',
  'feature_image_alt',
  'published_at',
  'updated_at',
  'excerpt',
  'custom_excerpt',
  'meta_title',
  'meta_description',
  'og_image',
].join(',');

/** Newest first, matching the previous blog feed order. */
const NEWEST_FIRST = 'published_at desc';

/**
 * Ceiling for the in-memory search corpus and for slug enumeration. Ghost
 * accepts `limit=all`, but an explicit cap keeps a runaway publication from
 * blowing up the ISR payload.
 */
const MAX_LIMIT = 100;

/** Clamp a caller-supplied page size into a sane range. */
function clampLimit(limit: number): number {
  return Math.min(Math.max(1, Math.trunc(limit)), MAX_LIMIT);
}

/**
 * Ghost has no "series" concept, so a post's `primary_tag` stands in for one.
 * Internal tags (slug prefixed with `hash-`) are Ghost's private metadata and
 * are never shown to readers.
 */
function toSeries(tag: GhostTag | null | undefined): PostSeries | null {
  if (!tag || tag.slug.startsWith('hash-')) return null;

  return { name: tag.name, slug: tag.slug };
}

function toLanguage(post: GhostPost): PostLanguage {
  const hasEnTag = post.tags?.some((tag) =>
    /^(lang-en|en|#en)$/i.test(tag.slug)
  );
  if (hasEnTag) return 'en';

  const hasIdTag = post.tags?.some((tag) =>
    /^(lang-id|id|#id)$/i.test(tag.slug)
  );
  if (hasIdTag) return 'id';

  if (post.slug.endsWith('-en')) return 'en';

  return 'id';
}

async function resolveTranslations(
  post: GhostPost
): Promise<PostTranslation[]> {
  const currentLang = toLanguage(post);
  const translations: PostTranslation[] = [
    { language: currentLang, slug: post.slug, title: post.title },
  ];

  const candidateSlug =
    currentLang === 'en' ? post.slug.replace(/-en$/, '') : `${post.slug}-en`;

  if (candidateSlug !== post.slug) {
    try {
      const partnerData = await ghostFetch<GhostPostsResponse>(
        `posts/slug/${encodeURIComponent(candidateSlug)}`,
        { fields: 'id,slug,title', include: 'tags' },
        { tags: [postTags.bySlug(candidateSlug)] }
      );

      const partner = partnerData?.posts?.[0];
      if (partner) {
        const partnerLang = toLanguage(partner);
        if (partnerLang !== currentLang) {
          translations.push({
            language: partnerLang,
            slug: partner.slug,
            title: partner.title,
          });
        }
      }
    } catch {
      // Partner translation does not exist yet.
    }
  }

  return translations;
}

/** Normalize a Ghost post into the `PostSummary` contract. */
function toPostSummary(post: GhostPost): PostSummary {
  const primaryTag =
    post.primary_tag ?? post.tags?.find((tag) => !tag.slug.startsWith('hash-'));

  return {
    slug: post.slug,
    title: post.title,
    coverUrl: post.feature_image ?? null,
    coverAlt: post.feature_image_alt ?? null,
    publishedAt: post.published_at ?? post.created_at ?? '',
    updatedAt: post.updated_at ?? post.published_at ?? post.created_at ?? '',
    brief: post.custom_excerpt ?? post.excerpt ?? '',
    series: toSeries(primaryTag),
  };
}

/**
 * Deduplicate translated pairs so that a post with both Indonesian and English
 * versions appears once in the main list, with its available languages recorded.
 */
function deduplicatePosts(posts: GhostPost[]): PostSummary[] {
  const allSlugs = new Set(posts.map((post) => post.slug));
  const summaries: PostSummary[] = [];

  for (const post of posts) {
    if (post.slug.endsWith('-en')) {
      const baseSlug = post.slug.replace(/-en$/, '');
      if (allSlugs.has(baseSlug)) {
        // Skip separate English card when the base post is in the feed.
        continue;
      }
      const summary = toPostSummary(post);
      summary.languages = ['en'];
      summaries.push(summary);
      continue;
    }

    const summary = toPostSummary(post);
    const hasEnglish = allSlugs.has(`${post.slug}-en`);
    summary.languages = hasEnglish ? ['id', 'en'] : ['id'];
    summaries.push(summary);
  }

  return summaries;
}

/**
 * Latest published posts, newest first.
 *
 * Returns `[]` when Ghost is unreachable or unconfigured, so the blog page
 * still renders before the CMS exists.
 *
 * @example
 * const posts = await getPosts();
 * const three = await getPosts(3);
 */
export async function getPosts(first = 9): Promise<PostSummary[]> {
  try {
    const data = await ghostFetch<GhostPostsResponse>(
      'posts',
      {
        limit: clampLimit(first),
        order: NEWEST_FIRST,
        include: 'tags,authors',
        fields: SUMMARY_FIELDS,
      },
      { tags: [postTags.all] }
    );

    return data?.posts ? deduplicatePosts(data.posts) : [];
  } catch (error) {
    console.warn('[posts] getPosts failed:', error);
    return [];
  }
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
  try {
    const data = await ghostFetch<GhostPostsResponse>(
      'posts',
      { limit: MAX_LIMIT, order: NEWEST_FIRST, fields: 'id,slug' },
      { tags: [postTags.all] }
    );

    return data?.posts?.map((post) => post.slug) ?? [];
  } catch (error) {
    console.warn('[posts] getPostSlugs failed:', error);
    return [];
  }
}

/**
 * Fetch one post by slug, or `null` when it does not exist.
 *
 * Reads Ghost's `/posts/slug/{slug}/` endpoint. `canonicalUrl` deliberately
 * points at this domain rather than at the Ghost instance, so search authority
 * accrues here instead of on the CMS host - the same SEO rule that applied
 * before the migration.
 *
 * @example
 * const post = await getPostBySlug('building-a-ros-bridge');
 * post?.canonicalUrl; // 'https://yukebrillianth.my.id/blog/building-a-ros-bridge'
 */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const data = await ghostFetch<GhostPostsResponse>(
      `posts/slug/${encodeURIComponent(slug)}`,
      {
        include: 'tags,authors',
        formats: 'html',
        fields: [
          'id',
          'slug',
          'title',
          'html',
          'feature_image',
          'feature_image_alt',
          'published_at',
          'updated_at',
          'created_at',
          'excerpt',
          'custom_excerpt',
          'meta_title',
          'meta_description',
          'og_image',
          'twitter_image',
          'canonical_url',
          'reading_time',
        ].join(','),
      },
      { tags: [postTags.all, postTags.bySlug(slug)] }
    );

    const post = data?.posts?.[0];

    if (!post) return null;

    return {
      ...toPostSummary(post),
      contentHtml: post.html ?? '',
      // Ghost's canonical_url is author-controlled and may point to an old
      // CMS URL. This site is the canonical publisher for every local post.
      canonicalUrl: `${siteConfig.url}/blog/${slug}`,
      metaTitle: post.meta_title ?? null,
      metaDescription: post.meta_description ?? null,
      ogImage: post.og_image ?? post.feature_image ?? null,
      twitterImage:
        post.twitter_image ?? post.og_image ?? post.feature_image ?? null,
      authors: (
        post.authors ?? (post.primary_author ? [post.primary_author] : [])
      ).map((author) => ({
        name: author.name,
        slug: author.slug,
        profileImage: author.profile_image ?? null,
      })),
      language: toLanguage(post),
      translations: await resolveTranslations(post),
      readTimeMinutes: post.reading_time ?? null,
    };
  } catch (error) {
    console.warn(`[posts] getPostBySlug(${slug}) failed:`, error);
    return null;
  }
}

/**
 * All public tags, for blog filtering.
 *
 * Ghost has no "series" primitive, so tags are the natural equivalent and are
 * returned under the existing `PostSeries` type - the UI stays unchanged.
 * Internal tags (`hash-*`) and tags with no published posts are dropped.
 *
 * @example
 * const series = await getSeries(); // [{ name: 'ROS Notes', slug: 'ros' }]
 */
export async function getSeries(): Promise<PostSeries[]> {
  try {
    const data = await ghostFetch<GhostTagsResponse>(
      'tags',
      {
        limit: MAX_LIMIT,
        order: 'name asc',
        filter: 'visibility:public',
        fields: 'id,name,slug,visibility',
      },
      { tags: [postTags.all] }
    );

    return (
      data?.tags
        ?.filter((tag) => !tag.slug.startsWith('hash-'))
        .map((tag) => ({ name: tag.name, slug: tag.slug })) ?? []
    );
  } catch (error) {
    console.warn('[posts] getSeries failed:', error);
    return [];
  }
}

/**
 * Search across the blog by title, excerpt, and tag name.
 *
 * The Ghost Content API has no full-text search endpoint. The two options are
 * an NQL `filter` such as `title:~'term'`, or fetching the feed once and
 * filtering in memory. This uses the in-memory route, deliberately:
 *
 * 1. NQL's `~` operator only matches columns Ghost actually stores. `excerpt`
 *    is derived from the post body at render time, so it is not filterable -
 *    an NQL search would silently miss any term that appears in the summary
 *    but not the title.
 * 2. An NQL query puts the search term in the URL, which makes every distinct
 *    term its own Next.js fetch-cache entry. Filtering in memory reuses the
 *    one cached `post` read that the feed already warmed, so search costs no
 *    extra requests and invalidates on the same webhook.
 *
 * This is bounded by `MAX_LIMIT` posts. If the publication ever outgrows that,
 * swap in Ghost's own `sodo-search` index rather than paginating here.
 *
 * @example
 * const results = await searchPosts('robotics');
 */
export async function searchPosts(
  query: string,
  first = 9
): Promise<PostSummary[]> {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) return [];

  try {
    const data = await ghostFetch<GhostPostsResponse>(
      'posts',
      {
        limit: MAX_LIMIT,
        order: NEWEST_FIRST,
        include: 'tags,authors',
        fields: SUMMARY_FIELDS,
      },
      { tags: [postTags.all] }
    );

    const posts = data?.posts ?? [];

    const matched = posts.filter((post) => {
      const haystack = [
        post.title,
        post.custom_excerpt ?? '',
        post.excerpt ?? '',
        ...(post.tags?.map((tag) => tag.name) ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(trimmed);
    });

    return deduplicatePosts(matched).slice(0, clampLimit(first));
  } catch (error) {
    console.warn('[posts] searchPosts failed:', error);
    return [];
  }
}
