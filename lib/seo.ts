import type { Metadata } from 'next';

import { siteConfig, socials } from '@/constants';

/** The brand as it reads in a browser tab. */
const BRAND = 'Yuke Brilliant';
const TWITTER_HANDLE = '@YukeBrillianth';

export type SeoProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  languages?: Record<string, string>;
  noIndex?: boolean;
};

type JsonLdImage = {
  '@type': 'ImageObject';
  url: string;
  width: number;
  height: number;
  caption?: string;
};

type JsonLdContext<T extends Record<string, unknown>> = T & {
  '@context': 'https://schema.org';
};

const absoluteUrl = (value: string) =>
  value.startsWith('http') ? value : `${siteConfig.url}${value}`;

/** Stable node ids. Repeating a full object makes Google read one entity as
 *  several; referencing one id makes the graph collapse onto a single node. */
const PERSON_ID = `${siteConfig.url}/#person`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

/** The site as a reference rather than a copy, for `isPartOf`. */
const webSiteRef = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
} as const;

const imageObject = (
  image: string,
  caption = siteConfig.name,
  width = 1200,
  height = 630
): JsonLdImage => ({
  '@type': 'ImageObject',
  url: absoluteUrl(image),
  width,
  height,
  caption,
});

const sameAs = socials.map((social) => social.href);

/** The person and site identity shared by every structured-data document. */
export const personJsonLd = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: siteConfig.name,
  url: siteConfig.url,
  jobTitle: siteConfig.role,
  homeLocation: {
    '@type': 'Place',
    name: siteConfig.location,
  },
  sameAs,
} as const;

/**
 * Generate complete Next metadata while keeping all canonical URLs on the
 * public Next.js origin. Ghost is a CMS origin, never the public authority.
 *
 * @example
 * export const metadata = generateMetadata({
 *   title: 'Blog',
 *   description: 'Notes on robotics and distributed systems.',
 *   url: `${siteConfig.url}/blog`,
 * });
 */
export function generateMetadata({
  title,
  description = siteConfig.description,
  keywords = [...siteConfig.keywords],
  image = siteConfig.ogImage,
  imageAlt = siteConfig.name,
  url = siteConfig.url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  languages,
  noIndex = false,
}: SeoProps = {}): Metadata {
  const metaTitle = title ? `${title} | ${BRAND}` : siteConfig.title;
  const canonical = new URL(url, siteConfig.url).toString();
  const socialImage = absoluteUrl(image);

  return {
    metadataBase: new URL(siteConfig.url),
    title: { absolute: metaTitle },
    description,
    keywords,
    authors: authors?.map((author) => ({ name: author })) ?? [
      { name: siteConfig.creator },
    ],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    alternates: {
      canonical,
      ...(languages && Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url: canonical,
      title: metaTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description,
      images: [socialImage],
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * JSON-LD for the public site's root identity.
 *
 * No `potentialAction`/`SearchAction` here: Google retired the sitelinks
 * search box on 2024-11-21 and removed its documentation days later, so the
 * markup no longer renders anything. `WebSite` itself still matters - it is
 * what feeds the site name shown in results.
 */
export function websiteJsonLd(): JsonLdContext<Record<string, unknown>> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: personJsonLd,
    image: imageObject(siteConfig.ogImage),
    inLanguage: siteConfig.locale.replace('_', '-'),
    sameAs,
  };
}

/** JSON-LD for a list page such as the blog or projects collection. */
export function collectionPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdContext<Record<string, unknown>> {
  const url = `${siteConfig.url}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: webSiteRef,
    publisher: personJsonLd,
    inLanguage: siteConfig.locale.replace('_', '-'),
  };
}

/** JSON-LD breadcrumb trail for crawlers and assistive technologies. */
export function breadcrumbJsonLd(
  items: { name: string; path?: string }[]
): JsonLdContext<Record<string, unknown>> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path && { item: `${siteConfig.url}${item.path}` }),
    })),
  };
}

/**
 * Rough word count from rendered HTML, for `Article.wordCount`.
 *
 * Tags are stripped and entities collapsed to a space so that markup does not
 * inflate the total. The figure is a signal for Google, not a statistic, so
 * approximate is fine.
 */
export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .trim();

  return text ? text.split(/\s+/).length : 0;
}

/** JSON-LD for an individual Ghost post rendered on the public site. */
export function articleJsonLd({
  title,
  description,
  url,
  image,
  publishedAt,
  updatedAt,
  authors,
  language,
  section,
  readTimeMinutes,
  wordCount,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  updatedAt: string;
  authors: { name: string; url?: string }[];
  language?: string;
  /** The series a post belongs to, from its Ghost primary tag. */
  section?: string | null;
  readTimeMinutes?: number | null;
  wordCount?: number | null;
}): JsonLdContext<Record<string, unknown>> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: [imageObject(image)],
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author:
      authors.length > 0
        ? authors.map((author) => ({
            '@type': 'Person',
            // The site owner writing under his own name is the same entity as
            // the site's Person node, so it carries the same id.
            ...(author.name === siteConfig.name ? { '@id': PERSON_ID } : {}),
            name: author.name,
            url: author.url ?? siteConfig.url,
          }))
        : [personJsonLd],
    publisher: personJsonLd,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: webSiteRef,
    ...(section ? { articleSection: section } : {}),
    ...(readTimeMinutes ? { timeRequired: `PT${readTimeMinutes}M` } : {}),
    ...(wordCount ? { wordCount } : {}),
    inLanguage: language
      ? language === 'en'
        ? 'en-US'
        : 'id-ID'
      : siteConfig.locale.replace('_', '-'),
  };
}

/** JSON-LD for a portfolio item, using SoftwareSourceCode where applicable. */
export function projectJsonLd({
  title,
  description,
  url,
  image,
  year,
  techStack,
  repoUrl,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  year: number | null;
  techStack: string[];
  repoUrl: string | null;
}): JsonLdContext<Record<string, unknown>> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: title,
    description,
    url,
    image: imageObject(image),
    author: personJsonLd,
    creator: personJsonLd,
    dateCreated: year ? `${year}-01-01` : undefined,
    programmingLanguage: techStack,
    codeRepository: repoUrl ?? undefined,
    isPartOf: webSiteRef,
  };
}

export const defaultMetadata: Metadata = {
  ...generateMetadata(),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
