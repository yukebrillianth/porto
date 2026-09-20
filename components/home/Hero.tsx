'use client';

import type { ComponentType, CSSProperties } from 'react';
import { useRef } from 'react';

import Image from 'next/image';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

import { GlowOrb, Section } from '@/components/ui';
import {
  fadeIn,
  fadeUp,
  scaleIn,
  staggerContainer,
} from '@/components/ui/motion';
import { TypingTitle } from '@/components/ui/TypingTitle';

/**
 * The hero.
 *
 * The decorative frame - violet ellipse glow plus two orbit arcs - is the
 * Figma export in `public/hero-frame.svg`. The photo is layered on top as a
 * real `next/image` rather than being embedded in that SVG, for two reasons:
 * the original export inlined it as base64 (656KB down to 2.4KB without it),
 * and SVGs loaded through <img> cannot resolve external image references, so
 * an `xlink:href` to the PNG would simply render nothing.
 *
 * The chip badges that used to live inside the SVG were Figma vector outlines,
 * so their text was uneditable. They are rebuilt below as real HTML, which
 * also lets them float independently of the frame.
 *
 * ## Two compositions, one DOM
 *
 * The 2022 site shipped a second 315KB asset, `hero-mobile.svg`, because the
 * frame's 1583x684 box (aspect 2.3) is far too letterboxed to hang a portrait
 * composition off: at 390px wide it is only 169px tall, which is what squashed
 * the photo and pushed the chips over the face.
 *
 * Rather than ship a second asset, the two layouts are expressed as one tree
 * whose boxes swap roles at `md`:
 *
 * - **Mobile.** The photo is the focal point and sits in normal flow at a
 *   fixed aspect ratio, so the column's height is driven by the photo itself.
 *   The frame is pulled out of flow and parked *behind* it, widened past the
 *   viewport so the arcs read as a horizon rather than a squashed ellipse.
 * - **Desktop (md+).** The original arrangement returns: the frame is back in
 *   flow and sets the height, and the photo is absolutely positioned onto it
 *   at the exported coordinates.
 *
 * Because inline styles cannot carry a media query, every coordinate is
 * published as a CSS custom property and consumed by `md:`-prefixed arbitrary
 * utilities. That keeps a single `<Image>` for the photo (one download, one
 * `priority` preload) instead of a hidden desktop/mobile pair.
 */

/**
 * The photo's box within the 1583x684 frame: x=467 y=210 w=621 h=474, as
 * percentages so the two layers stay locked together at every width.
 */
const PHOTO_BOX = {
  left: (467 / 1583) * 100,
  top: (210 / 684) * 100,
  width: (621 / 1583) * 100,
  height: (474 / 684) * 100,
} as const;

/** The same box in the frame's own units, for deriving chip offsets. */
const PHOTO_RECT = { x: 467, y: 210, width: 621, height: 474 } as const;

/** Desktop photo placement, handed to the `md:` utilities as variables. */
const PHOTO_VARS = {
  '--photo-left': `${PHOTO_BOX.left}%`,
  '--photo-top': `${PHOTO_BOX.top}%`,
  '--photo-width': `${PHOTO_BOX.width}%`,
  '--photo-height': `${PHOTO_BOX.height}%`,
} as CSSProperties;

/** How far each layer lags behind the scroll, in px, across the hero. */
const PARALLAX = {
  /** The frame sits furthest back, so it lags the most. */
  glow: 80,
  /** The photo is the near layer: less travel, so it reads as closer. */
  photo: 48,
};

type ChipIconProps = {
  className?: string;
};

function SoftwareIcon({ className }: ChipIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m5 4-3.5 4L5 12" />
      <path d="m11 4 3.5 4L11 12" />
      <path d="M9.25 2.5 6.75 13.5" />
    </svg>
  );
}

function RoboticsIcon({ className }: ChipIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2.5" y="5.5" width="11" height="8" rx="2.5" />
      <path d="M8 2v3.5" />
      <path d="M5.75 9.25h.01M10.25 9.25h.01" />
    </svg>
  );
}

function NetworkIcon({ className }: ChipIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="3" r="1.75" />
      <circle cx="3" cy="13" r="1.75" />
      <circle cx="13" cy="13" r="1.75" />
      <path d="M6.8 4.6 4.2 11.4M9.2 4.6l2.6 6.8M4.75 13h6.5" />
    </svg>
  );
}

/**
 * Where a chip sits on mobile, relative to the photo's box.
 *
 * The face occupies roughly the upper middle of that box, so all three anchors
 * hug the lower edge. Each class list also resets the `inset` and `translate`
 * that the desktop rules will not otherwise override.
 */
const MOBILE_ANCHORS = {
  'lower-left': 'top-auto right-auto bottom-[14%] left-0 -translate-x-[6%]',
  'below-centre':
    'top-auto right-auto bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  'lower-right': 'top-auto right-0 bottom-[30%] left-auto translate-x-[6%]',
} as const;

type MobileAnchor = keyof typeof MOBILE_ANCHORS;

type Chip = {
  label: string;
  sublabel: string;
  Icon: ComponentType<ChipIconProps>;
  /** Position within the 1583x684 frame, in the frame's own units. */
  x: number;
  y: number;
  /** Which corner of the photo this chip hugs on mobile. */
  mobileAnchor: MobileAnchor;
  /** Offsets the bob so the three chips never move in unison. */
  delay: number;
  duration: number;
};

/**
 * Chip placement. The first two keep the original Figma anchors (x=366 y=399
 * and x=971 y=530); the third is new, parked to the right of the photo so the
 * trio forms a triangle around it. None of them cross the face, which sits
 * around 44-55% across and 31-48% down of the frame.
 */
const CHIPS: Chip[] = [
  {
    label: 'Software Engineer',
    sublabel: 'Building software',
    Icon: SoftwareIcon,
    x: 390,
    y: 399,
    mobileAnchor: 'lower-left',
    delay: 0,
    duration: 3.4,
  },
  {
    label: 'Robotics Engineer',
    sublabel: 'Building robots',
    Icon: RoboticsIcon,
    x: 540,
    y: 600,
    mobileAnchor: 'below-centre',
    delay: 0.6,
    duration: 3.8,
  },
  {
    label: 'Network Engineer',
    sublabel: 'Connecting infrastructure',
    Icon: NetworkIcon,
    x: 900,
    y: 500,
    mobileAnchor: 'lower-right',
    delay: 1.2,
    duration: 3.6,
  },
];

/**
 * Restates a chip's frame coordinate relative to the photo's box.
 *
 * All three chips live inside the photo wrapper so that a single element can
 * serve both compositions. The wrapper is the same box in both, only
 * positioned differently, so re-basing the desktop coordinates onto it keeps
 * the exported arrangement pixel-identical while letting the mobile anchors
 * hang off the same parent.
 */
function desktopChipVars({ x, y }: Chip): CSSProperties {
  return {
    '--chip-left': `${((x - PHOTO_RECT.x) / PHOTO_RECT.width) * 100}%`,
    '--chip-top': `${((y - PHOTO_RECT.y) / PHOTO_RECT.height) * 100}%`,
  } as CSSProperties;
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const glowY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.glow]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, PARALLAX.photo]);

  const float = reduceMotion
    ? undefined
    : {
        y: [0, -12, 0],
      };

  return (
    // The About band below is a parallax sheet that overlaps whatever precedes
    // it. The padding here is that overlap's landing zone, so the lip rides
    // over empty canvas instead of slicing across the photo. Mobile needs more
    // of it, because the centre chip hangs below the photo's bottom edge.
    <Section as="div" className="pb-[112px] md:pb-[96px]">
      <GlowOrb className="top-[15%] left-[12%]" />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center md:px-0"
      >
        {/*
          The hard line breaks are desktop-only. On a narrow screen they
          produced badly ragged lines, so mobile wraps naturally instead.

          The heading carries the full sentence as its accessible name and the
          typed span is aria-hidden, so assistive tech reads one clean string
          rather than a pile of single characters. The characters themselves
          are still real text nodes in the server-rendered HTML, so the h1 is
          never empty for crawlers.
        */}
        <motion.h1
          variants={fadeUp}
          aria-label="Hi, I'm Yuke Brilliant Hestiavin. I build software across the stack & for robots."
          className="z-50 p-[28px] text-[54px] leading-[72px] font-semibold text-white md:mt-[115px] md:text-center md:text-[72px] md:font-bold"
        >
          Hi, I&apos;m{' '}
          <TypingTitle
            text="Yuke Brilliant Hestiavin."
            className="text-gradient-pan"
          />
          {/*
            The space before each break matters: with the <br /> suppressed on
            mobile, it is the only thing separating the two sentences, and a
            JSX newline alone would collapse to nothing.
          */}{' '}
          <br className="hidden md:inline" />I build software across{' '}
          <br className="hidden md:inline" />
          the stack &amp; for robots.
        </motion.h1>

        <motion.div
          variants={staggerContainer}
          className="relative w-full md:-mt-[150px]"
        >
          {/*
            Decorative frame: the violet glow and the two orbit arcs.

            On mobile it is lifted out of flow and stretched well past both
            gutters, so the arcs sweep behind the subject as a horizon. From md
            it returns to flow and sets the wrapper's height, which is what the
            absolutely positioned photo is measured against.
          */}
          <motion.div
            variants={scaleIn}
            style={{ y: reduceMotion ? 0 : glowY }}
            className="pointer-events-none absolute inset-x-[-38%] top-[30%] z-0 md:static md:inset-x-0 md:top-auto"
          >
            <Image
              src="/hero-frame.svg"
              alt=""
              aria-hidden="true"
              width={1583}
              height={684}
              priority
              className="h-auto w-full"
            />
          </motion.div>

          {/*
            The photo, and the chips that orbit it.

            Mobile: in flow, centred, its own aspect ratio - so it is the
            element that gives the hero its height and can never be clipped by
            the band below. Desktop: absolute, at the exported coordinates
            carried in by PHOTO_VARS.
          */}
          <motion.div
            variants={fadeIn}
            style={{ ...PHOTO_VARS, y: reduceMotion ? 0 : photoY }}
            className="relative z-10 mx-auto aspect-[621/474] w-[86%] max-w-[420px] md:absolute md:top-[var(--photo-top)] md:left-[var(--photo-left)] md:mx-0 md:aspect-auto md:h-[var(--photo-height)] md:w-[var(--photo-width)] md:max-w-none"
          >
            <Image
              src="/hero-photo.png"
              alt="Yuke Brilliant Hestiavin"
              fill
              sizes="(min-width: 768px) 40vw, 86vw"
              priority
              className="object-contain object-bottom"
            />

            {CHIPS.map((chip) => {
              const { label, sublabel, Icon, mobileAnchor, delay, duration } =
                chip;

              return (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  style={desktopChipVars(chip)}
                  className={`absolute md:pointer-events-none ${MOBILE_ANCHORS[mobileAnchor]} md:top-[var(--chip-top)] md:left-[var(--chip-left)] md:translate-x-0 md:translate-y-0`}
                >
                  <motion.div
                    animate={float}
                    transition={{
                      duration,
                      delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-full bg-white/20 p-1 backdrop-blur-[2px] md:p-2"
                  >
                    {/*
                      Mobile type is roughly half its desktop size. At the old
                      15px/px-4 the three chips read as headings and dominated
                      the composition; at 11px they read as accents.
                    */}
                    <div className="text-dark flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] leading-none font-semibold md:gap-2 md:px-6 md:py-3 md:text-lg">
                      <Icon className="text-primary size-3 shrink-0 md:size-[18px]" />
                      <span className="flex flex-col">
                        {label}
                        <span className="text-primary text-[9px] md:text-xs">
                          {sublabel}
                        </span>
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
