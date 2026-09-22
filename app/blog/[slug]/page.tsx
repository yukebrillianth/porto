import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/constants';
import { ghostPublicAsset } from '@/lib/ghost';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  countWords,
  generateMetadata as buildMetadata,
} from '@/lib/seo';
import { getPostBySlug, getPostSlugs } from '@/services/posts';

import PostContainer from './container';

export const revalidate = 3600;

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return buildMetadata({ title: 'Post not found', noIndex: true });
  }

  const url = `${siteConfig.url}/blog/${slug}`;

  const alternateLanguages: Record<string, string> = {
    [post.language]: url,
    ...Object.fromEntries(
      post.translations
        .filter((translation) => translation.slug !== slug)
        .map((translation) => [
          translation.language,
          `${siteConfig.url}/blog/${translation.slug}`,
        ])
    ),
  };

  return buildMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.brief,
    image: post.ogImage ?? post.coverUrl ?? siteConfig.ogImage,
    url,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.authors.map((author) => author.name),
    languages: alternateLanguages,
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${slug}`;

  const jsonLd = articleJsonLd({
    title: post.title,
    description: post.metaDescription ?? post.brief,
    url,
    image: post.ogImage ?? post.coverUrl ?? siteConfig.ogImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authors: post.authors.map((author) => ({
      name: author.name,
      url: `${siteConfig.url}/#about`,
    })),
    language: post.language,
    section: post.series?.name,
    readTimeMinutes: post.readTimeMinutes,
    wordCount: countWords(post.contentHtml),
  });
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title },
  ]);

  const cardsCss = ghostPublicAsset('cards.min.css');
  const cardsJs = ghostPublicAsset('cards.min.js');

  return (
    <>
      <script
        type="application/ld+json"
        // Serialized from our own typed object, not from CMS HTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PostContainer post={post} cardsCss={cardsCss} cardsJs={cardsJs} />
    </>
  );
}
