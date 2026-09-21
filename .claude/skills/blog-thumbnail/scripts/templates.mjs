/**
 * The thumbnail designs.
 *
 * Every variant is a pure function of (content, geometry) and returns a full
 * HTML document. Nothing here touches the network: fonts, the grid, icons,
 * diagrams, and the wordmark all arrive as data URIs or inline SVG so a
 * headless Chromium renders identically on any machine, online or not.
 *
 * Design tokens are copied from `app/globals.css` rather than imported.
 */

import { fontFaceCss, gridDataUri, logoSvg } from './assets.mjs';
import { diagramSvg, pickDiagram } from './diagrams.mjs';
import { iconSvg, pickCategoryIcon, pickIcon, techLogo } from './icons.mjs';

/**
 * Returns either a brand SVG from public/icons/ (e.g. docker, react, go)
 * or falls back to an inline line-art glyph.
 */
function renderIconOrLogo(name, size, color = TOKENS.primary) {
  const logo = techLogo(name, { size, color });

  if (logo) return logo;

  return iconSvg(name, { size, color, stroke: 2 });
}

/* ==========================================================================
   Tokens - mirror of the `@theme` block in app/globals.css
   ========================================================================== */

export const TOKENS = {
  dark: '#121212',
  primary: '#FF9800',
  surface: '#1D1D1D',
  surfaceDeep: '#101010',
  mutedDark: '#B8B8B8',
  mutedLight: '#575958',
  violet: '#BB34FA',
  violetDeep: '#B524F9',
  glow: '0px 4px 20px rgba(255, 152, 0, 0.3)',
};

/** The signature ambient light source. The 0.04deg orange seam is load-bearing. */
const ORB_GRADIENT = `conic-gradient(from 180deg at 50% 50%, ${TOKENS.violetDeep} 0deg, ${TOKENS.primary} 0.04deg, ${TOKENS.violet} 360deg)`;

/* ==========================================================================
   Helpers
   ========================================================================== */

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Splits a title so the last words stay together on the final line.
 */
function orphanGuard(title) {
  const words = String(title).trim().split(/\s+/);

  if (words.length < 4) return esc(title);

  const tail = words.slice(-2).join('&nbsp;');

  return `${esc(words.slice(0, -2).join(' '))} ${tail}`;
}

/**
 * Highlights a target keyword with an authentic stabilo marker effect.
 * Supports ==markdown== syntax in the title, explicit highlightTerm, or auto-detects key tech terms.
 */
function formatTitleWithHighlight(rawTitle, highlightTerm) {
  let title = String(rawTitle ?? '').trim();
  let term = highlightTerm;

  if (/==([^=]+)==/.test(title)) {
    const match = title.match(/==([^=]+)==/);
    term = match[1];
    title = title.replace(/==([^=]+)==/g, '$1');
  } else if (!term) {
    const auto = title.match(
      /\b(Claude Code|Next\.?js|Anthropic|Load Balancing|Reverse Proxy|System Design|Microservices|Event-Driven|Deep Dive|High Availability|WebSockets|Concurrency|Machine Learning|Autonomous Robotics|Distributed Systems|Database Indexing|Performance Tuning|NginX|Docker|Kubernetes|PostgreSQL|Redis|TypeScript|GraphQL)\b/i
    );
    if (auto) term = auto[0];
  }

  const guarded = orphanGuard(title);

  if (term && term.trim()) {
    const regex = new RegExp(
      `(${term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    return guarded.replace(regex, '<span class="stabilo">$1</span>');
  }

  return guarded;
}

/** Geometry per output shape. Sizes are multiplied by `u` at render time. */
function metrics(width, height) {
  const ratio = width / height;
  const orientation =
    ratio > 1.3 ? 'landscape' : ratio < 0.95 ? 'portrait' : 'square';

  return {
    orientation,
    u: width / 1200,
    padX: orientation === 'landscape' ? 88 : 72,
    padY: orientation === 'landscape' ? 64 : 84,
    titleSize: orientation === 'landscape' ? 68 : 80,
    titleMin: orientation === 'landscape' ? 36 : 42,
  };
}

/**
 * Shrinks the title until it fits its box. Runs in the page after fonts are ready.
 */
const FIT_SCRIPT = `
function fit() {
  var el = document.querySelector('[data-fit]');
  if (!el) return;
  var box = el.parentElement;
  var min = parseFloat(el.dataset.fitMin);
  var size = parseFloat(el.dataset.fitStart);
  el.style.fontSize = size + 'px';
  var guard = 0;
  while (
    (el.scrollHeight > box.clientHeight + 1 || el.scrollWidth > box.clientWidth + 1) &&
    size > min &&
    guard < 200
  ) {
    size -= 1;
    el.style.fontSize = size + 'px';
    guard++;
  }
}
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(fit);
} else {
  fit();
}
window.__fit = fit;
`;

function shell({ width, height, css, body, background }) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<style>
${fontFaceCss()}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:${width}px;height:${height}px;overflow:hidden;}
body{
  font-family:'Gilroy',system-ui,-apple-system,sans-serif;
  letter-spacing:0;
  -webkit-font-smoothing:antialiased;
  background:${background};
  position:relative;
}
.grid{
  position:absolute;inset:0;
  background-image:url('${gridDataUri()}');
  background-size:cover;background-position:100%;
  pointer-events:none;
}
.orb{position:absolute;border-radius:9999px;background:${ORB_GRADIENT};pointer-events:none;}
.stage{position:relative;z-index:2;width:100%;height:100%;display:flex;}
.stabilo{
  background:#FFE600;
  color:#121212;
  font-weight:800;
  padding:0.02em 0.28em;
  border-radius:0.18em;
  box-decoration-break:clone;
  -webkit-box-decoration-break:clone;
  display:inline;
  box-shadow:0 2px 14px rgba(255,230,0,0.4);
}
${css}
</style></head>
<body>${body}<script>${FIT_SCRIPT}</script></body></html>`;
}

/**
 * Modern author capsule + reading time footer.
 * Clean, minimalist, and far more polished than a plain text line.
 */
function modernFooter(data, u, { dark = true, showLogo = true } = {}) {
  const authorName = esc(data.author ?? 'Yuke');
  const handle = esc(data.handle ?? '@yukebrillianth');
  const initial = authorName.trim().charAt(0).toUpperCase() || 'Y';
  const textColor = dark ? '#fff' : TOKENS.dark;
  const subColor = dark ? 'rgba(255,255,255,0.6)' : TOKENS.mutedLight;
  const capsuleBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const capsuleBorder = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';

  const clockIcon = iconSvg('clock', {
    size: 16 * u,
    color: TOKENS.primary,
    stroke: 2,
  });

  return `
  <div class="footer-row" style="display:flex;align-items:center;justify-content:space-between;width:100%;z-index:3;">
    <div class="author-capsule" style="display:inline-flex;align-items:center;gap:${12 * u}px;padding:${8 * u}px ${20 * u}px ${8 * u}px ${10 * u}px;border-radius:9999px;background:${capsuleBg};border:${1 * u}px solid ${capsuleBorder};backdrop-filter:blur(${10 * u}px);">
      <div class="avatar-circle" style="width:${38 * u}px;height:${38 * u}px;border-radius:9999px;background:${ORB_GRADIENT};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${17 * u}px;box-shadow:${TOKENS.glow};">
        ${initial}
      </div>
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span style="font-size:${16 * u}px;font-weight:700;color:${textColor};">${handle}</span>
        <span style="font-size:${13 * u}px;color:${subColor};font-weight:500;">${esc(data.site ?? 'yukebrillianth.com')}</span>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:${20 * u}px;">
      ${
        data.readTime
          ? `
        <div style="display:inline-flex;align-items:center;gap:${8 * u}px;padding:${8 * u}px ${18 * u}px;border-radius:9999px;background:${capsuleBg};border:${1 * u}px solid ${capsuleBorder};font-size:${15 * u}px;font-weight:600;color:${textColor};">
          ${clockIcon}
          <span>${esc(data.readTime)} MIN READ</span>
        </div>`
          : ''
      }
      ${
        data.badge
          ? `
        <span style="background:${TOKENS.primary};color:#fff;font-weight:700;font-size:${15 * u}px;padding:${8 * u}px ${22 * u}px;border-radius:9999px;box-shadow:${TOKENS.glow};">
          ${esc(data.badge)}
        </span>`
          : ''
      }
      ${
        showLogo
          ? `
        <div class="brand-mark" style="height:${28 * u}px;display:flex;align-items:center;">
          ${logoSvg()}
        </div>`
          : ''
      }
    </div>
  </div>`;
}

/* ==========================================================================
   Variant: signature
   The portfolio house style elevated: 2-column layout in landscape with a
   technical architecture diagram and sleek author capsule.
   ========================================================================== */

function signature(data, m) {
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName =
    data.diagram ?? (isLandscape ? pickDiagram(data) : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data))
    : '';

  const catIcon = renderIconOrLogo(iconName, 20 * u, TOKENS.primary);

  const css = `
.stage{flex-direction:column;justify-content:space-between;padding:${padY * u}px ${padX * u}px;}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 48 * u + 'px;' : 'flex-direction:column;gap:' + 32 * u + 'px;'}
  flex:1;
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 640 * u + 'px;' : 'flex:1;') : 'width:100%;'}
  display:flex;flex-direction:column;justify-content:center;
}
.diagram-col{
  ${isLandscape ? 'width:' + 440 * u + 'px;height:' + 340 * u + 'px;' : 'width:100%;height:' + 380 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.eyebrow-badge{
  display:inline-flex;align-items:center;gap:${10 * u}px;
  padding:${8 * u}px ${18 * u}px;border-radius:${10 * u}px;
  background:rgba(255,152,0,0.12);border:${1 * u}px solid rgba(255,152,0,0.35);
  font-size:${16 * u}px;font-weight:700;color:#fff;text-transform:uppercase;
  align-self:flex-start;margin-bottom:${24 * u}px;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 240 : 280) : 340) * u}px;
  display:flex;align-items:flex-start;
}
.title{font-weight:700;line-height:1.08;color:#fff;}
.brief{
  margin-top:${18 * u}px;font-size:${22 * u}px;line-height:1.5;font-weight:400;
  color:${TOKENS.mutedDark};max-width:${isLandscape ? 600 * u : 860 * u}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.brand-mark svg{height:${28 * u}px;width:auto;display:block;}
`;

  const orbSize = 540 * u;
  const body = `
<div class="grid" style="opacity:.055"></div>
<div class="orb" style="width:${orbSize}px;height:${orbSize}px;right:${-120 * u}px;top:${-140 * u}px;filter:blur(${110 * u}px);opacity:.32"></div>
<div class="stage">
  <div class="content-grid">
    <div class="text-col">
      ${data.category ? `<div class="eyebrow-badge">${catIcon}<span>${esc(data.category)}</span></div>` : ''}
      <div class="titlebox">
        <h1 class="title" data-fit data-fit-start="${titleSize * u}" data-fit-min="${titleMin * u}">${formatTitleWithHighlight(data.title, data.highlight)}</h1>
      </div>
      ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
    </div>
    ${
      showDiagram
        ? `
    <div class="diagram-col">
      ${diagramContent}
    </div>`
        : ''
    }
  </div>
  ${modernFooter(data, u, { dark: true, showLogo: true })}
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: TOKENS.dark,
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: glass
   Derived from the Figma frame & carousel slide aesthetic: frosted category
   chip with icon, bold gradient type, topology diagram, and frosted footer.
   ========================================================================== */

function glass(data, m) {
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName = data.diagram ?? (isLandscape ? 'fanout' : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data))
    : '';

  const catIcon = renderIconOrLogo(iconName, 22 * u, '#fff');

  const css = `
.stage{flex-direction:column;justify-content:space-between;padding:${padY * u}px ${padX * u}px;}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 44 * u + 'px;' : 'flex-direction:column;gap:' + 28 * u + 'px;'}
  flex:1;
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 640 * u + 'px;' : 'flex:1;') : 'width:100%;'}
  display:flex;flex-direction:column;justify-content:center;
}
.diagram-col{
  ${isLandscape ? 'width:' + 450 * u + 'px;height:' + 350 * u + 'px;' : 'width:100%;height:' + 380 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.chip{
  display:inline-flex;align-items:center;gap:${12 * u}px;align-self:flex-start;
  padding:${12 * u}px ${26 * u}px;border-radius:${16 * u}px;
  background:rgba(255,255,255,.09);border:${1.2 * u}px solid rgba(255,255,255,.5);
  backdrop-filter:blur(${12 * u}px);
  font-size:${20 * u}px;font-weight:700;color:#fff;
  box-shadow:0 ${4 * u}px ${16 * u}px rgba(0,0,0,.25);
  margin-bottom:${24 * u}px;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 240 : 280) : 360) * u}px;
  display:flex;align-items:center;
}
.title{
  font-weight:800;line-height:1.05;
  background-image:linear-gradient(135deg,#FFFFFF 0%,rgba(255,255,255,.72) 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.brief{
  margin-top:${16 * u}px;font-size:${22 * u}px;line-height:1.5;font-weight:400;
  color:rgba(255,255,255,.7);max-width:${600 * u}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.brand-mark svg{height:${28 * u}px;width:auto;display:block;}
`;

  const orbA = 600 * u;
  const orbB = 420 * u;
  const background = `radial-gradient(120% 140% at 50% 0%, #292929 0%, #1E1E1E 50%, ${TOKENS.dark} 100%)`;

  const body = `
<div class="grid" style="opacity:.05"></div>
<div class="orb" style="width:${orbA}px;height:${orbA}px;right:${-140 * u}px;top:${-160 * u}px;filter:blur(${130 * u}px);opacity:.32"></div>
<div class="orb" style="width:${orbB}px;height:${orbB}px;left:${-120 * u}px;bottom:${-140 * u}px;filter:blur(${120 * u}px);opacity:.22"></div>
<div class="stage">
  <div class="content-grid">
    <div class="text-col">
      ${data.category ? `<div class="chip">${catIcon}<span>${esc(data.category)}</span></div>` : ''}
      <div class="titlebox">
        <h1 class="title" data-fit data-fit-start="${(titleSize + 4) * u}" data-fit-min="${titleMin * u}">${orphanGuard(data.title)}</h1>
      </div>
      ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
    </div>
    ${
      showDiagram
        ? `
    <div class="diagram-col">
      ${diagramContent}
    </div>`
        : ''
    }
  </div>
  ${modernFooter(data, u, { dark: true, showLogo: true })}
</div>`;

  return shell({
    ...m,
    css,
    body,
    background,
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: terminal
   Raised surface card with macOS window controls, breadcrumb path,
   console/architecture diagram, and clean statusline footer.
   ========================================================================== */

function terminal(data, m) {
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName = data.diagram ?? (isLandscape ? 'console' : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data))
    : '';

  const catIcon = renderIconOrLogo(iconName, 18 * u, TOKENS.primary);

  const css = `
.stage{flex-direction:column;justify-content:center;padding:${padY * u}px ${padX * u}px;}
.card{
  background:${TOKENS.surface};border-radius:${20 * u}px;overflow:hidden;
  box-shadow:0 ${30 * u}px ${80 * u}px rgba(0,0,0,.5);
  border:${1 * u}px solid rgba(255,255,255,0.08);
}
.bar{
  display:flex;align-items:center;gap:${10 * u}px;
  padding:${16 * u}px ${24 * u}px;background:${TOKENS.surfaceDeep};
  border-bottom:${1 * u}px solid rgba(255,255,255,0.06);
}
.led{width:${12 * u}px;height:${12 * u}px;border-radius:9999px;}
.path{
  margin-left:${16 * u}px;font-size:${17 * u}px;font-weight:500;color:${TOKENS.mutedDark};
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.inner{padding:${38 * u}px ${40 * u}px ${32 * u}px;}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 36 * u + 'px;' : 'flex-direction:column;gap:' + 24 * u + 'px;'}
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 600 * u + 'px;' : 'flex:1;') : 'width:100%;'}
}
.prompt{
  display:inline-flex;align-items:center;gap:${8 * u}px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:${18 * u}px;font-weight:600;color:${TOKENS.primary};margin-bottom:${20 * u}px;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 200 : 250) : 320) * u}px;
  display:flex;align-items:flex-start;
}
.title{font-weight:700;line-height:1.1;color:#fff;}
.brief{
  margin-top:${14 * u}px;font-size:${20 * u}px;line-height:1.5;font-weight:400;
  color:${TOKENS.mutedDark};max-width:${560 * u}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.diagram-col{
  ${isLandscape ? 'width:' + 440 * u + 'px;height:' + 300 * u + 'px;' : 'width:100%;height:' + 320 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.statusline{
  margin-top:${30 * u}px;padding-top:${18 * u}px;
  border-top:${1 * u}px solid rgba(255,255,255,0.08);
  display:flex;align-items:center;justify-content:space-between;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:${15 * u}px;color:${TOKENS.mutedDark};
}
.status-pill{
  background:rgba(255,152,0,0.18);color:${TOKENS.primary};
  padding:${4 * u}px ${12 * u}px;border-radius:${6 * u}px;font-weight:700;
}
.brand-mark svg{height:${24 * u}px;width:auto;display:block;}
`;

  const orbSize = 560 * u;
  const slug = data.slug ? `~/blog/${data.slug}` : '~/blog/system-design';
  const categorySlug = data.category
    ? String(data.category).toLowerCase().replace(/\s+/g, '-')
    : 'article';

  const body = `
<div class="grid" style="opacity:.05"></div>
<div class="orb" style="width:${orbSize}px;height:${orbSize}px;left:${-160 * u}px;bottom:${-200 * u}px;filter:blur(${120 * u}px);opacity:.28"></div>
<div class="stage">
  <div class="card">
    <div class="bar">
      <span class="led" style="background:#FF5F57"></span>
      <span class="led" style="background:#FEBC2E"></span>
      <span class="led" style="background:#28C840"></span>
      <span class="path">${esc(slug)}</span>
    </div>
    <div class="inner">
      <div class="content-grid">
        <div class="text-col">
          <div class="prompt">
            ${catIcon}
            <span>$ cat ${esc(categorySlug)}.md</span>
          </div>
          <div class="titlebox">
            <h1 class="title" data-fit data-fit-start="${(titleSize - 4) * u}" data-fit-min="${titleMin * u}">${orphanGuard(data.title)}</h1>
          </div>
          ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
        </div>
        ${
          showDiagram
            ? `
        <div class="diagram-col">
          ${diagramContent}
        </div>`
            : ''
        }
      </div>
      <div class="statusline">
        <div style="display:flex;align-items:center;gap:${14 * u}px;">
          <span class="status-pill">NORMAL</span>
          <span>${esc(data.author ?? '@yukebrillianth')}</span>
          ${data.readTime ? `<span>// ${esc(data.readTime)} min read</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:${18 * u}px;">
          <span>UTF-8</span>
          <span class="brand-mark">${logoSvg()}</span>
        </div>
      </div>
    </div>
  </div>
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: TOKENS.dark,
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: spotlight
   Typographic poster style (bang-motion inspired): giant central orb,
   high-contrast display title, subtle graphic accent, minimal watermark.
   ========================================================================== */

function spotlight(data, m) {
  const { u, padX, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const catIcon = renderIconOrLogo(iconName, 20 * u, TOKENS.primary);

  const css = `
.stage{flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 ${(padX + 24) * u}px;}
.kicker{
  display:inline-flex;align-items:center;gap:${10 * u}px;
  font-size:${18 * u}px;font-weight:700;color:${TOKENS.primary};
  text-transform:uppercase;margin-bottom:${30 * u}px;
  padding:${8 * u}px ${20 * u}px;border-radius:9999px;
  background:rgba(255,152,0,0.12);border:${1 * u}px solid rgba(255,152,0,0.3);
}
.titlebox{
  height:${(isLandscape ? 300 : 520) * u}px;
  display:flex;align-items:center;justify-content:center;
}
.title{font-weight:800;line-height:1.06;color:#fff;}
.rule{
  width:${80 * u}px;height:${4 * u}px;background:${TOKENS.primary};
  border-radius:9999px;margin-top:${36 * u}px;box-shadow:${TOKENS.glow};
}
.brand-mark svg{height:${28 * u}px;width:auto;display:block;}
`;

  const orbSize = 760 * u;
  const body = `
<div class="grid" style="opacity:.05"></div>
<div class="orb" style="width:${orbSize}px;height:${orbSize}px;left:50%;top:46%;transform:translate(-50%,-50%);filter:blur(${140 * u}px);opacity:.32"></div>
<div class="stage">
  ${data.category ? `<div class="kicker">${catIcon}<span>${esc(data.category)}</span></div>` : ''}
  <div class="titlebox">
    <h1 class="title" data-fit data-fit-start="${(titleSize + 12) * u}" data-fit-min="${titleMin * u}">${orphanGuard(data.title)}</h1>
  </div>
  <div class="rule"></div>
  <div style="position:absolute;left:${padX * u}px;right:${padX * u}px;bottom:${44 * u}px;">
    ${modernFooter(data, u, { dark: true, showLogo: true })}
  </div>
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: TOKENS.dark,
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: editorial
   Light paper band style (bang-motion editorial light): high contrast,
   cream base, dark Gilroy type, orange hairline, and process trace graphic.
   ========================================================================== */

function editorial(data, m) {
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName = data.diagram ?? (isLandscape ? 'trace' : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data))
    : '';

  const catIcon = renderIconOrLogo(iconName, 20 * u, TOKENS.primary);

  const css = `
.stage{flex-direction:column;justify-content:space-between;padding:${padY * u}px ${padX * u}px;}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 44 * u + 'px;' : 'flex-direction:column;gap:' + 28 * u + 'px;'}
  flex:1;
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 640 * u + 'px;' : 'flex:1;') : 'width:100%;'}
  display:flex;flex-direction:column;justify-content:center;
}
.diagram-col{
  ${isLandscape ? 'width:' + 440 * u + 'px;height:' + 320 * u + 'px;' : 'width:100%;height:' + 340 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.eyebrow{
  display:inline-flex;align-items:center;gap:${12 * u}px;
  font-size:${17 * u}px;font-weight:700;color:${TOKENS.dark};text-transform:uppercase;
  margin-bottom:${24 * u}px;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 240 : 280) : 360) * u}px;
  display:flex;align-items:flex-start;
}
.title{font-weight:700;line-height:1.08;color:${TOKENS.dark};}
.brief{
  margin-top:${18 * u}px;font-size:${22 * u}px;line-height:1.55;font-weight:400;color:${TOKENS.mutedLight};
  max-width:${600 * u}px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.brand-mark svg{height:${28 * u}px;width:auto;display:block;}
.brand-mark svg path{fill:${TOKENS.dark};}
`;

  const orbSize = 480 * u;
  const body = `
<div class="grid" style="opacity:.05;filter:invert(1)"></div>
<div class="orb" style="width:${orbSize}px;height:${orbSize}px;right:${-140 * u}px;bottom:${-180 * u}px;filter:blur(${120 * u}px);opacity:.16"></div>
<div class="stage">
  <div class="content-grid">
    <div class="text-col">
      ${data.category ? `<div class="eyebrow">${catIcon}<span>${esc(data.category)}</span></div>` : ''}
      <div class="titlebox">
        <h1 class="title" data-fit data-fit-start="${titleSize * u}" data-fit-min="${titleMin * u}">${orphanGuard(data.title)}</h1>
      </div>
      ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
    </div>
    ${
      showDiagram
        ? `
    <div class="diagram-col">
      ${diagramContent}
    </div>`
        : ''
    }
  </div>
  ${modernFooter(data, u, { dark: false, showLogo: true })}
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: '#F8F9FA',
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: carousel
   Directly inspired by the Substack carousel card layout:
   Top: Category pill on left, slide/article tag on right.
   Middle: Bold headline + interactive multi-card / workflow diagram.
   Bottom: Modern author profile capsule + "READ ARTICLE ->" pill.
   ========================================================================== */

function carousel(data, m) {
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName = data.diagram ?? (isLandscape ? 'pipeline' : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data))
    : '';

  const catIcon = renderIconOrLogo(iconName, 20 * u, TOKENS.primary);

  const arrowIcon = iconSvg('arrow', {
    size: 16 * u,
    color: '#fff',
    stroke: 2.2,
  });

  const css = `
.stage{flex-direction:column;justify-content:space-between;padding:${padY * u}px ${padX * u}px;}
.top-bar{
  display:flex;align-items:center;justify-content:space-between;width:100%;
}
.cat-pill{
  display:inline-flex;align-items:center;gap:${10 * u}px;
  padding:${8 * u}px ${20 * u}px;border-radius:${12 * u}px;
  background:rgba(255,255,255,0.08);border:${1 * u}px solid rgba(255,255,255,0.22);
  backdrop-filter:blur(${8 * u}px);
  font-size:${15 * u}px;font-weight:700;color:#fff;text-transform:uppercase;
}
.slide-tag{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:${16 * u}px;font-weight:700;color:${TOKENS.primary};
  background:rgba(255,152,0,0.12);padding:${6 * u}px ${16 * u}px;
  border-radius:${8 * u}px;border:${1 * u}px solid rgba(255,152,0,0.3);
}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 44 * u + 'px;' : 'flex-direction:column;gap:' + 28 * u + 'px;'}
  flex:1;margin-top:${20 * u}px;margin-bottom:${20 * u}px;
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 640 * u + 'px;' : 'flex:1;') : 'width:100%;'}
  display:flex;flex-direction:column;justify-content:center;
}
.diagram-col{
  ${isLandscape ? 'width:' + 450 * u + 'px;height:' + 320 * u + 'px;' : 'width:100%;height:' + 340 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 220 : 270) : 340) * u}px;
  display:flex;align-items:center;
}
.title{font-weight:800;line-height:1.06;color:#fff;}
.brief{
  margin-top:${14 * u}px;font-size:${22 * u}px;line-height:1.5;font-weight:400;
  color:rgba(255,255,255,0.7);max-width:${600 * u}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.action-btn{
  display:inline-flex;align-items:center;gap:${10 * u}px;
  background:${TOKENS.primary};color:#fff;font-weight:700;
  font-size:${16 * u}px;padding:${10 * u}px ${24 * u}px;border-radius:9999px;
  box-shadow:${TOKENS.glow};
}
.brand-mark svg{height:${28 * u}px;width:auto;display:block;}
`;

  const orbSize = 580 * u;
  const body = `
<div class="grid" style="opacity:.05"></div>
<div class="orb" style="width:${orbSize}px;height:${orbSize}px;right:${-100 * u}px;top:${-120 * u}px;filter:blur(${120 * u}px);opacity:.3"></div>
<div class="stage">
  <div class="top-bar">
    <div class="cat-pill">
      ${catIcon}
      <span>${esc(data.category ?? 'ARTICLE')}</span>
    </div>
    <div class="slide-tag">01 // DEEP DIVE</div>
  </div>

  <div class="content-grid">
    <div class="text-col">
      <div class="titlebox">
        <h1 class="title" data-fit data-fit-start="${(titleSize + 2) * u}" data-fit-min="${titleMin * u}">${formatTitleWithHighlight(data.title, data.highlight)}</h1>
      </div>
      ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
    </div>
    ${
      showDiagram
        ? `
    <div class="diagram-col">
      ${diagramContent}
    </div>`
        : ''
    }
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
    <div style="display:flex;align-items:center;gap:${12 * u}px;">
      <div style="width:${42 * u}px;height:${42 * u}px;border-radius:9999px;background:${ORB_GRADIENT};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:${18 * u}px;box-shadow:${TOKENS.glow};">
        ${(data.author ?? 'Y').trim().charAt(0).toUpperCase()}
      </div>
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span style="font-size:${17 * u}px;font-weight:700;color:#fff;">${esc(data.handle ?? '@yukebrillianth')}</span>
        <span style="font-size:${13 * u}px;color:rgba(255,255,255,0.6);">${esc(data.site ?? 'yukebrillianth.com')}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:${18 * u}px;">
      <span class="action-btn">
        <span>READ ARTICLE</span>
        ${arrowIcon}
      </span>
      <span class="brand-mark">${logoSvg()}</span>
    </div>
  </div>
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: '#0D1117',
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Variant: minimal
   Ultra-clean, solid background (no gradients, no orbs):
   - Category tag at top
   - Giant bold headline as the hero
   - Footer: Left logo mark, Right min read
   ========================================================================== */

function minimal(data, m, theme = 'dark') {
  const isLight = theme === 'light';
  const { u, padX, padY, titleSize, titleMin, orientation } = m;
  const isLandscape = orientation === 'landscape';
  const iconName =
    data.icon ??
    (data.category ? pickCategoryIcon(data.category) : pickIcon(data));
  const diagramName =
    data.diagram ??
    (isLandscape
      ? pickDiagram(data)
      : orientation === 'portrait'
        ? pickDiagram(data)
        : 'none');
  const showDiagram = diagramName !== 'none';
  const diagramContent = showDiagram
    ? (data.customDiagram ?? diagramSvg(diagramName, data, theme))
    : '';

  const catIcon = renderIconOrLogo(iconName, 18 * u, TOKENS.primary);

  const clockIcon = iconSvg('clock', {
    size: 16 * u,
    color: TOKENS.primary,
    stroke: 2.2,
  });

  const readTimeText = data.readTime
    ? `${esc(data.readTime)} MIN READ`
    : 'ARTICLE';

  const catTagBg = isLight ? '#FFFFFF' : TOKENS.surface;
  const catTagBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.14)';
  const catTagColor = isLight ? '#121212' : '#ffffff';
  const catTagShadow = isLight ? 'box-shadow:0 1px 4px rgba(0,0,0,0.04);' : '';

  const titleColor = isLight ? '#121212' : '#ffffff';
  const briefColor = isLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)';

  const readPillBg = isLight ? '#FFFFFF' : TOKENS.surface;
  const readPillBorder = isLight
    ? 'rgba(0,0,0,0.12)'
    : 'rgba(255,255,255,0.14)';
  const readPillColor = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)';
  const readPillShadow = isLight
    ? 'box-shadow:0 1px 4px rgba(0,0,0,0.04);'
    : '';

  const brandMarkStyle = isLight ? '.brand-mark svg path{fill:#121212;}' : '';
  const gridStyle = isLight ? 'opacity:.035;filter:invert(1);' : 'opacity:.04;';
  const bg = isLight ? '#F8F9FA' : '#121212';

  const css = `
.stage{flex-direction:column;justify-content:space-between;padding:${padY * 1.05 * u}px ${padX * 1.05 * u}px;}
.top-section{display:flex;align-items:center;width:100%;}
.cat-tag{
  display:inline-flex;align-items:center;gap:${10 * u}px;
  padding:${8 * u}px ${20 * u}px;border-radius:9999px;
  background:${catTagBg};border:${1 * u}px solid ${catTagBorder};${catTagShadow}
  font-size:${15 * u}px;font-weight:700;color:${catTagColor};text-transform:uppercase;letter-spacing:0.04em;
}
.content-grid{
  display:flex;
  ${isLandscape ? 'flex-direction:row;align-items:center;justify-content:space-between;gap:' + 44 * u + 'px;' : 'flex-direction:column;justify-content:center;gap:' + 24 * u + 'px;'}
  flex:1;margin-top:${16 * u}px;margin-bottom:${16 * u}px;
}
.text-col{
  ${isLandscape ? (showDiagram ? 'flex:1;max-width:' + 650 * u + 'px;' : 'flex:1;') : 'width:100%;'}
  display:flex;flex-direction:column;justify-content:center;
}
.diagram-col{
  ${isLandscape ? 'width:' + 440 * u + 'px;height:' + 320 * u + 'px;' : 'width:100%;height:' + 360 * u + 'px;'}
  display:flex;align-items:center;justify-content:center;
}
.titlebox{
  height:${(isLandscape ? (showDiagram ? 240 : 280) : 340) * u}px;
  display:flex;align-items:center;
}
.title{
  font-weight:800;line-height:1.06;color:${titleColor};
  letter-spacing:-0.02em;
}
.brief{
  margin-top:${14 * u}px;font-size:${22 * u}px;line-height:1.5;font-weight:400;
  color:${briefColor};max-width:${600 * u}px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.footer-row{
  display:flex;align-items:center;justify-content:space-between;width:100%;
}
.brand-mark svg{height:${32 * u}px;width:auto;display:block;}
${brandMarkStyle}
.read-pill{
  display:inline-flex;align-items:center;gap:${8 * u}px;
  padding:${8 * u}px ${20 * u}px;border-radius:9999px;
  background:${readPillBg};border:${1 * u}px solid ${readPillBorder};${readPillShadow}
  font-size:${15 * u}px;font-weight:700;color:${readPillColor};letter-spacing:0.04em;
}
`;

  const body = `
<div class="grid" style="${gridStyle}"></div>
<div class="stage">
  <div class="top-section">
    ${
      data.category
        ? `
    <div class="cat-tag">
      ${catIcon}
      <span>${esc(data.category)}</span>
    </div>`
        : ''
    }
  </div>

  <div class="content-grid">
    <div class="text-col">
      <div class="titlebox">
        <h1 class="title" data-fit data-fit-start="${(titleSize + 2) * u}" data-fit-min="${titleMin * u}">${formatTitleWithHighlight(data.title, data.highlight)}</h1>
      </div>
      ${data.brief ? `<p class="brief">${esc(data.brief)}</p>` : ''}
    </div>
    ${
      showDiagram
        ? `
    <div class="diagram-col">
      ${diagramContent}
    </div>`
        : ''
    }
  </div>

  <div class="footer-row">
    <div class="brand-mark">
      ${logoSvg()}
    </div>
    <div class="read-pill">
      ${clockIcon}
      <span>${readTimeText}</span>
    </div>
  </div>
</div>`;

  return shell({
    ...m,
    css,
    body,
    background: bg,
    width: m.width,
    height: m.height,
  });
}

/* ==========================================================================
   Registry
   ========================================================================== */

const BUILDERS = {
  signature,
  glass,
  terminal,
  spotlight,
  editorial,
  carousel,
  minimal: (data, m) => minimal(data, m, 'dark'),
  'minimal-light': (data, m) => minimal(data, m, 'light'),
};

export const VARIANTS = Object.keys(BUILDERS);

export const VARIANT_NOTES = {
  signature:
    'House style. Dark, hairline grid, diagram graphic & sleek author capsule.',
  glass:
    'Frosted chips & server topology diagram, from the Figma frame & carousel style.',
  terminal:
    'Raised surface card with macOS chrome & code/architecture console diagram.',
  spotlight:
    'Central burning orb with high-impact display type & minimal watermark.',
  editorial: 'Light paper band. Dark type on white with process trace graphic.',
  carousel:
    'Substack carousel slide style. High-contrast cards, badges & action footer.',
  minimal:
    'Solid minimalist dark. No gradients, bold headline, tag, left logo & right read time.',
  'minimal-light':
    'Solid minimalist light. Crisp paper, dark bold headline with stabilo, tag, left logo & right read time.',
};

/** Builds one complete HTML document for the given variant and canvas. */
export function renderHtml(variant, data, width, height) {
  const build = BUILDERS[variant];

  if (!build) {
    throw new Error(
      `Unknown variant "${variant}". Try one of: ${VARIANTS.join(', ')}`
    );
  }

  return build(data, { ...metrics(width, height), width, height });
}
