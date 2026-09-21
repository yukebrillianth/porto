/**
 * Flat flowcharts for article diagrams.
 *
 * House style, borrowed from the site's own thumbnails: one accent colour,
 * hairline strokes, lowercase labels, no fills that read as "status pill".
 * A diagram is a row of chips joined by wires - nothing nests, nothing glows.
 */

const W = 1200;
const H = 675;

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function tokens(theme = 'dark') {
  const light = theme === 'light';

  return {
    light,
    bg: light ? '#F8F9FA' : '#121212',
    text: light ? '#121212' : '#FFFFFF',
    muted: light ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.55)',
    faint: light ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.34)',
    edge: light ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.16)',
    wire: light ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)',
    accent: '#FF9800',
    gridOpacity: light ? 0.035 : 0.05,
    gridInvert: light ? 'filter:invert(1);' : '',
  };
}

/** A chip: the only container in the visual language. */
export function chip(x, y, label, sub, t, opts = {}) {
  const { w = 168, h = 74, accent = false, dim = false } = opts;
  const stroke = accent ? t.accent : t.edge;
  const label_y = sub ? y + h / 2 - 11 : y + h / 2;
  const op = dim ? 0.45 : 1;

  return `
    <g opacity="${op}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"
            fill="none" stroke="${stroke}" stroke-width="1.4"/>
      <text x="${x + w / 2}" y="${label_y}" fill="${accent ? t.accent : t.text}"
            font-family="Gilroy,sans-serif" font-size="21" font-weight="600"
            text-anchor="middle" dominant-baseline="central">${esc(label)}</text>
      ${
        sub
          ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" fill="${t.muted}"
            font-family="Gilroy,sans-serif" font-size="15" font-weight="400"
            text-anchor="middle" dominant-baseline="central">${esc(sub)}</text>`
          : ''
      }
    </g>`;
}

/** A horizontal wire with a small arrowhead. */
export function arrow(x1, x2, y, t, dashed = false) {
  const head = `M ${x2 - 7} ${y - 4.5} L ${x2} ${y} L ${x2 - 7} ${y + 4.5}`;

  return `
    <path d="M ${x1} ${y} L ${x2 - 6} ${y}" stroke="${t.wire}" stroke-width="1.4"
          fill="none" ${dashed ? 'stroke-dasharray="4 6"' : ''}/>
    <path d="${head}" stroke="${t.wire}" stroke-width="1.4" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A bracket under a span of the flow, used to mark a duration. */
export function bracket(x1, x2, y, label, t) {
  const mid = (x1 + x2) / 2;

  return `
    <path d="M ${x1} ${y} L ${x1} ${y + 9} L ${x2} ${y + 9} L ${x2} ${y}"
          stroke="${t.accent}" stroke-width="1.4" fill="none"
          stroke-dasharray="4 6" stroke-linecap="round"/>
    <text x="${mid}" y="${y + 32}" fill="${t.accent}"
          font-family="Gilroy,sans-serif" font-size="18" font-weight="600"
          text-anchor="middle" dominant-baseline="central">${esc(label)}</text>`;
}

/**
 * Wraps a diagram body in the shared canvas: solid bg, grid, title, mark.
 *
 * `fonts` is the @font-face block with Gilroy inlined as base64. Without it
 * Chromium silently falls back to a system sans and the diagram stops matching
 * the rest of the site, so the caller always passes it.
 */
export function canvas(body, title, t, grid, fonts = '') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    ${fonts}
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:${W}px;height:${H}px;background:${t.bg};position:relative;overflow:hidden;
      font-family:Gilroy,sans-serif}
    .grid{position:absolute;inset:0;background-image:url(${grid});
      background-size:64px 64px;opacity:${t.gridOpacity};${t.gridInvert}}
    .stage{position:absolute;inset:0;padding:64px 72px;display:flex;
      flex-direction:column;justify-content:space-between}
    h1{font-size:34px;font-weight:700;color:${t.text};letter-spacing:-0.01em}
    .mark{font-size:17px;font-weight:700;color:${t.faint}}
  </style></head><body>
    <div class="grid"></div>
    <div class="stage">
      <h1>${esc(title)}</h1>
      <svg viewBox="0 0 ${W} 300" width="100%" height="300" fill="none"
           xmlns="http://www.w3.org/2000/svg">${body}</svg>
      <div class="mark">Yuke.</div>
    </div>
  </body></html>`;
}
