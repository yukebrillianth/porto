/**
 * Diagram for "Zero-Downtime Deployment Dengan Docker Rollout".
 *
 * The post's whole argument is one comparison, so the drawing is that
 * comparison and nothing else: two timelines of the same container swap,
 * at the same scale, with the hole and the overlap on the same x range so
 * the eye reads one against the other.
 *
 *   compose up -d   v1 stops -> nothing is listening -> v2 starts.
 *                   The hole in the middle is the 502 the entrants saw
 *                   mid-upload, and the falling request bars underneath say
 *                   what that cost: traffic drops to zero, then recovers.
 *
 *   docker rollout  v2 starts while v1 is still serving. They overlap long
 *                   enough for in-flight uploads to drain, then v1 goes.
 *                   The request bars underneath never dip.
 *
 * The bars are the detail that earns its place: without them the two rows are
 * just "gap" and "no gap"; with them they are "requests died" and "requests
 * kept being served".
 */

const X = 32;
const W = 416;

// The hole above and the overlap below share these coordinates.
const MID_X = 186;
const MID_W = 108;

const BAR_H = 50;
const ROW1_Y = 74;
const ROW2_Y = 224;

const TRAFFIC_H = 26;
const TRAFFIC_GAP = 7;

const ORANGE = '#FF9800';
const RED = '#FF5F57';

export default function diagram(_data, theme, p) {
  const isLight = theme === 'light';
  const ink = isLight ? '0,0,0' : '255,255,255';

  const dead = `rgba(${ink},${isLight ? 0.12 : 0.15})`;
  const deadText = `rgba(${ink},${isLight ? 0.45 : 0.4})`;
  const label = `rgba(${ink},${isLight ? 0.5 : 0.45})`;
  const faint = `rgba(${ink},${isLight ? 0.3 : 0.28})`;

  /** The command that produced this timeline, and what it cost. */
  const heading = (y, text, cost, costColor) => `
    <text x="${X}" y="${y}" fill="${label}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace"
          font-size="14" font-weight="600">${p.esc(text)}</text>
    <text x="${X + W}" y="${y}" fill="${costColor}" font-family="Gilroy, sans-serif"
          font-size="16" font-weight="800" text-anchor="end">${p.esc(cost)}</text>`;

  /** A version label inside a bar. */
  const tag = (x, w, y, text, color) => `
    <text x="${x + w / 2}" y="${y + BAR_H / 2}" fill="${color}"
          font-family="Gilroy, sans-serif" font-size="16" font-weight="700"
          text-anchor="middle" dominant-baseline="central">${p.esc(text)}</text>`;

  /**
   * Incoming requests, as a row of little bars. Height is how many got served.
   * `heights` is a 0..1 fraction per slot across the full width.
   */
  const traffic = (y, heights, color, deadColor) => {
    const slot = W / heights.length;
    const bw = slot * 0.52;

    return heights
      .map((h, i) => {
        const x = X + i * slot + (slot - bw) / 2;
        const bh = Math.max(2, TRAFFIC_H * h);

        return `<rect x="${x.toFixed(1)}" y="${(y + TRAFFIC_H - bh).toFixed(1)}"
                      width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5"
                      fill="${h === 0 ? deadColor : color}"/>`;
      })
      .join('');
  };

  /* ---- row 1: the hole ------------------------------------------------ */

  // Steady traffic, then nothing while no container is listening, then back.
  const died = [1, 0.9, 1, 0.95, 1, 0.9, 0, 0, 0, 0, 0.85, 1, 0.9, 1, 0.95];
  const t1Y = ROW1_Y + BAR_H + TRAFFIC_GAP;

  const row1 = `
    ${heading(ROW1_Y - 16, 'docker compose up -d', '~5s down', RED)}

    <rect x="${X}" y="${ROW1_Y}" width="${MID_X - X}" height="${BAR_H}" rx="9" fill="${dead}"/>
    ${tag(X, MID_X - X, ROW1_Y, 'v1', deadText)}

    <rect x="${MID_X + MID_W}" y="${ROW1_Y}" width="${X + W - MID_X - MID_W}"
          height="${BAR_H}" rx="9" fill="${dead}"/>
    ${tag(MID_X + MID_W, X + W - MID_X - MID_W, ROW1_Y, 'v2', deadText)}

    <rect x="${MID_X}" y="${ROW1_Y}" width="${MID_W}" height="${BAR_H}" rx="9"
          fill="rgba(255,95,87,0.12)" stroke="${RED}" stroke-width="2"
          stroke-dasharray="6 6"/>
    <text x="${MID_X + MID_W / 2}" y="${ROW1_Y + BAR_H / 2}" fill="${RED}"
          font-family="Gilroy, sans-serif" font-size="26" font-weight="800"
          text-anchor="middle" dominant-baseline="central">502</text>

    ${traffic(t1Y, died, faint, 'rgba(255,95,87,0.3)')}
    <text x="${MID_X + MID_W / 2}" y="${t1Y + TRAFFIC_H + 15}" fill="${RED}"
          font-family="Gilroy, sans-serif" font-size="13" font-weight="700"
          text-anchor="middle">upload gagal</text>`;

  /* ---- row 2: no hole ------------------------------------------------- */

  const served = new Array(15).fill(1);
  const t2Y = ROW2_Y + BAR_H + TRAFFIC_GAP;

  const row2 = `
    ${heading(ROW2_Y - 16, 'docker rollout', '0s down', ORANGE)}

    <rect x="${X}" y="${ROW2_Y}" width="${W}" height="${BAR_H}" rx="9"
          fill="rgba(255,152,0,0.2)" stroke="${ORANGE}" stroke-width="2"/>

    <rect x="${MID_X}" y="${ROW2_Y}" width="${MID_W}" height="${BAR_H}"
          fill="rgba(255,152,0,0.38)"/>
    <text x="${MID_X + MID_W / 2}" y="${ROW2_Y + BAR_H / 2}" fill="${ORANGE}"
          font-family="Gilroy, sans-serif" font-size="15" font-weight="800"
          text-anchor="middle" dominant-baseline="central">overlap</text>

    ${tag(X, MID_X - X, ROW2_Y, 'v1', ORANGE)}
    ${tag(MID_X + MID_W, X + W - MID_X - MID_W, ROW2_Y, 'v2', ORANGE)}

    ${traffic(t2Y, served, 'rgba(255,152,0,0.75)', 'rgba(255,152,0,0.75)')}
    <text x="${MID_X + MID_W / 2}" y="${t2Y + TRAFFIC_H + 15}" fill="${ORANGE}"
          font-family="Gilroy, sans-serif" font-size="13" font-weight="700"
          text-anchor="middle">upload lanjut</text>`;

  /* ---- the tool that buys the difference ------------------------------ */

  const logo = p.techLogo('docker', { size: 26, color: '#2496ED' });
  const mark = logo
    ? `<g transform="translate(${X + W / 2 - 13}, 180)">${logo}</g>`
    : '';

  return p.svg(`${row1}${mark}${row2}`);
}
