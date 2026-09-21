/**
 * A generic flowchart renderer.
 *
 * Diagrams are described as data - columns of chips, optional captions, an
 * optional bracket marking a span, an optional trailing note - and this module
 * turns that description into HTML. Nothing here knows about any particular
 * article; per-article specs live in `diagrams/<slug>.mjs`.
 *
 * The layout is deliberately one-dimensional: a single row of columns read
 * left to right, with a column occasionally stacking two chips to show two
 * things coexisting. Anything that needs more structure than this is a diagram
 * doing too much, and should be split.
 */

import { tokens, chip, arrow, bracket, canvas } from './flowchart.mjs';

const CW = 168;
const GAP = 46;
const ROW_Y = 90;
const CH = 74;
const STACK = 44;

/** Lays out n columns centred across the 1200px canvas. */
function row(n) {
  const total = n * CW + (n - 1) * GAP;
  const x0 = (1200 - total) / 2;

  return Array.from({ length: n }, (_, i) => x0 + i * (CW + GAP));
}

/**
 * Vertical offsets for the chips in one column. One chip sits on the centre
 * line; two straddle it. More than two would stop reading as a single step,
 * so they are spread evenly and left to the caller's judgement.
 */
function stackOffsets(count) {
  if (count === 1) return [0];
  if (count === 2) return [-STACK, STACK];

  const span = STACK * (count - 1);
  return Array.from(
    { length: count },
    (_, i) => -span + i * ((span * 2) / (count - 1))
  );
}

function text(x, y, value, fill, size, weight) {
  return `
    <text x="${x}" y="${y}" fill="${fill}"
          font-family="Gilroy,sans-serif" font-size="${size}"
          font-weight="${weight}" text-anchor="middle"
          dominant-baseline="central">${value}</text>`;
}

/**
 * Renders one diagram from its spec.
 *
 * @param {object} spec
 * @param {string} spec.title      Heading above the diagram.
 * @param {object[]} spec.columns  `{ chips: [{label, sub, accent, dim}], caption }`
 * @param {object} [spec.span]     `{ from, to, label }` column indices, inclusive.
 * @param {string} [spec.note]     A line of prose under the flow.
 */
export function flowHtml(spec, theme, grid, fonts) {
  const t = tokens(theme);
  const columns = spec.columns ?? [];
  const x = row(columns.length);

  const chips = columns
    .flatMap((col, i) => {
      const offsets = stackOffsets(col.chips.length);

      return col.chips.map((c, j) =>
        chip(x[i], ROW_Y + offsets[j], c.label, c.sub, t, {
          accent: Boolean(c.accent),
          dim: Boolean(c.dim),
        })
      );
    })
    .join('');

  const wires = x
    .slice(0, -1)
    .map((xi) => arrow(xi + CW, xi + CW + GAP, ROW_Y + CH / 2, t))
    .join('');

  const captions = columns
    .map((col, i) =>
      col.caption
        ? text(x[i] + CW / 2, ROW_Y + 176, col.caption, t.faint, 16, 600)
        : ''
    )
    .join('');

  const span = spec.span
    ? bracket(
        x[spec.span.from],
        x[spec.span.to] + CW,
        ROW_Y + CH + 22,
        spec.span.label,
        t
      )
    : '';

  const note = spec.note
    ? text(600, ROW_Y + CH + 76, spec.note, t.muted, 18, 400)
    : '';

  return canvas(
    chips + wires + captions + span + note,
    spec.title,
    t,
    grid,
    fonts
  );
}
