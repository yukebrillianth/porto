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

    // Hashnode (blog) - the public API needs no token. The publication id is
    // only an optimization: it is looked up from the host when unset.
    HASHNODE_PUBLICATION_ID: z.string().optional(),

    // Shared secret for the /api/revalidate webhook.
    WEBHOOK_SECRET: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    HYGRAPH_ENDPOINT: process.env.HYGRAPH_ENDPOINT,
    HYGRAPH_TOKEN: process.env.HYGRAPH_TOKEN,
    HYGRAPH_WEBHOOK_SECRET: process.env.HYGRAPH_WEBHOOK_SECRET,
    HASHNODE_PUBLICATION_ID: process.env.HASHNODE_PUBLICATION_ID,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
