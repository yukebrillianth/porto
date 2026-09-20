import type { NextConfig } from 'next';

/**
 * The Ghost instance is self-hosted, so its hostname is only known from the
 * environment. Deriving `remotePatterns` from `GHOST_URL` keeps the image
 * optimizer locked to that one host - a blanket `https://**` would let any
 * origin proxy images through this server. When `GHOST_URL` is unset the blog
 * has no covers to render anyway, so an empty list is the correct fallback.
 */
const ghostUrl = process.env.GHOST_URL;
const ghostHostname = ghostUrl ? new URL(ghostUrl).hostname : null;

const nextConfig: NextConfig = {
  // output: 'standalone', // enable for Docker self-hosting

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Hygraph - portfolio project media
      { protocol: 'https' as const, hostname: '*.graphassets.com' },
      { protocol: 'https' as const, hostname: 'media.graphassets.com' },
      { protocol: 'https' as const, hostname: 'static.ghost.org' },
      { protocol: 'https' as const, hostname: 'images.unsplash.com' },
      // Ghost - blog cover images, served from the instance's /content/images
      ...(ghostHostname
        ? [{ protocol: 'https' as const, hostname: ghostHostname }]
        : []),
      // Cloudflare R2 - Ghost's public media domain
      { protocol: 'https' as const, hostname: 'assets.yukebrillianth.my.id' },
    ],
  },

  async redirects() {
    return [
      {
        source: '/portfolio',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/portfolio/:slug',
        destination: '/projects/:slug',
        permanent: true,
      },
    ];
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
              [
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                ghostHostname ? `https://${ghostHostname}` : '',
              ]
                .filter(Boolean)
                .join(' '),
              [
                "style-src 'self' 'unsafe-inline'",
                ghostHostname ? `https://${ghostHostname}` : '',
              ]
                .filter(Boolean)
                .join(' '),
              `img-src 'self' data: blob: *`,
              "font-src 'self' data:",
              // CMS reads happen server-side, but keep the endpoints allowed
              // in case a client component ever queries them directly.
              [
                "connect-src 'self' https://*.hygraph.com",
                ghostUrl ? `https://${ghostHostname}` : '',
              ]
                .filter(Boolean)
                .join(' '),
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
