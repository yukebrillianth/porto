/**
 * The three diagrams for the docker-rollout article, as flat flowcharts.
 *
 * Each one is a single row of chips read left to right. The accent colour
 * marks the one thing the reader should take away - the downtime window, the
 * new container, the drain pause - and nothing else competes with it.
 */

import { tokens, chip, arrow, bracket, canvas } from './flowchart.mjs';

const CW = 168;
const GAP = 46;
const ROW_Y = 90;

/** Lays out n chips centred across the 1200px canvas. */
function row(n) {
  const total = n * CW + (n - 1) * GAP;
  const x0 = (1200 - total) / 2;

  return Array.from({ length: n }, (_, i) => x0 + i * (CW + GAP));
}

/* Diagram 1: why `docker compose up -d` drops requests. */
export function timelineHtml(theme, grid, fonts) {
  const t = tokens(theme);
  const x = row(5);
  const steps = [
    ['up -d', 'perintah jalan'],
    ['stop', 'port tertutup'],
    ['rm + create', 'tidak ada container'],
    ['start', 'cold boot'],
    ['healthy', 'melayani lagi'],
  ];

  const chips = steps
    .map(([l, s], i) => chip(x[i], ROW_Y, l, s, t, { accent: i > 0 && i < 4 }))
    .join('');

  const wires = x
    .slice(0, -1)
    .map((xi) => arrow(xi + CW, xi + CW + GAP, ROW_Y + 37, t))
    .join('');

  const span = bracket(
    x[1],
    x[3] + CW,
    ROW_Y + 96,
    'downtime 5-20 detik, request masuk kena 502',
    t
  );

  return canvas(
    chips + wires + span,
    'Kenapa docker compose up -d bikin downtime',
    t,
    grid,
    fonts
  );
}

/* Diagram 2: the three states docker-rollout moves through. */
export function transitionHtml(theme, grid, fonts) {
  const t = tokens(theme);
  const x = row(3);
  const labels = ['sebelum', 'saat rollout', 'sesudah'];

  const chips = [
    chip(x[0], ROW_Y, 'web-1', 'versi lama', t),
    chip(x[1], ROW_Y - 44, 'web-1', 'masih melayani', t, { dim: true }),
    chip(x[1], ROW_Y + 44, 'web-2', 'sudah healthy', t, { accent: true }),
    chip(x[2], ROW_Y, 'web-2', 'versi baru', t, { accent: true }),
  ].join('');

  const wires =
    arrow(x[0] + CW, x[1], ROW_Y + 37, t) +
    arrow(x[1] + CW, x[2], ROW_Y + 37, t);

  const caps = labels
    .map(
      (l, i) => `<text x="${x[i] + CW / 2}" y="${ROW_Y + 176}" fill="${t.faint}"
        font-family="Gilroy,sans-serif" font-size="16" font-weight="600"
        text-anchor="middle" dominant-baseline="central">${l}</text>`
    )
    .join('');

  return canvas(
    chips + wires + caps,
    'Tiga tahap transisi docker-rollout',
    t,
    grid,
    fonts
  );
}

/* Diagram 3: how the pre-stop hook drains in-flight requests. */
export function drainingHtml(theme, grid, fonts) {
  const t = tokens(theme);
  const x = row(4);
  const steps = [
    ['touch drain', 'pre-stop hook'],
    ['unhealthy', 'healthcheck gagal'],
    ['dicoret', 'proxy berhenti kirim'],
    ['sleep 10', 'upload diselesaikan'],
  ];

  const chips = steps
    .map(([l, s], i) => chip(x[i], ROW_Y, l, s, t, { accent: i === 3 }))
    .join('');

  const wires = x
    .slice(0, -1)
    .map((xi) => arrow(xi + CW, xi + CW + GAP, ROW_Y + 37, t))
    .join('');

  const tail = `<text x="600" y="${ROW_Y + 150}" fill="${t.muted}"
      font-family="Gilroy,sans-serif" font-size="18" font-weight="400"
      text-anchor="middle" dominant-baseline="central">container lama baru
      dimatikan setelah request yang lagi jalan selesai</text>`;

  return canvas(
    chips + wires + tail,
    'Connection draining lewat pre-stop hook',
    t,
    grid,
    fonts
  );
}
