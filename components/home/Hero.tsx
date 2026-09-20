'use client';

import type { ComponentType } from 'react';
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

/**
 * The hero.
 *
 * The decorative frame - violet ellipse glow plus two orbit arcs - is the Figma
 * export in `public/hero-frame.svg`. The photo is layered on top as a real
 * `next/image` rather than being embedded in that SVG, for two reasons: the
 * original export inlined it as base64 (656KB down to 2.4KB without it), and
 * SVGs loaded through <img> cannot resolve external image references, so an
 * `xlink:href` to the PNG would simply render nothing.
 *
 * The two chip badges that used to live inside the SVG were Figma vector
 * outlines, so their text was uneditable. They are rebuilt below as real HTML,
 * which also lets them float independently of the frame.
 *
 * Geometry is taken from the export's 1583x684 viewBox, where the photo sits at
 * x=467 y=210 w=621 h=474 - expressed below as percentages so the two layers
 * stay locked together at every width.
 */
const PHOTO = {
  left: `${(467 / 1583) * 100}%`,
  top: `${(210 / 684) * 100}%`,
  width: `${(621 / 1583) * 100}%`,
  height: `${(474 / 684) * 100}%`,
};

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

type Chip = {
  label: string;
  sublabel?: string;
  Icon: ComponentType<ChipIconProps>;
  /** Position within the 1583x684 frame, as percentages of its box. */
  left: string;
  top: string;
  /** Offsets the bob so the three chips never move in unison. */
  delay: number;
  duration: number;
};

/**
 * Chip placement. The first two keep the original Figma anchors (x=366 y=399
 * and x=971 y=530); the third is new, parked to the upper right of the photo so
 * the trio forms a triangle around it. None of them cross the face, which sits
 * around 44-55% across and 31-48% down.
 */
const CHIPS: Chip[] = [
  {
    label: 'Software Engineer',
    sublabel: 'Building software',
    Icon: SoftwareIcon,
    left: `${(390 / 1583) * 100}%`,
    top: `${(399 / 684) * 100}%`,
    delay: 0,
    duration: 3.4,
  },
  {
    label: 'Robotics Engineer',
    sublabel: 'Building robots',
    Icon: RoboticsIcon,
    left: `${(540 / 1583) * 100}%`,
    top: `${(600 / 684) * 100}%`,
    delay: 0.6,
    duration: 3.8,
  },
  {
    label: 'Network Engineer',
    sublabel: 'Connecting infrastructure',
    Icon: NetworkIcon,
    left: `${(900 / 1583) * 100}%`,
    top: `${(500 / 684) * 100}%`,
    delay: 1.2,
    duration: 3.6,
  },
];

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
    // over empty canvas instead of slicing across the photo.
    <Section as="div" className="pb-[72px] md:pb-[96px]">
      <GlowOrb className="top-[15%] left-[12%]" />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center md:px-0"
      >
        <motion.h1
          variants={fadeUp}
          className="z-50 p-[28px] text-[54px] leading-[72px] font-semibold text-white md:mt-[115px] md:text-center md:text-[72px] md:font-bold"
        >
          Hi, I&apos;m{' '}
          <span className="text-gradient-pan">Yuke Brilliant Hestiavin.</span>
          <br className="hidden md:block" />
          I build software across
          <br className="hidden md:block" /> the stack &amp; for robots.
        </motion.h1>

        <motion.div
          variants={staggerContainer}
          className="relative w-full md:-mt-[150px]"
        >
          {/* Decorative frame: the violet glow and the two orbit arcs. */}
          <motion.div
            variants={scaleIn}
            style={{ y: reduceMotion ? 0 : glowY }}
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

          <motion.div
            variants={fadeIn}
            style={{ ...PHOTO, y: reduceMotion ? 0 : photoY }}
            className="absolute"
          >
            <Image
              src="/hero-photo.png"
              alt="Yuke Brilliant Hestiavin"
              fill
              sizes="(min-width: 768px) 40vw, 60vw"
              priority
              className="object-contain object-bottom"
            />
          </motion.div>

          {/*
            The chips stack into a centred row under the art on mobile, where
            there is no room to float them, and become absolute satellites from
            md up. The inline left/top below is simply ignored while each chip
            is statically positioned.
          */}
          <motion.div
            variants={staggerContainer}
            className="mt-8 flex flex-wrap justify-center gap-3 md:pointer-events-none md:absolute md:inset-0 md:mt-0 md:block"
          >
            {CHIPS.map(
              ({ label, sublabel, Icon, left, top, delay, duration }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  style={{ left, top }}
                  className="md:absolute"
                >
                  <motion.div
                    animate={float}
                    transition={{
                      duration,
                      delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-full bg-white/20 p-2 backdrop-blur-[2px]"
                  >
                    <div className="text-dark flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] leading-none font-semibold md:px-6 md:py-3 md:text-lg">
                      <Icon className="text-primary size-4 shrink-0 md:size-[18px]" />
                      <span className="flex flex-col">
                        {label}
                        <span className="text-primary text-xs">{sublabel}</span>
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
