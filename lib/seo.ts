import type { Metadata } from 'next';

import { siteConfig } from '@/constants';

/** The brand as it reads in a browser tab — shorter than the full legal name. */
const BRAND = 'Yuke Brilliant';

/** The Twitter/X account that owns this site's cards. */
const TWITTER_HANDLE = '@YukeBrillianth';

type SeoProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

/**
 * Generate metadata for a page with SEO best practices
 *
 * @example
 * export const metadata = generateMetadata({
 *   title: 'About Us',
 *   description: 'Learn more about our company',
 * });
 */
export function generateMetadata({
  title,
  description = siteConfig.description,
  keywords = [...siteConfig.keywords],
  image = siteConfig.ogImage,
  url = siteConfig.url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: SeoProps = {}): Metadata {
  const metaTitle = title ? `${title} | ${BRAND}` : siteConfig.title;

  return {
    metadataBase: new URL(siteConfig.url),
    /*
     * `absolute` is required: the root layout declares a `%s | ${BRAND}`
     * template, and a plain string here would be fed through it a second
     * time, yielding "About | Yuke Brilliant | Yuke Brilliant".
     */
    title: { absolute: metaTitle },
    description,
    keywords,
    authors: authors?.map((author) => ({ name: author })) ?? [
      { name: siteConfig.creator },
    ],
    creator: siteConfig.creator,
    openGraph: {
      type,
      locale: siteConfig.locale,
      url,
      title: metaTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: metaTitle,
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
      images: [image.startsWith('http') ? image : `${siteConfig.url}${image}`],
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
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Default metadata for the site root. Pages either export their own via
 * `generateMetadata()` or inherit this.
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${BRAND}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
