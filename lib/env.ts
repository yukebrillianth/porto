import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // Hygraph (portfolio projects) - server-only, never NEXT_PUBLIC_.
    // All optional so the site still builds before the CMS is provisioned.
    HYGRAPH_ENDPOINT: z.string().url().optional(),
    HYGRAPH_TOKEN: z.string().optional(),
    HYGRAPH_WEBHOOK_SECRET: z.string().optional(),

    // Ghost (blog) - self-hosted. Server-only, never NEXT_PUBLIC_.
    // Both optional so the site still builds before Ghost is provisioned.
    // Key: Ghost Admin -> Settings -> Integrations -> Custom integration.
    GHOST_URL: z.string().url().optional(),
    GHOST_CONTENT_KEY: z.string().optional(),

    // Shared secret for the /api/revalidate webhook.
    WEBHOOK_SECRET: z.string().optional(),
    // Ghost Admin integration webhook secret, used with X-Ghost-Signature.
    GHOST_WEBHOOK_SECRET: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    HYGRAPH_ENDPOINT: process.env.HYGRAPH_ENDPOINT,
    HYGRAPH_TOKEN:
      process.env.HYGRAPH_TOKEN ||
      process.env.HYGRAPH_PREVIEW_TOKEN ||
      process.env.NEXT_PREVIEW_TOKEN,
    HYGRAPH_WEBHOOK_SECRET: process.env.HYGRAPH_WEBHOOK_SECRET,
    GHOST_URL: process.env.GHOST_URL,
    GHOST_CONTENT_KEY: process.env.GHOST_CONTENT_KEY,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    GHOST_WEBHOOK_SECRET: process.env.GHOST_WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
