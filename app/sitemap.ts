import type { MetadataRoute } from 'next';

import { siteConfig } from '@/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/portfolio', '/blog', '/contact'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  /* ------------------------------------------------------------------ *
   * TODO: dynamic routes — owned by the CMS services agent.
   *
   * Once `lib/hygraph.ts` and `lib/hashnode.ts` expose their list queries,
   * make this function `async` and merge their entries in:
   *
   *   const [projects, posts] = await Promise.all([
   *     getProjects(),
   *     getPosts(),
   *   ]);
   *
   *   const projectRoutes = projects.map((project) => ({
   *     url: `${siteConfig.url}/portfolio/${project.slug}`,
   *     lastModified: project.updatedAt,
   *     changeFrequency: 'monthly' as const,
   *     priority: 0.7,
   *   }));
   *
   *   const postRoutes = posts.map((post) => ({
   *     url: `${siteConfig.url}/blog/${post.slug}`,
   *     lastModified: post.updatedAt,
   *     changeFrequency: 'monthly' as const,
   *     priority: 0.6,
   *   }));
   *
   *   return [...routes, ...projectRoutes, ...postRoutes];
   *
   * Keep the CMS reads on the shared ISR window (REVALIDATE_SECONDS) —
   * never `cache: 'no-store'`.
   * ------------------------------------------------------------------ */

  return [...routes];
}
