import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'standalone', // enable for Docker self-hosting

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Hygraph — portfolio project media
      { protocol: 'https', hostname: '*.graphassets.com' },
      { protocol: 'https', hostname: 'media.graphassets.com' },
      // Hashnode — blog cover images
      { protocol: 'https', hostname: 'cdn.hashnode.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: blob: *`,
              "font-src 'self' data:",
              // CMS reads happen server-side, but keep the endpoints allowed
              // in case a client component ever queries them directly.
              "connect-src 'self' https://*.hygraph.com https://gql.hashnode.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
