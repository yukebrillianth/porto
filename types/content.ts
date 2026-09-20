/**
 * Shared content types. These are the contract between the CMS data layer and
 * the presentation components - agents building UI code against these do not
 * need to wait on the data layer implementation.
 */

/** Lifecycle state of a project. Mirrors the `ProjectStatus` enum in Hygraph. */
export type ProjectStatus =
  | 'SHIPPED'
  | 'IN_PROGRESS'
  | 'RESEARCH'
  | 'ARCHIVED'
  | 'CONCEPT';

export interface ProjectSummary {
  slug: string;
  title: string;
  coverUrl: string;
  category: string[];
  description?: string;
  /** Derived from the Hygraph `date` field, so there is one source of truth. */
  year: number | null;
  status: ProjectStatus | null;
  techStack: string[];
  role: string | null;
  featured: boolean;
  updatedAt?: string | null;
}

export interface ProjectImage {
  fileName: string;
  url: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  projectUri: string | null;
  repoUrl: string | null;
  /** ISO date. `null` means the project is still ongoing. */
  endDate: string | null;
  startDate: string | null;
  highlights: string[];
  images: ProjectImage[];
  /** Hygraph rich-text AST, rendered with @graphcms/rich-text-react-renderer. */
  details: { raw: unknown } | null;
}

export interface PostSeries {
  name: string;
  slug: string;
}

export type PostLanguage = 'en' | 'id';

export interface PostAuthor {
  name: string;
  slug: string;
  profileImage: string | null;
}

export interface PostTranslation {
  language: PostLanguage;
  slug: string;
  title: string;
}

export interface PostSummary {
  slug: string;
  title: string;
  coverUrl: string | null;
  coverAlt: string | null;
  publishedAt: string;
  updatedAt: string;
  brief: string;
  series: PostSeries | null;
  languages?: PostLanguage[];
}

export interface PostDetail extends PostSummary {
  /** Sanitized HTML from Ghost. */
  contentHtml: string;
  /** Canonical must point at this domain, never at the Ghost instance. */
  canonicalUrl: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  twitterImage: string | null;
  authors: PostAuthor[];
  language: PostLanguage;
  translations: PostTranslation[];
  readTimeMinutes: number | null;
}
