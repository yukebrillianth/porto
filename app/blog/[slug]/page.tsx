import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/constants';
import { generateMetadata as buildMetadata } from '@/lib/seo';
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

  return {
    ...buildMetadata({
      title: post.title,
      description: post.brief,
      image: post.coverUrl ?? siteConfig.ogImage,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [siteConfig.creator],
    }),
    // The whole point of self-hosting the blog: authority accrues to this
    // domain, not to *.hashnode.dev.
    alternates: { canonical: url },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const url = `${siteConfig.url}/blog/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.brief,
    datePublished: post.publishedAt,
    image: post.coverUrl
      ? [post.coverUrl]
      : [`${siteConfig.url}${siteConfig.ogImage}`],
    author: {
      '@type': 'Person',
      name: siteConfig.creator,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.creator,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialized from our own typed object, not from CMS HTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostContainer post={post} />
    </>
  );
}
