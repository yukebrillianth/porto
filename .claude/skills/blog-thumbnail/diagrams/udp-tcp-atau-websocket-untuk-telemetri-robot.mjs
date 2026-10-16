/**
 * Cover diagram for "UDP, TCP, atau WebSocket untuk Telemetri Robot".
 *
 * The post's argument is one question: if this data is late, is it still
 * useful? So the cover shows the same six telemetry packets over two links,
 * with the same one packet lost.
 *
 *   tcp   everything behind the lost packet waits. Nothing arrives for a
 *         while, then four packets land at once, three of them already stale.
 *   udp   the lost one is simply missing. The rest keep arriving on time.
 *
 * The packets are bars at fixed slots on a shared time axis, so the empty
 * stretch in the tcp row and the single dashed slot in the udp row are read
 * against each other.
 */

const X = 32;
const W = 416;
const SLOTS = 12;
const SLOT_W = W / SLOTS;

const BAR_H = 44;
const ROW1_Y = 76;
const ROW2_Y = 208;

const ORANGE = '#FF9800';
const RED = '#FF5F57';

/** Words on the canvas. The English cover reuses `build` with its own set. */
export const LABELS_ID = {
  tcpCost: 'telat semua',
  waiting: 'menunggu',
  udpCost: 'tetap segar',
};

export default function diagram(_data, theme, p) {
  return build(LABELS_ID, theme, p);
}

export function build(labels, theme, p) {
  const isLight = theme === 'light';
  const ink = isLight ? '0,0,0' : '255,255,255';

  const label = `rgba(${ink},${isLight ? 0.5 : 0.45})`;
  const stale = `rgba(${ink},${isLight ? 0.32 : 0.34})`;
  const track = `rgba(${ink},${isLight ? 0.1 : 0.12})`;

  const heading = (y, text, cost, costColor) => `
    <text x="${X}" y="${y}" fill="${label}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace"
          font-size="14" font-weight="600">${p.esc(text)}</text>
    <text x="${X + W}" y="${y}" fill="${costColor}" font-family="Gilroy, sans-serif"
          font-size="16" font-weight="800" text-anchor="end">${p.esc(cost)}</text>`;

  /** One packet. `slot` is a position on the shared time axis, `w` its width. */
  const packet = (slot, y, fill, { w = SLOT_W * 0.62, offset = 0 } = {}) => {
    const x = X + slot * SLOT_W + (SLOT_W - w) / 2 + offset;

    return `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${BAR_H}" rx="5" fill="${fill}"/>`;
  };

  const baseline = (y) =>
    `<rect x="${X}" y="${y + BAR_H + 10}" width="${W}" height="2" rx="1" fill="${track}"/>`;

  /* ---- tcp: wait, then a burst ------------------------------------------ */

  // Slots 0 and 1 arrive. Slot 2 is lost, so 2..6 are an empty wait. The
  // four packets that were held then land packed into the last slots.
  const burst = [7.2, 8.15, 9.1, 10.05];

  const row1 = `
    ${heading(ROW1_Y - 16, 'tcp', labels.tcpCost, RED)}
    ${baseline(ROW1_Y)}
    ${packet(0, ROW1_Y, stale)}
    ${packet(1, ROW1_Y, stale)}

    <rect x="${X + 2 * SLOT_W + 4}" y="${ROW1_Y}" width="${5 * SLOT_W - 8}" height="${BAR_H}" rx="9"
          fill="rgba(255,95,87,0.1)" stroke="${RED}" stroke-width="2" stroke-dasharray="6 6"/>
    <text x="${X + 4.5 * SLOT_W}" y="${ROW1_Y + BAR_H / 2}" fill="${RED}"
          font-family="Gilroy, sans-serif" font-size="17" font-weight="800"
          text-anchor="middle" dominant-baseline="central">${p.esc(labels.waiting)}</text>

    ${burst.map((s, i) => packet(s, ROW1_Y, i === 3 ? ORANGE : stale, { w: SLOT_W * 0.8 })).join('')}`;

  /* ---- udp: one gap, nothing else is held ------------------------------- */

  const row2 = `
    ${heading(ROW2_Y - 16, 'udp', labels.udpCost, ORANGE)}
    ${baseline(ROW2_Y)}
    ${[0, 1].map((s) => packet(s, ROW2_Y, stale)).join('')}

    <rect x="${X + 2 * SLOT_W + (SLOT_W - SLOT_W * 0.62) / 2}" y="${ROW2_Y}"
          width="${SLOT_W * 0.62}" height="${BAR_H}" rx="5"
          fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="4 4"/>

    ${[3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => packet(s, ROW2_Y, s === 11 ? ORANGE : `rgba(255,152,0,0.55)`)).join('')}`;

  return p.svg(`${row1}${row2}`);
}
