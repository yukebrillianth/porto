import type { MetadataRoute } from 'next';

import { siteConfig } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No auth or dashboard on this site; only the route handlers
        // (revalidate webhook, contact form) are worth keeping out.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
