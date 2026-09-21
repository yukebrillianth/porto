#!/usr/bin/env node
/**
 * Renders minimalist, high-end technical article diagrams for Yuke's engineering blog.
 * Inspired by the 'minimal' and 'minimal-light' variants of blog-thumbnail:
 * - Solid backgrounds (#121212 for dark, #F8F9FA for light)
 * - No AI slop: no purple glow orbs, no heavy gradients
 * - Clean Gilroy typography (inlined as base64 data URIs)
 * - Hairline grid background (public/backgrounds/grid-dark.svg)
 * - Crisp technical lines, chips, and status badges
 * - Automatic Ghost CDN upload & post lexical replacement
 *
 * Usage:
 *   node render.mjs --theme dark --upload --replace-post 6ab0dc1aa977470001fdb2b1
 *   node render.mjs --theme light --diagram timeline
 *   node render.mjs --all-themes
 */

import crypto from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { timelineHtml, transitionHtml, drainingHtml } from './diagrams.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(here, '..', '..', '..', '..');

const FONT_DIR = join(REPO_ROOT, 'app', 'fonts');
const PUBLIC_DIR = join(REPO_ROOT, 'public');

/* ==========================================================================
   Assets & Font Inlining
   ========================================================================== */

function base64(path) {
  return readFileSync(path).toString('base64');
}

function fontFaceCss() {
  const faces = [
    ['Gilroy-Regular.woff2', 400, 'normal'],
    ['Gilroy-Medium.woff2', 500, 'normal'],
    ['Gilroy-SemiBold.woff2', 600, 'normal'],
    ['Gilroy-Bold.woff2', 700, 'normal'],
    ['Gilroy-ExtraBold.woff2', 800, 'normal'],
  ];

  return faces
    .map(([file, weight, style]) => {
      const p = join(FONT_DIR, file);
      if (!existsSync(p)) return '';
      const data = base64(p);
      return `@font-face{font-family:'Gilroy';src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:${weight};font-style:${style};font-display:block;}`;
    })
    .join('\n');
}

/* One grid asset for both themes; the light variant inverts it in CSS. */
function gridDataUri() {
  const p = join(PUBLIC_DIR, 'backgrounds', 'grid-dark.svg');
  if (!existsSync(p)) return '';
  const data = base64(p);
  return `data:image/svg+xml;base64,${data}`;
}

/* ==========================================================================
   Ghost Admin API Uploader & Lexical Updater
   ========================================================================== */

function getGhostCredentials() {
  const possibleEnvPaths = [
    join(REPO_ROOT, '.env'),
    join(REPO_ROOT, '..', '..', '.env'),
    '/Users/yukebrillianth/Project/porto/.env',
  ];
  let envContent = '';
  for (const p of possibleEnvPaths) {
    if (existsSync(p)) {
      envContent = readFileSync(p, 'utf8');
      break;
    }
  }

  const urlMatch = envContent.match(/^GHOST_URL=(.+)$/m);
  const keyMatch = envContent.match(/^GHOST_ADMIN_KEY=(.+)$/m);
  const adminKey =
    process.env.GHOST_ADMIN_KEY || (keyMatch ? keyMatch[1].trim() : '');
  if (!adminKey) {
    throw new Error(
      'GHOST_ADMIN_KEY is not set (env or .env) - needed to upload.'
    );
  }
  const ghostUrl = urlMatch
    ? urlMatch[1].trim().replace(/\/+$/, '')
    : 'https://blog.yukebrillianth.my.id';

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
    .update(header + '.' + payload)
    .digest('base64url');

  return header + '.' + payload + '.' + sig;
}

async function uploadToGhost(filePath, filename) {
  const { ghostUrl, adminKey } = getGhostCredentials();
  const token = makeGhostToken(adminKey);

  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/png' });

  const form = new FormData();
  form.append('file', blob, filename);
  form.append('purpose', 'image');

  const upRes = await fetch(`${ghostUrl}/ghost/api/admin/images/upload/`, {
    method: 'POST',
    headers: {
      Authorization: 'Ghost ' + token,
      'Accept-Version': 'v6.0',
    },
    body: form,
  });

  const data = await upRes.json();
  if (data.errors) {
    throw new Error('Ghost upload failed: ' + JSON.stringify(data.errors));
  }
  return data.images[0].url;
}

/* ==========================================================================
   CLI Main Runner
   ========================================================================== */

async function main() {
  const args = process.argv.slice(2);
  const theme = args.includes('--theme')
    ? args[args.indexOf('--theme') + 1]
    : 'dark';
  const shouldUpload = args.includes('--upload');
  const replacePostId = args.includes('--replace-post')
    ? args[args.indexOf('--replace-post') + 1]
    : null;

  console.log(`[article-graphics] Generating diagrams (theme: ${theme})...`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 675 },
    deviceScaleFactor: 2,
  });

  const outDir = join(REPO_ROOT, '.claude', 'artifacts');
  if (!existsSync(outDir)) {
    const { mkdirSync } = await import('node:fs');
    mkdirSync(outDir, { recursive: true });
  }

  const grid = gridDataUri();
  const fonts = fontFaceCss();

  const tasks = [
    {
      name: 'downtime-timeline',
      html: timelineHtml(theme, grid, fonts),
      caption:
        'Anatomi downtime pada perintah docker compose up -d (t1 sampai t4 memicu 502)',
      alt: 'Anatomi Downtime docker compose up -d',
    },
    {
      name: 'rollout-transition',
      html: transitionHtml(theme, grid, fonts),
      caption: 'Transisi 3 tahap zero-downtime deployment pada docker-rollout',
      alt: 'Transisi 3 Tahap docker-rollout',
    },
    {
      name: 'draining-flow',
      html: drainingHtml(theme, grid, fonts),
      caption:
        'Alur kerja connection draining menggunakan penanda /tmp/drain dan pre-stop hook',
      alt: 'Alur Connection Draining docker-rollout',
    },
  ];

  const results = [];
  try {
    for (const t of tasks) {
      const filePath = join(outDir, `${t.name}-${theme}.png`);
      await page.setContent(t.html, { waitUntil: 'networkidle' });
      await page.screenshot({ path: filePath });
      console.log(`[rendered] ${filePath}`);

      let cdnUrl = null;
      if (shouldUpload || replacePostId) {
        console.log(`[uploading] ${t.name}-${theme}.png to Ghost CDN...`);
        cdnUrl = await uploadToGhost(filePath, `${t.name}-${theme}.png`);
        console.log(`[cdn url] ${cdnUrl}`);
      }

      results.push({ ...t, filePath, cdnUrl });
    }
  } finally {
    await browser.close();
  }

  if (replacePostId) {
    console.log(
      `[replacing] Updating post ${replacePostId} with new visual image cards...`
    );
    const { ghostUrl, adminKey } = getGhostCredentials();
    const token = makeGhostToken(adminKey);
    const headers = {
      Authorization: 'Ghost ' + token,
      'Accept-Version': 'v6.0',
      'Content-Type': 'application/json',
    };

    const getRes = await fetch(
      `${ghostUrl}/ghost/api/admin/posts/${replacePostId}/?formats=lexical`,
      { headers }
    );
    const postData = await getRes.json();
    const post = postData.posts[0];
    const lex = JSON.parse(post.lexical);

    for (let i = 0; i < lex.root.children.length; i++) {
      const node = lex.root.children[i];

      // Check codeblock or existing image to replace
      if (node.type === 'codeblock') {
        const c = node.code || '';
        if (c.includes('docker compose up -d web') && c.includes('DOWNTIME')) {
          const r = results.find((x) => x.name === 'downtime-timeline');
          lex.root.children[i] = {
            type: 'image',
            version: 1,
            src: r.cdnUrl,
            width: 2400,
            height: 1350,
            alt: r.alt,
            caption: r.caption,
          };
        } else if (c.includes('Sebelum') && c.includes('Saat rollout')) {
          const r = results.find((x) => x.name === 'rollout-transition');
          lex.root.children[i] = {
            type: 'image',
            version: 1,
            src: r.cdnUrl,
            width: 2400,
            height: 1350,
            alt: r.alt,
            caption: r.caption,
          };
        } else if (c.includes('pre-stop hook') && c.includes('/tmp/drain')) {
          const r = results.find((x) => x.name === 'draining-flow');
          lex.root.children[i] = {
            type: 'image',
            version: 1,
            src: r.cdnUrl,
            width: 2400,
            height: 1350,
            alt: r.alt,
            caption: r.caption,
          };
        }
      } else if (node.type === 'image') {
        const s = node.src || '';
        if (s.includes('downtime-timeline')) {
          const r = results.find((x) => x.name === 'downtime-timeline');
          node.src = r.cdnUrl;
        } else if (s.includes('rollout-transition')) {
          const r = results.find((x) => x.name === 'rollout-transition');
          node.src = r.cdnUrl;
        } else if (s.includes('draining-flow')) {
          const r = results.find((x) => x.name === 'draining-flow');
          node.src = r.cdnUrl;
        }
      }
    }

    const putRes = await fetch(
      `${ghostUrl}/ghost/api/admin/posts/${replacePostId}/`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          posts: [
            { updated_at: post.updated_at, lexical: JSON.stringify(lex) },
          ],
        }),
      }
    );
    const putData = await putRes.json();
    if (putData.errors) {
      console.error('Error replacing in post:', putData.errors);
    } else {
      console.log(
        '[success] Ghost post lexical successfully updated with new minimalist artifacts!'
      );
    }
  }

  console.log('[done] All operations completed.');
}

main().catch(console.error);
