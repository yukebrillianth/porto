/**
 * Loads brand assets off disk and turns them into things a headless Chromium
 * can render without touching the network: base64 font faces, the hairline
 * grid, and the wordmark.
 *
 * Fonts are inlined rather than linked because file:// font loading races the
 * screenshot - Chromium will happily shoot the page before the face resolves,
 * and you get Times New Roman in your thumbnail.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** scripts -> blog-thumbnail -> skills -> .claude -> repo root */
export const REPO_ROOT = join(here, '..', '..', '..', '..');

const FONT_DIR = join(REPO_ROOT, 'app', 'fonts');
const PUBLIC_DIR = join(REPO_ROOT, 'public');

/** The weights the templates actually use. Each one costs ~58KB of base64. */
const FACES = [
  ['Gilroy-Regular.woff2', 400, 'normal'],
  ['Gilroy-Medium.woff2', 500, 'normal'],
  ['Gilroy-SemiBold.woff2', 600, 'normal'],
  ['Gilroy-Bold.woff2', 700, 'normal'],
  ['Gilroy-ExtraBold.woff2', 800, 'normal'],
];

function base64(path) {
  return readFileSync(path).toString('base64');
}

/** `@font-face` rules with the woff2 payload inlined as a data URI. */
export function fontFaceCss() {
  return FACES.map(([file, weight, style]) => {
    const data = base64(join(FONT_DIR, file));

    return `@font-face{font-family:'Gilroy';src:url(data:font/woff2;base64,${data}) format('woff2');font-weight:${weight};font-style:${style};font-display:block;}`;
  }).join('\n');
}

/** The hairline graph-paper grid that sits behind every section of the site. */
export function gridDataUri() {
  const data = base64(join(PUBLIC_DIR, 'backgrounds', 'grid-dark.svg'));

  return `data:image/svg+xml;base64,${data}`;
}

/**
 * The wordmark, inlined as markup so the templates can recolour it. Note the
 * trailing dot glyph - it is the mark, do not crop it off.
 */
export function logoSvg() {
  return readFileSync(join(PUBLIC_DIR, 'logo.svg'), 'utf8').trim();
}

/** Reads an arbitrary image in `public/` as a data URI, for author avatars. */
export function imageDataUri(relativePath) {
  const path = join(PUBLIC_DIR, relativePath.replace(/^\/+/, ''));
  const ext = path.split('.').pop().toLowerCase();
  const mime =
    ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  return `data:${mime};base64,${base64(path)}`;
}
