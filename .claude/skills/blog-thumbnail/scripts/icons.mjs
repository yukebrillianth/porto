/**
 * Line-art glyphs for the thumbnails.
 *
 * These are hand-drawn on a 24x24 grid rather than pulled from an icon package,
 * for the same reason the fonts are inlined: nothing in a thumbnail render is
 * allowed to touch the network or a node_modules tree. Stroke width is set in
 * user units and scaled by the caller, so a glyph at 120px keeps the same
 * optical weight as one at 32px.
 *
 * `public/icons/` also holds real tech logos (docker, nginx-adjacent, node,
 * react...) and those are available through `techLogo()` when a post is about a
 * specific tool rather than a general subject.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as simpleIcons from 'simple-icons';

import { REPO_ROOT } from './assets.mjs';

const ICON_DIR = join(REPO_ROOT, 'public', 'icons');

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ==========================================================================
   The glyph set
   ========================================================================== */

/** Path data only. The wrapper supplies viewBox, stroke and sizing. */
const GLYPHS = {
  server: `
    <rect x="3" y="4" width="18" height="7" rx="2"/>
    <rect x="3" y="13" width="18" height="7" rx="2"/>
    <path d="M7 7.5h.01M7 16.5h.01"/>
    <path d="M11 7.5h4M11 16.5h4"/>`,

  network: `
    <circle cx="12" cy="5" r="2.2"/>
    <circle cx="5" cy="19" r="2.2"/>
    <circle cx="19" cy="19" r="2.2"/>
    <path d="M12 7.2v4.3M12 11.5 5.8 16.9M12 11.5l6.2 5.4"/>`,

  database: `
    <ellipse cx="12" cy="6" rx="8" ry="3"/>
    <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/>
    <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,

  cloud: `
    <path d="M17.5 19a4.5 4.5 0 0 0 .3-9 6 6 0 0 0-11.6 1.6A3.7 3.7 0 0 0 7 19z"/>`,

  terminal: `
    <rect x="2.5" y="4" width="19" height="16" rx="2.5"/>
    <path d="M7 9.5 10 12l-3 2.5M12.5 15h4.5"/>`,

  code: `
    <path d="M8.5 8 4 12l4.5 4M15.5 8l4.5 4-4.5 4M13.5 5l-3 14"/>`,

  cpu: `
    <rect x="7" y="7" width="10" height="10" rx="2"/>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3"/>
    <path d="M9.5 1.8v1.7M14.5 1.8v1.7M9.5 20.5v1.7M14.5 20.5v1.7M1.8 9.5h1.7M1.8 14.5h1.7M20.5 9.5h1.7M20.5 14.5h1.7"/>`,

  robot: `
    <rect x="3.5" y="8" width="17" height="12" rx="3"/>
    <path d="M12 8V4.5M12 3.2v.1"/>
    <circle cx="12" cy="3" r="1.4"/>
    <path d="M9 13.2v1.6M15 13.2v1.6M1.5 13v3M22.5 13v3"/>`,

  branch: `
    <circle cx="6.5" cy="5" r="2.2"/>
    <circle cx="6.5" cy="19" r="2.2"/>
    <circle cx="17.5" cy="7.5" r="2.2"/>
    <path d="M6.5 7.2v9.6M17.5 9.7c0 4-3.4 4.6-6.3 5.3-2 .5-4.7 1-4.7 1.5"/>`,

  lock: `
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/>
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 14.5v2.5"/>`,

  bolt: `<path d="M13.5 2 4.5 13.5h6L10 22l9.5-11.8h-6.4z"/>`,

  globe: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18"/>
    <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>`,

  layers: `
    <path d="M12 2.8 2.5 7.5 12 12.2l9.5-4.7z"/>
    <path d="M2.5 12.6 12 17.3l9.5-4.7M2.5 17.1 12 21.8l9.5-4.7"/>`,

  package: `
    <path d="M20.5 7.8v8.4a1.8 1.8 0 0 1-1 1.6l-6.6 3.5a1.8 1.8 0 0 1-1.8 0l-6.6-3.5a1.8 1.8 0 0 1-1-1.6V7.8"/>
    <path d="m3.5 7.5 8.5 4.4 8.5-4.4L12 3z"/>
    <path d="M12 11.9v9.6"/>`,

  gauge: `
    <path d="M3.5 17a9 9 0 1 1 17 0"/>
    <path d="m12 13.5 4.2-4"/>
    <circle cx="12" cy="14.6" r="1.4"/>`,

  wifi: `
    <path d="M2.5 9.2a14 14 0 0 1 19 0M5.8 12.8a9.4 9.4 0 0 1 12.4 0M9.2 16.4a4.6 4.6 0 0 1 5.6 0"/>
    <circle cx="12" cy="19.8" r="1.2"/>`,

  beaker: `
    <path d="M9.5 2.8v6.4L4.2 18a2.4 2.4 0 0 0 2 3.6h11.6a2.4 2.4 0 0 0 2-3.6l-5.3-8.8V2.8"/>
    <path d="M7.8 2.8h8.4M6.2 14.5h11.6"/>`,

  shield: `
    <path d="M12 2.5 4.5 5.8v6c0 4.6 3.2 8.4 7.5 9.7 4.3-1.3 7.5-5.1 7.5-9.7v-6z"/>
    <path d="m8.8 11.8 2.3 2.4 4.1-4.6"/>`,

  book: `
    <path d="M4 4.5A2 2 0 0 1 6 2.5h13v16H6a2 2 0 0 0-2 2z"/>
    <path d="M4 4.5v15M19 18.5v3H6"/>`,

  compass: `
    <circle cx="12" cy="12" r="9"/>
    <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z"/>`,

  clock: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5.3l3.4 2"/>`,

  arrow: `<path d="M4 12h15M13.5 6.2 20 12l-6.5 5.8"/>`,

  loadbalancer: `
    <circle cx="12" cy="5" r="2.2"/>
    <circle cx="5" cy="19" r="2.2"/>
    <circle cx="19" cy="19" r="2.2"/>
    <path d="M12 7.2v4.3M12 11.5 5.8 16.9M12 11.5l6.2 5.4"/>`,
};

export const ICON_NAMES = Object.keys(GLYPHS);

/* ==========================================================================
   Subject matching
   ========================================================================== */

const CATEGORY_MATCHERS = [
  [/engineering|software|code|developer/i, 'code'],
  [/back.?end|server|api|rest|grpc|nest|express/i, 'server'],
  [/front.?end|web|ui|css|interface/i, 'code'],
  [/devops|infra|deploy|container/i, 'package'],
  [/cloud|aws|gcp|azure|edge/i, 'cloud'],
  [/robot|autonom|slam|drone/i, 'robot'],
  [/ai|machine.?learning|ml|llm|deep.?learning/i, 'cpu'],
  [/security|auth|crypto/i, 'lock'],
  [/database|sql|data|storage/i, 'database'],
  [/story|note|journal/i, 'book'],
  [/network|load.?balanc|traffic/i, 'network'],
  [/architect|system.?design/i, 'layers'],
  [/perf|benchmark|optimi|latency/i, 'gauge'],
];

/** Picks a glyph specifically representing the category. Falls back to compass. */
export function pickCategoryIcon(category) {
  if (!category) return 'compass';

  for (const [pattern, name] of CATEGORY_MATCHERS) {
    if (pattern.test(category)) return name;
  }

  return 'compass';
}

/**
 * Keyword to glyph. First match wins, so the more specific terms come first
 * within each entry and the broad catch-alls sit at the bottom of the table.
 */
const MATCHERS = [
  [/load.?balanc|proxy|gateway|upstream|traffic/i, 'network'],
  [/server|backend|back.?end|nest|express|api|rest|grpc/i, 'server'],
  [/container|deploy|infra|cluster|devops/i, 'package'],
  [/database|mysql|sql|query|index/i, 'database'],
  [/cloud|aws|gcp|azure|serverless|vercel|cdn|edge/i, 'cloud'],
  [/terminal|shell|bash|linux|cli|command|zsh|vim/i, 'terminal'],
  [/robot|ros|autonom|drone|slam|lidar|kinemat/i, 'robot'],
  [/perf|latency|throughput|benchmark|optimi|speed|profil/i, 'gauge'],
  [/secur|auth|jwt|oauth|crypt|token|vulnerab/i, 'lock'],
  [/git|version.?control|branch|merge|monorepo|ci\/cd/i, 'branch'],
  [/network|tcp|http|dns|socket|websocket|protocol|packet/i, 'wifi'],
  [/architect|system.?design|pattern|layer|micro.?service/i, 'layers'],
  [/embed|firmware|iot|hardware|microcontroller|esp32|arduino/i, 'cpu'],
  [/test|experiment|prototype|research|lab/i, 'beaker'],
  [/web|front.?end|vue|svelte|css|ui|browser/i, 'code'],
  [/tutorial|guide|learn|note|journal|story/i, 'book'],
  [/distributed|scale|event|queue|stream/i, 'globe'],
  [/\bclaude\b/i, 'claude'],
  [/\bnginx\b/i, 'nginx'],
  [/\bkubernetes\b|\bk8s\b/i, 'kubernetes'],
  [/\bdocker\b/i, 'docker'],
  [/\bredis\b/i, 'redis'],
  [/\bpostgres\b|\bpgsql\b/i, 'postgresql'],
  [/\bmongodb\b|\bmongo\b/i, 'mongodb'],
  [/\bpython\b/i, 'python'],
  [/\brust\b/i, 'rust'],
  [/\bgolang\b|\bgo\b/i, 'go'],
  [/\bkafka\b|\bapachekafka\b/i, 'apachekafka'],
  [/\brabbitmq\b/i, 'rabbitmq'],
  [/\btailwind\b|\btailwindcss\b/i, 'tailwindcss'],
  [/\bgraphql\b|\bgql\b/i, 'graphql'],
  [/\bnext\.?js\b/i, 'nextdotjs'],
  [/\breact\b/i, 'react'],
  [/\bgojek\b/i, 'gojek'],
];

/** Picks a glyph from the category and title. Falls back to the compass. */
export function pickIcon(data) {
  const haystack = `${data.category ?? ''} ${data.title ?? ''}`;

  for (const [pattern, name] of MATCHERS) {
    if (pattern.test(haystack)) return name;
  }

  return 'compass';
}

/* ==========================================================================
   Rendering
   ========================================================================== */

/**
 * One glyph as inline SVG markup.
 *
 * `stroke` is in 24-unit space, so it scales with the icon rather than
 * hairlining out at large sizes. `fill` is only used by the solid glyphs.
 */
export function iconSvg(
  name,
  { size = 24, color = 'currentColor', stroke = 1.6, fill = 'none' } = {}
) {
  const glyph = GLYPHS[name] ?? GLYPHS.compass;

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg>`;
}

/* ==========================================================================
   Tech logos and Simple Icons
   ========================================================================== */

let logoIndex = null;
let simpleIconsIndex = null;

function getSimpleIcon(name) {
  if (!name) return null;

  if (!simpleIconsIndex) {
    simpleIconsIndex = new Map();

    for (const icon of Object.values(simpleIcons)) {
      if (icon && icon.slug) {
        simpleIconsIndex.set(icon.slug.toLowerCase(), icon);
        simpleIconsIndex.set(
          icon.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
          icon
        );
      }
    }
  }

  const clean = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return (
    simpleIconsIndex.get(clean) ??
    simpleIconsIndex.get(String(name).toLowerCase()) ??
    null
  );
}

/** Lower-cased filename stem to real filename, so lookups are case-blind. */
function index() {
  if (logoIndex) return logoIndex;

  logoIndex = new Map();

  for (const file of readdirSync(ICON_DIR)) {
    if (!file.endsWith('.svg')) continue;

    logoIndex.set(file.replace(/\.svg$/, '').toLowerCase(), file);
  }

  return logoIndex;
}

export function techLogoNames() {
  return [...index().keys()].sort();
}

/**
 * A brand logo from Simple Icons (3400+ brands) or `public/icons/`.
 * Supports custom fill color or official brand hex color (defaulting to brand color).
 *
 * Simple Icons SVGs have no fill by default (rendering black in standard SVG).
 * We inject `fill` so brand logos render crisp and vivid on dark or light canvas.
 */
export function techLogo(
  name,
  { size = 48, color = null, brandColor = false } = {}
) {
  const si = getSimpleIcon(name);

  if (si) {
    const fill =
      brandColor || color === 'brand' ? `#${si.hex}` : (color ?? `#${si.hex}`);

    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" role="img" xmlns="http://www.w3.org/2000/svg"><title>${esc(si.title)}</title><path d="${si.path}"/></svg>`;
  }

  const file = index().get(String(name).toLowerCase());

  if (!file) return null;

  const raw = readFileSync(join(ICON_DIR, file), 'utf8').trim();
  const fillAttr = color ? ` fill="${color}"` : '';

  return raw
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/<svg/, `<svg width="${size}" height="${size}"${fillAttr}`);
}
