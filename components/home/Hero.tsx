import Image from 'next/image';

import { GlowOrb, Section } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Floating white chip badge flanking the hero subject. Outer ring is a soft
 * white/20 glow, inner face is solid white with dark text and an orange icon.
 */
type HeroChipProps = {
  label: string;
  className?: string;
  float?: boolean;
};

function HeroChip({ label, className, float = false }: HeroChipProps) {
  return (
    <div
      className={cn(
        'absolute z-30 rounded-full bg-white/20 p-1.5 backdrop-blur-sm',
        float && 'animate-float',
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="text-primary h-4 w-4 shrink-0"
          fill="currentColor"
        >
          <circle cx="8" cy="8" r="3" />
          <path
            d="M8 .5v3M8 12.5v3M.5 8h3M12.5 8h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="text-dark text-[13px] leading-[16px] font-semibold whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * The hero band. The 2022 original shipped a 315KB SVG with a base64 photo
 * welded inside it; this rebuilds the same composition from a real next/image
 * portrait plus a lightweight decorative SVG frame — violet ellipse glow,
 * two horizon arcs the subject stands on, and two floating chip badges.
 */
export function Hero() {
  return (
    <Section id="hero" className="pt-10 pb-0 md:pt-16">
      <GlowOrb className="top-[15%] left-[12%]" />

      <div className="relative z-10">
        <h1 className="relative z-50 p-[28px] text-[54px] leading-[72px] font-semibold md:text-center md:text-[72px] md:font-bold">
          <span className="text-gradient-pan">Yuke Brilliant Hestiavin.</span>
        </h1>

        {/* Art is pulled up so the subject overlaps the name on desktop. */}
        <div className="relative mx-auto w-full max-w-[560px] md:mt-[-150px]">
          {/* Blurred violet ellipse sitting behind the subject. */}
          <div
            aria-hidden="true"
            className="bg-violet/40 pointer-events-none absolute bottom-[12%] left-1/2 h-[220px] w-[78%] -translate-x-1/2 rounded-[50%] blur-[90px]"
          />

          {/* Two long thin horizon arcs the subject appears to stand on. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 560 700"
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="hero-arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M-40 566C60 626 200 652 280 652s220-26 320-86"
              stroke="url(#hero-arc)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M-40 638C70 692 205 700 280 700s210-8 320-62"
              stroke="url(#hero-arc)"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          <HeroChip
            label="Software Engineer"
            className="top-[24%] -left-2 md:top-[28%] md:left-[-8%]"
            float
          />
          <HeroChip
            label="Robotics"
            className="top-[56%] -right-2 md:top-[52%] md:right-[-4%]"
          />

          {/*
            TODO: swap public/hero-photo.png for the real portrait cutout.
            Any transparent-background portrait PNG drops in unchanged — the
            image is width-constrained and height-auto, so aspect ratio is
            preserved whatever the source dimensions are.
          */}
          <Image
            src="/hero-photo.png"
            alt="Portrait of Yuke Brilliant Hestiavin"
            width={560}
            height={700}
            priority
            className="relative z-20 mx-auto h-auto w-full max-w-[420px] object-contain md:max-w-[560px]"
          />
        </div>
      </div>
    </Section>
  );
}
