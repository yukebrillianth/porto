/**
 * Shared content types. These are the contract between the CMS data layer and
 * the presentation components - agents building UI code against these do not
 * need to wait on the data layer implementation.
 */

export interface ProjectSummary {
  slug: string;
  title: string;
  coverUrl: string;
  category: string[];
}

export interface ProjectImage {
  fileName: string;
  url: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  projectUri: string | null;
  portfolioStatus: string | null;
  images: ProjectImage[];
  /** Hygraph rich-text AST, rendered with @graphcms/rich-text-react-renderer. */
  details: { raw: unknown } | null;
}

export interface PostSeries {
  name: string;
  slug: string;
}

export interface PostSummary {
  slug: string;
  title: string;
  coverUrl: string | null;
  publishedAt: string;
  brief: string;
  series: PostSeries | null;
}

export interface PostDetail extends PostSummary {
  /** Sanitized HTML from Ghost. */
  contentHtml: string;
  /** Canonical must point at this domain, never at the Ghost instance. */
  canonicalUrl: string;
  readTimeMinutes: number | null;
}
