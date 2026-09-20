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

const PHOTO_BOX = {
  left: (467 / 1583) * 100,
  top: (210 / 684) * 100,
  width: (621 / 1583) * 100,
  height: (474 / 684) * 100,
} as const;

const PHOTO_RECT = { x: 467, y: 210, width: 621, height: 474 } as const;

const PHOTO_VARS = {
  '--photo-left': `${PHOTO_BOX.left}%`,
  '--photo-top': `${PHOTO_BOX.top}%`,
  '--photo-width': `${PHOTO_BOX.width}%`,
  '--photo-height': `${PHOTO_BOX.height}%`,
} as CSSProperties;

const HERO_LAG = 150;

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

const MOBILE_ANCHORS = {
  'lower-left': 'top-auto right-auto bottom-[36%] left-0 -translate-x-[18%]',
  'below-centre':
    'top-auto right-auto bottom-[20%] left-1/2 -translate-x-1/2 translate-y-1/2',
  'lower-right': 'top-auto right-0 bottom-[46%] left-auto translate-x-[18%]',
} as const;

type MobileAnchor = keyof typeof MOBILE_ANCHORS;

type Chip = {
  label: string;
  sublabel: string;
  Icon: ComponentType<ChipIconProps>;
  x: number;
  y: number;
  mobileAnchor: MobileAnchor;
  delay: number;
  duration: number;
};

const CHIPS: Chip[] = [
  {
    label: 'Software Engineer',
    sublabel: 'Building software',
    Icon: SoftwareIcon,
    x: 420,
    y: 380,
    mobileAnchor: 'lower-left',
    delay: 0,
    duration: 3.4,
  },
  {
    label: 'Robotics Engineer',
    sublabel: 'Building robots',
    Icon: RoboticsIcon,
    x: 600,
    y: 560,
    mobileAnchor: 'below-centre',
    delay: 0.6,
    duration: 3.8,
  },
  {
    label: 'Network Engineer',
    sublabel: 'Connecting infrastructure',
    Icon: NetworkIcon,
    x: 900,
    y: 460,
    mobileAnchor: 'lower-right',
    delay: 1.2,
    duration: 3.6,
  },
];

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

  const heroY = useTransform(scrollYProgress, [0, 1], [0, HERO_LAG]);

  const float = reduceMotion
    ? undefined
    : {
        y: [0, -12, 0],
      };

  return (
    <Section as="div" className="pb-[200px] md:pb-[180px]">
      <GlowOrb className="top-[15%] left-[12%]" />

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ y: reduceMotion ? 0 : heroY }}
        className="relative z-10 flex flex-col items-center md:px-0"
      >
        <motion.h1
          variants={fadeUp}
          aria-label="Hi, I'm Yuke Brilliant Hestiavin. I build software across the stack & for robots."
          className="z-50 p-[28px] text-[54px] leading-[72px] font-semibold text-white md:mt-[115px] md:text-center md:text-[72px] md:font-black"
        >
          Hi, I&apos;m{' '}
          <TypingTitle
            text="Yuke Brilliant Hestiavin."
            className="text-gradient-pan"
          />{' '}
          <br className="hidden md:inline" />I build software across{' '}
          <br className="hidden md:inline" />
          the stack &amp; for robots.
        </motion.h1>

        <motion.div
          variants={staggerContainer}
          className="relative w-full md:-mt-[150px]"
        >
          <motion.div
            variants={scaleIn}
            className="pointer-events-none absolute inset-x-[-60%] bottom-0 z-0 md:static md:inset-x-0 md:top-auto"
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
            style={{ ...PHOTO_VARS }}
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
                  className={`absolute w-fit md:pointer-events-none ${MOBILE_ANCHORS[mobileAnchor]} md:top-[var(--chip-top)] md:left-[var(--chip-left)] md:translate-x-0 md:translate-y-0`}
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
                    <div className="text-dark flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] leading-none font-semibold whitespace-nowrap md:gap-2 md:px-6 md:py-3 md:text-lg">
                      <Icon className="text-primary size-3 shrink-0 md:size-[18px]" />
                      <span className="flex flex-col gap-1">
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
