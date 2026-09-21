/**
 * A tiny read-only Ghost Content API client for the thumbnail generator.
 *
 * This deliberately does not import `lib/ghost.ts` - that module is TypeScript
 * wired into Next's `fetch` cache, and this script runs as plain Node outside
 * the bundler. The duplication is the cheap side of the trade.
 *
 * Ghost being unreachable is never fatal here: the caller falls back to
 * whatever fields were passed on the command line.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { REPO_ROOT } from './assets.mjs';

const GHOST_API_VERSION = 'v6.0';

/**
 * Minimal dotenv. `lib/env.ts` validates these at build time for the app, but
 * a standalone script has no such luxury.
 */
function loadEnv() {
  const env = {};

  for (const file of ['.env.local', '.env']) {
    let raw;

    try {
      raw = readFileSync(join(REPO_ROOT, file), 'utf8');
    } catch {
      continue;
    }

    for (const line of raw.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      if (!match) continue;

      const [, key, value = ''] = match;

      if (env[key] !== undefined) continue;

      env[key] = value
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2')
        .trim();
    }
  }

  return { ...env, ...process.env };
}

const env = loadEnv();

export function isGhostConfigured() {
  return Boolean(env.GHOST_URL && env.GHOST_CONTENT_KEY);
}

/**
 * Ghost has no "series" primitive, so tags stand in for it. Internal tags are
 * prefixed with `#` and come back with a `hash-` slug; those are plumbing, not
 * categories, so they never become a badge.
 */
function pickSeries(post) {
  const candidate =
    post.primary_tag ??
    post.tags?.find((tag) => !tag.slug?.startsWith('hash-'));

  if (!candidate || candidate.slug?.startsWith('hash-')) return null;

  return candidate.name;
}

/**
 * Fetches one published post by slug and flattens it to exactly the fields a
 * thumbnail needs. Returns `null` when Ghost is unconfigured, unreachable, or
 * has no such post - all three are recoverable, so none of them throw.
 */
export async function fetchPost(slug) {
  if (!isGhostConfigured()) return null;

  const params = new URLSearchParams({
    key: env.GHOST_CONTENT_KEY,
    include: 'tags,authors',
  });

  const base = env.GHOST_URL.replace(/\/+$/, '');
  const url = `${base}/ghost/api/content/posts/slug/${encodeURIComponent(slug)}/?${params}`;

  let response;

  try {
    response = await fetch(url, {
      headers: { 'Accept-Version': GHOST_API_VERSION },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    process.stderr.write(
      `Ghost unreachable (${error.message}); using manual fields.\n`
    );

    return null;
  }

  if (!response.ok) {
    process.stderr.write(`Ghost returned ${response.status} for "${slug}".\n`);

    return null;
  }

  const post = (await response.json())?.posts?.[0];

  if (!post) return null;

  return {
    title: post.title ?? '',
    brief: post.custom_excerpt ?? post.excerpt ?? '',
    category: pickSeries(post),
    readTime: post.reading_time ?? null,
    publishedAt: post.published_at ?? null,
    coverUrl: post.feature_image ?? null,
  };
}
