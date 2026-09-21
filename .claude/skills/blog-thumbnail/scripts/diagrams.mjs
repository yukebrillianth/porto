/**
 * Decorative diagrams.
 *
 * A thumbnail is not a whitepaper, so none of these are accurate - they are
 * shapes that read as "this post is about topology" or "this post is about a
 * pipeline" at 300px wide in a feed. Labels are optional and deliberately
 * short; anything longer than a word or two turns to mush at feed scale.
 *
 * Everything is one SVG with a viewBox, so a diagram drawn once at 480x360
 * survives being dropped into an OG canvas or a 4:5 portrait unchanged.
 */

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { pickIcon, iconSvg, techLogo } from './icons.mjs';

const W = 480;
const H = 360;

/* ==========================================================================
   Primitives
   ========================================================================== */

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** A frosted chip, the diagram's only container. Mirrors the glass variant. */
function chip(
  x,
  y,
  label,
  { w = 150, h = 54, accent = false, color = '#FF9800', isLight = false } = {}
) {
  const fill = accent
    ? 'rgba(255,152,0,0.16)'
    : isLight
      ? 'rgba(0,0,0,0.04)'
      : 'rgba(255,255,255,0.07)';
  const edge = accent
    ? color
    : isLight
      ? 'rgba(0,0,0,0.18)'
      : 'rgba(255,255,255,0.28)';
  const text = accent ? color : isLight ? '#121212' : 'rgba(255,255,255,0.88)';

  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 3.4}"
            fill="${fill}" stroke="${edge}" stroke-width="1.4"/>
      <text x="${x + w / 2}" y="${y + h / 2}" fill="${text}"
            font-family="Gilroy, sans-serif" font-size="21" font-weight="600"
            text-anchor="middle" dominant-baseline="central">${esc(label)}</text>
    </g>`;
}

/** A node dot with a soft halo, for the endpoints of a connector. */
function node(
  x,
  y,
  { r = 7, color = '#FF9800', halo = true, isLight = false } = {}
) {
  const haloOp = isLight ? '0.2' : '0.14';

  return `
    ${halo ? `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="${color}" opacity="${haloOp}"/>` : ''}
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
}

/**
 * A connector. Straight when the endpoints are level, otherwise a cubic with
 * horizontal handles, which is what reads as "wire" rather than "arrow".
 */
function wire(
  x1,
  y1,
  x2,
  y2,
  { dashed = false, opacity = null, width = 2, isLight = false } = {}
) {
  const op = opacity ?? (isLight ? 0.35 : 0.45);
  const col = isLight ? `rgba(0,0,0,${op})` : `rgba(255,255,255,${op})`;
  const mid = (x1 + x2) / 2;
  const d =
    Math.abs(y1 - y2) < 1
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;

  return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${width}"
    stroke-linecap="round" ${dashed ? 'stroke-dasharray="7 9"' : ''}/>`;
}

/** The glyph in a rounded square, used as the anchor of most motifs. */
function glyphTile(
  x,
  y,
  icon,
  { size = 96, color = '#FF9800', isLight = false } = {}
) {
  const inner = size * 0.5;
  const innerSvg =
    techLogo(icon, { size: inner, color }) ??
    iconSvg(icon, { size: inner, color, stroke: 1.5 });

  const bg = isLight ? 'rgba(255,152,0,0.12)' : 'rgba(255,152,0,0.1)';
  const border = isLight ? 'rgba(255,152,0,0.5)' : 'rgba(255,152,0,0.4)';

  return `
    <g>
      <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size / 3.6}"
            fill="${bg}" stroke="${border}" stroke-width="1.6"/>
      <g transform="translate(${x + (size - inner) / 2}, ${y + (size - inner) / 2})">
        ${innerSvg}
      </g>
    </g>`;
}

function svg(children) {
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">${children}</svg>`;
}

/* ==========================================================================
   Motifs
   ========================================================================== */

/** One in, many out. The load balancer, the fan-out, the pub/sub. */
function fanout(data, theme = 'dark') {
  const isLight = theme === 'light';
  const icon = pickIcon(data);
  const outs = [64, 153, 242];

  return svg(`
    ${glyphTile(24, 132, icon, { isLight })}
    ${outs
      .map(
        (y) => `
      ${wire(120, 180, 210, y + 27, { isLight })}
      ${node(210, y + 27, { r: 5, isLight })}
      ${chip(224, y, ['edge', 'node a', 'node b'][outs.indexOf(y)] ?? 'node', { isLight })}`
      )
      .join('')}
    ${node(120, 180, { r: 8, isLight })}`);
}

/** Left to right, stage by stage. Builds, requests, transforms. */
function pipeline(_data, theme = 'dark') {
  const isLight = theme === 'light';
  const stages = ['in', 'work', 'out'];
  const y = 152;
  const reqColor = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.35)';

  return svg(`
    ${stages
      .map((label, i) => {
        const x = 18 + i * 162;
        const link =
          i < stages.length - 1
            ? `${wire(x + 128, y + 28, x + 162, y + 28, { dashed: true, isLight })}
               ${node(x + 145, y + 28, { r: 4, halo: false, color: '#FF9800', isLight })}`
            : '';

        return `${chip(x, y, label, { w: 128, h: 56, accent: i === 1, isLight })}${link}`;
      })
      .join('')}
    <text x="240" y="${y - 38}" fill="${reqColor}" font-family="Gilroy, sans-serif"
          font-size="17" font-weight="500" text-anchor="middle">request</text>`);
}

/** Stacked planes. Architecture posts, layered systems, the OSI joke. */
function stack(data, theme = 'dark') {
  const isLight = theme === 'light';
  const icon = pickIcon(data);
  const rows = [
    { label: 'ui', y: 58 },
    { label: 'service', y: 146 },
    { label: 'store', y: 234 },
  ];

  return svg(`
    ${rows
      .map(
        ({ label, y }, i) => `
      ${chip(96, y, label, { w: 244, h: 62, accent: i === 1, isLight })}
      ${i < rows.length - 1 ? wire(218, y + 62, 218, y + 88, { dashed: true, opacity: 0.3, isLight }) : ''}`
      )
      .join('')}
    ${glyphTile(354, 146, icon, { size: 68, isLight })}`);
}

/** A ring of peers around a hub. Distributed systems, meshes, clusters. */
function mesh(data, theme = 'dark') {
  const isLight = theme === 'light';
  const icon = pickIcon(data);
  const cx = 240;
  const cy = 178;
  const r = 124;
  const ringStroke = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.1)';
  const peers = [0, 1, 2, 3, 4, 5].map((i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;

    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return svg(`
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${ringStroke}" stroke-width="1.4" stroke-dasharray="4 10"/>
    ${peers.map((p) => wire(cx, cy, p.x, p.y, { opacity: 0.18, width: 1.4, isLight })).join('')}
    ${peers
      .map((p, i) =>
        node(p.x, p.y, {
          r: i % 2 ? 6 : 9,
          color: i % 2 ? '#BB34FA' : '#FF9800',
          isLight,
        })
      )
      .join('')}
    ${glyphTile(cx - 42, cy - 42, icon, { size: 84, isLight })}`);
}

/** A round trip. Client asks, server answers. */
function cycle(data, theme = 'dark') {
  const isLight = theme === 'light';
  const icon = pickIcon(data);
  const wireStroke = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  const respColor = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)';

  return svg(`
    ${chip(16, 152, 'client', { w: 136, h: 58, isLight })}
    ${glyphTile(332, 134, icon, { size: 94, isLight })}
    <path d="M 160 168 C 220 128, 280 128, 330 158" fill="none"
          stroke="rgba(255,152,0,0.65)" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M 330 212 C 280 242, 220 242, 160 198" fill="none"
          stroke="${wireStroke}" stroke-width="2.2" stroke-linecap="round"
          stroke-dasharray="7 9"/>
    ${node(246, 133, { r: 5, isLight })}
    ${node(246, 233, { r: 5, color: '#BB34FA', isLight })}
    <text x="246" y="112" fill="rgba(255,152,0,0.85)" font-family="Gilroy, sans-serif"
          font-size="17" font-weight="600" text-anchor="middle">request</text>
    <text x="246" y="264" fill="${respColor}" font-family="Gilroy, sans-serif"
          font-size="17" font-weight="500" text-anchor="middle">response</text>`);
}

/** A rising trace. Performance, growth, benchmarks. */
function trace(data, theme = 'dark') {
  const isLight = theme === 'light';
  const icon = pickIcon(data);
  const lineStroke = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)';
  const points = [
    [40, 272],
    [110, 240],
    [178, 252],
    [246, 186],
    [314, 200],
    [382, 118],
    [440, 92],
  ];
  const path = points
    .map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`)
    .join(' ');
  const area = `${path} L 440 300 L 40 300 Z`;

  return svg(`
    <defs>
      <linearGradient id="traceFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FF9800" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#FF9800" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${[300, 244, 188, 132].map((y) => `<path d="M 40 ${y} L 440 ${y}" stroke="${lineStroke}" stroke-width="1.2"/>`).join('')}
    <path d="${area}" fill="url(#traceFill)"/>
    <path d="${path}" fill="none" stroke="#FF9800" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"/>
    ${node(440, 92, { r: 8, isLight })}
    ${glyphTile(30, 40, icon, { size: 72, isLight })}`);
}

/** A terminal pane with a few lines of type-coloured bars. */
function console_(data, theme = 'dark') {
  const isLight = theme === 'light';

  const winBg = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.045)';
  const winBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
  const barBg = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)';
  const textColor = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.4)';

  const haystack = `${data.category ?? ''} ${data.title ?? ''}`;
  const hasClaude = /\bclaude\b/i.test(haystack);
  const hasNext = /\bnext\.?js\b/i.test(haystack);

  // Short, clean code lines on the left half (max width 175) so the right half stays totally clear
  const rows = [
    { w: 140, c: 'rgba(255,152,0,0.85)' },
    { w: 175, c: isLight ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.3)' },
    { w: 110, c: isLight ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)' },
    { w: 155, c: 'rgba(187,52,250,0.65)' },
    { w: 90, c: isLight ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)' },
  ];

  let tileMarkup = '';
  if (hasClaude && hasNext) {
    // Two clean, non-overlapping tiles side by side on the right side
    // Next.js: x=272, y=184, size=64. Right edge = 336
    // Gap: 16px (336 to 352)
    // Claude: x=352, y=184, size=64. Right edge = 416
    tileMarkup = `
      ${glyphTile(272, 184, 'nextdotjs', { size: 64, isLight, color: '#FF9800' })}
      ${glyphTile(352, 184, 'claude', { size: 64, isLight, color: 'brand' })}`;
  } else if (hasClaude) {
    tileMarkup = glyphTile(340, 180, 'claude', {
      size: 72,
      isLight,
      color: 'brand',
    });
  } else {
    tileMarkup = glyphTile(340, 180, pickIcon(data), { size: 72, isLight });
  }

  return svg(`
    <rect x="24" y="52" width="432" height="256" rx="20"
          fill="${winBg}" stroke="${winBorder}" stroke-width="1.4"/>
    <rect x="24" y="52" width="432" height="44" rx="20" fill="${barBg}"/>
    <rect x="24" y="82" width="432" height="14" fill="${barBg}"/>
    ${[52, 76, 100].map((x, i) => `<circle cx="${x}" cy="74" r="6.5" fill="${['#FF5F57', '#FEBC2E', '#28C840'][i]}"/>`).join('')}
    <text x="240" y="77" fill="${textColor}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13" font-weight="600" text-anchor="middle">~/porto - claude-code</text>
    ${rows
      .map(
        (row, i) => `
      <rect x="52" y="${124 + i * 32}" width="14" height="10" rx="5" fill="rgba(255,152,0,0.7)"/>
      <rect x="76" y="${124 + i * 32}" width="${row.w}" height="10" rx="5" fill="${row.c}"/>`
      )
      .join('')}
    ${tileMarkup}`);
}

/* ==========================================================================
   Custom, per-article diagrams
   ========================================================================== */

/**
 * The primitive kit handed to a bespoke diagram module.
 *
 * The seven motifs below are generic shapes - they say "this post is about a
 * pipeline", not what the pipeline actually does. When a post deserves a
 * drawing of its own argument, author a module against this kit instead and
 * pass it with `--diagram-file`. It keeps the visual language identical
 * (same chip radius, same wire weight, same halo) while the content is free.
 */
export const primitives = {
  W,
  H,
  svg,
  chip,
  node,
  wire,
  glyphTile,
  esc,
  techLogo,
  iconSvg,
  pickIcon,
};

/**
 * Loads a bespoke diagram module and renders it.
 *
 * The module default-exports `(data, theme, primitives) => svgString`. It is
 * imported fresh each run, so editing the file and re-rendering is enough.
 */
export async function customDiagramSvg(path, data, theme = 'dark') {
  const url = pathToFileURL(resolve(process.cwd(), path)).href;
  const mod = await import(`${url}?t=${Date.now()}`);
  const build = mod.default ?? mod.diagram;

  if (typeof build !== 'function') {
    throw new Error(
      `Diagram module "${path}" must default-export a function ` +
        '(data, theme, primitives) => svg string.'
    );
  }

  return build(data, theme, primitives);
}

/* ==========================================================================
   Selection
   ========================================================================== */

const BUILDERS = {
  fanout,
  pipeline,
  stack,
  mesh,
  cycle,
  trace,
  console: console_,
};

export const DIAGRAM_NAMES = Object.keys(BUILDERS);

const MATCHERS = [
  [
    /load.?balanc|nginx|proxy|fan.?out|upstream|shard|replica|pub.?sub/i,
    'fanout',
  ],
  [/pipeline|ci\/cd|build|etl|transform|workflow|stream|queue/i, 'pipeline'],
  [/architect|layer|clean|hexagon|ddd|structure|monorepo|stack/i, 'stack'],
  [/distributed|cluster|mesh|consensus|raft|gossip|peer|swarm/i, 'mesh'],
  [/perf|latency|benchmark|throughput|optimi|profil|metric|scal/i, 'trace'],
  [/terminal|shell|bash|linux|cli|command|log|debug|docker/i, 'console'],
  [/http|rest|api|request|grpc|websocket|fetch|cache/i, 'cycle'],
];

/** Picks a motif from the subject. Everything unmatched becomes a mesh. */
export function pickDiagram(data) {
  const haystack = `${data.category ?? ''} ${data.title ?? ''}`;

  for (const [pattern, name] of MATCHERS) {
    if (pattern.test(haystack)) return name;
  }

  return 'mesh';
}

/** Renders one motif. `name` may be 'auto', 'none', or any DIAGRAM_NAMES key. */
export function diagramSvg(name, data, theme = 'dark') {
  if (name === 'none') return '';

  const key = !name || name === 'auto' ? pickDiagram(data) : name;
  const build = BUILDERS[key];

  if (!build) {
    throw new Error(
      `Unknown diagram "${key}". Try one of: ${DIAGRAM_NAMES.join(', ')}, auto, none`
    );
  }

  return build(data, theme);
}
