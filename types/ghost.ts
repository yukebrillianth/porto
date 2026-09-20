/**
 * Raw Ghost Content API shapes. These mirror the JSON that
 * `{GHOST_URL}/ghost/api/content/...` returns and are consumed only by
 * `lib/ghost.ts` and `services/posts.ts` - components see `types/content.ts`
 * instead.
 */

/** A Ghost tag, as returned by `/tags/` or by `include=tags` on a post. */
export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feature_image: string | null;
  visibility: string;
  url?: string;
}

/** A Ghost post, as returned by `/posts/` with `formats=html`. */
export interface GhostPost {
  id: string;
  uuid?: string;
  slug: string;
  title: string;
  html?: string | null;
  feature_image: string | null;
  feature_image_alt?: string | null;
  featured?: boolean;
  published_at: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  excerpt?: string | null;
  custom_excerpt?: string | null;
  canonical_url?: string | null;
  reading_time?: number | null;
  tags?: GhostTag[];
  primary_tag?: GhostTag | null;
  url?: string;
}

/** `meta.pagination`, present on every browse response. */
export interface GhostPagination {
  page: number;
  limit: number | string;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
}

/** Envelope shared by every browse endpoint. */
export interface GhostBrowseMeta {
  pagination: GhostPagination;
}

/** `GET /ghost/api/content/posts/` and `/posts/slug/{slug}/`. */
export interface GhostPostsResponse {
  posts: GhostPost[];
  meta?: GhostBrowseMeta;
}

/** `GET /ghost/api/content/tags/`. */
export interface GhostTagsResponse {
  tags: GhostTag[];
  meta?: GhostBrowseMeta;
}
