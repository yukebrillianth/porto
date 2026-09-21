#!/usr/bin/env node
/**
 * Renders article diagrams, uploads them to the Ghost CDN, and swaps them into
 * a post in place of its ASCII codeblocks.
 *
 * Diagrams are data. A spec file under `diagrams/<slug>.mjs` exports the post
 * id and a list of `{ name, alt, caption, match, spec }`, and this script
 * renders each spec through the generic flowchart renderer. Nothing about any
 * particular article lives here.
 *
 * Usage:
 *   node render.mjs --article <slug>
 *   node render.mjs --article <slug> --theme light
 *   node render.mjs --article <slug> --upload --replace-post <id>
 */

import crypto from 'node:crypto';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

import { flowHtml } from './diagrams.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(here, '..');
export const REPO_ROOT = join(here, '..', '..', '..', '..');

const FONT_DIR = join(REPO_ROOT, 'app', 'fonts');
const PUBLIC_DIR = join(REPO_ROOT, 'public');

/* ==========================================================================
   Assets and font inlining
   ========================================================================== */

function base64(path) {
  return readFileSync(path).toString('base64');
}

/**
 * Gilroy inlined as data URIs. Without this Chromium silently falls back to a
 * system sans and the diagram stops matching the rest of the site.
 */
function fontFaceCss() {
  const faces = [
    ['Gilroy-Regular.woff2', 400],
    ['Gilroy-Medium.woff2', 500],
    ['Gilroy-SemiBold.woff2', 600],
    ['Gilroy-Bold.woff2', 700],
    ['Gilroy-ExtraBold.woff2', 800],
  ];

  return faces
    .map(([file, weight]) => {
      const p = join(FONT_DIR, file);
      if (!existsSync(p)) return '';

      return `@font-face{font-family:'Gilroy';src:url(data:font/woff2;base64,${base64(p)}) format('woff2');font-weight:${weight};font-style:normal;font-display:block;}`;
    })
    .join('\n');
}

/* One grid asset for both themes; the light variant inverts it in CSS. */
function gridDataUri() {
  const p = join(PUBLIC_DIR, 'backgrounds', 'grid-dark.svg');
  if (!existsSync(p)) return '';

  return `data:image/svg+xml;base64,${base64(p)}`;
}

/* ==========================================================================
   Ghost Admin API
   ========================================================================== */

function getGhostCredentials() {
  const candidates = [
    join(REPO_ROOT, '.env'),
    join(REPO_ROOT, '..', '..', '.env'),
  ];
  let envContent = '';
  for (const p of candidates) {
    if (existsSync(p)) {
      envContent = readFileSync(p, 'utf8');
      break;
    }
  }

  const read = (key) => {
    const m = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return (process.env[key] || (m ? m[1] : '')).trim();
  };

  const adminKey = read('GHOST_ADMIN_KEY');
  if (!adminKey) {
    throw new Error(
      'GHOST_ADMIN_KEY is not set (env or .env) - needed to upload.'
    );
  }

  const ghostUrl = read('GHOST_URL').replace(/\/+$/, '');
  if (!ghostUrl) {
    throw new Error('GHOST_URL is not set (env or .env) - needed to upload.');
  }

  return { ghostUrl, adminKey };
}

function makeGhostToken(adminKey) {
  const [id, secret] = adminKey.split(':');
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: 'HS256', typ: 'JWT', kid: id });
  const payload = b64({ iat: now, exp: now + 300, aud: '/admin/' });
  const sig = crypto
    .createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${sig}`;
}

async function uploadToGhost(filePath, filename) {
  const { ghostUrl, adminKey } = getGhostCredentials();

  const form = new FormData();
  form.append(
    'file',
    new Blob([readFileSync(filePath)], { type: 'image/png' }),
    filename
  );
  form.append('purpose', 'image');

  const res = await fetch(`${ghostUrl}/ghost/api/admin/images/upload/`, {
    method: 'POST',
    headers: {
      Authorization: `Ghost ${makeGhostToken(adminKey)}`,
      'Accept-Version': 'v6.0',
    },
    body: form,
  });

  const data = await res.json();
  if (data.errors) {
    throw new Error(`Ghost upload failed: ${JSON.stringify(data.errors)}`);
  }

  return data.images[0].url;
}

/**
 * Swaps rendered diagrams into a post's lexical.
 *
 * Codeblocks are matched on their content, existing images on their filename,
 * so re-running after an edit updates the src rather than adding a duplicate.
 */
async function replaceInPost(postId, results) {
  const { ghostUrl, adminKey } = getGhostCredentials();
  const headers = {
    Authorization: `Ghost ${makeGhostToken(adminKey)}`,
    'Accept-Version': 'v6.0',
    'Content-Type': 'application/json',
  };

  const getRes = await fetch(
    `${ghostUrl}/ghost/api/admin/posts/${postId}/?formats=lexical`,
    { headers }
  );
  const post = (await getRes.json()).posts[0];
  const lex = JSON.parse(post.lexical);

  const imageNode = (r) => ({
    type: 'image',
    version: 1,
    src: r.cdnUrl,
    width: 2400,
    height: 1350,
    alt: r.alt,
    caption: r.caption,
    cardWidth: 'wide',
  });

  let swapped = 0;
  lex.root.children = lex.root.children.map((node) => {
    if (node.type === 'codeblock') {
      const code = node.code || '';
      const hit = results.find((r) => r.match?.every((m) => code.includes(m)));
      if (hit) {
        swapped += 1;
        return imageNode(hit);
      }
    }

    if (node.type === 'image') {
      const hit = results.find((r) => (node.src || '').includes(r.name));
      if (hit) {
        swapped += 1;
        return { ...node, src: hit.cdnUrl, cardWidth: 'wide' };
      }
    }

    return node;
  });

  const putRes = await fetch(`${ghostUrl}/ghost/api/admin/posts/${postId}/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      posts: [{ updated_at: post.updated_at, lexical: JSON.stringify(lex) }],
    }),
  });

  const putData = await putRes.json();
  if (putData.errors) {
    console.error('[error] replace failed:', putData.errors);
    return;
  }

  console.log(`[success] swapped ${swapped} node(s) in post ${postId}`);
}

/* ==========================================================================
   CLI
   ========================================================================== */

function arg(args, name, fallback = null) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const slug = arg(args, '--article');
  const theme = arg(args, '--theme', 'dark');
  const shouldUpload = args.includes('--upload');
  const replacePostId = arg(args, '--replace-post');

  if (!slug) {
    console.error(
      'Usage: render.mjs --article <slug> [--theme dark|light] [--upload] [--replace-post <id>]'
    );
    process.exit(1);
  }

  const specPath = join(SKILL_ROOT, 'diagrams', `${slug}.mjs`);
  if (!existsSync(specPath)) {
    console.error(`[error] no diagram spec at ${specPath}`);
    process.exit(1);
  }

  const { diagrams, post } = await import(pathToFileURL(specPath).href);
  const postId = replacePostId ?? (args.includes('--replace') ? post : null);

  console.log(
    `[article-graphics] ${slug}: ${diagrams.length} diagram(s), theme ${theme}`
  );

  const outDir = join(REPO_ROOT, '.claude', 'artifacts');
  mkdirSync(outDir, { recursive: true });

  const grid = gridDataUri();
  const fonts = fontFaceCss();

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 675 },
    deviceScaleFactor: 2,
  });

  const results = [];
  try {
    for (const d of diagrams) {
      const filePath = join(outDir, `${d.name}-${theme}.png`);
      await page.setContent(flowHtml(d.spec, theme, grid, fonts), {
        waitUntil: 'networkidle',
      });
      await page.screenshot({ path: filePath });
      console.log(`[rendered] ${filePath}`);

      let cdnUrl = null;
      if (shouldUpload || postId) {
        cdnUrl = await uploadToGhost(filePath, `${d.name}-${theme}.png`);
        console.log(`[uploaded] ${cdnUrl}`);
      }

      results.push({ ...d, filePath, cdnUrl });
    }
  } finally {
    await browser.close();
  }

  if (postId) await replaceInPost(postId, results);

  console.log('[done]');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
