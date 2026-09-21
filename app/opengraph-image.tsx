import { ImageResponse } from 'next/og';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { siteConfig } from '@/constants';

/**
 * The social card for every page that does not supply its own image.
 *
 * Generated rather than shipped as a static file: the previous `/og-image.jpg`
 * was referenced everywhere but never existed, so each share rendered blank.
 * A route cannot silently go missing the way a binary can.
 *
 * Satori only does flexbox - no grid, no float - and reads ttf/otf/woff but
 * not woff2, which is why this loads the converted face in `fonts/og/`.
 */

export const alt = `${siteConfig.name} - ${siteConfig.role}`;

export const size = { width: 1200, height: 630 };

export const contentType = 'image/png';

const BG = '#121212';
const ACCENT = '#FF9800';
const TEXT = '#F8F9FA';
const MUTED = 'rgba(248,249,250,0.56)';
const HAIRLINE = 'rgba(248,249,250,0.16)';

export default async function Image() {
  const gilroy = await readFile(
    join(process.cwd(), 'app/fonts/og/Gilroy-Bold.ttf')
  );

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        padding: '72px 80px',
        fontFamily: 'Gilroy',
      }}
    >
      {/* Wordmark. The trailing dot is the brand's, and it carries the one
            accent this card is allowed. */}
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontSize: 34, color: TEXT, letterSpacing: -0.5 }}>
          {siteConfig.shortName}
        </span>
        <span style={{ fontSize: 34, color: ACCENT }}>.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 78,
            lineHeight: 1.08,
            color: TEXT,
            letterSpacing: -2,
          }}
        >
          {siteConfig.name}
        </div>

        {/* The accent rule doubles as the divider, so nothing else needs a
              border and the card keeps a single layer of containment. */}
        <div
          style={{
            display: 'flex',
            width: 96,
            height: 5,
            backgroundColor: ACCENT,
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        <div style={{ display: 'flex', fontSize: 30, color: MUTED }}>
          {siteConfig.role}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${HAIRLINE}`,
          paddingTop: 26,
          fontSize: 22,
          color: MUTED,
        }}
      >
        <span>{siteConfig.url.replace(/^https?:\/\//, '')}</span>
        <span>{siteConfig.location}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Gilroy', data: gilroy, style: 'normal', weight: 700 }],
    }
  );
}
