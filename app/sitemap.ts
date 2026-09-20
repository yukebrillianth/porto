import type { MetadataRoute } from 'next';

import { siteConfig } from '@/constants';
import { getPosts } from '@/services/posts';
import { getProjects } from '@/services/projects';

function safeDate(value?: string | null): Date {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Dynamic canonical sitemap. Ghost is the private CMS origin, so only the
 * public Next.js URLs are emitted here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPosts(100), getProjects()]);

  const latestPostDate = posts[0]?.updatedAt
    ? safeDate(posts[0].updatedAt)
    : new Date();
  const latestProjectDate = projects[0]?.updatedAt
    ? safeDate(projects[0].updatedAt)
    : new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified:
        latestPostDate > latestProjectDate ? latestPostDate : latestProjectDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/projects`,
      lastModified: latestProjectDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${project.slug}`,
    lastModified: safeDate(project.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: safeDate(post.updatedAt || post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
