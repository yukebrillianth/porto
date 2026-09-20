'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

import { cn } from '@/lib/cn';

/** How far the sheet overlaps the band above it, in px, per breakpoint. */
const LIP_OVERLAP = '-mt-[20px] md:-mt-[40px]';

/**
 * Height of the static safety fill at the bottom of the flow box. It paints
 * the band's own colour behind the moving sheet, so an upward translate can
 * never reveal the page canvas at the seam with the next section. Keep it
 * comfortably larger than any `offset` passed in.
 */
const SAFETY_FILL = 'h-[120px]';

type ParallaxSectionProps = {
  children: ReactNode;
  /** Vertical travel in px across the scroll range. Negative moves up. */
  offset?: number;
  /**
   * Renders the band as a sheet sliding over the section above it: a rounded
   * top lip, a soft top shadow and a small upward overlap. Pass the wrapped
   * band's own tone so the safety fill matches its background.
   */
  sheet?: 'light' | 'dark';
  className?: string;
};

/**
 * Wraps a section in a scroll-driven parallax.
 *
 * The band is tracked from the moment its top enters the viewport to the
 * moment its bottom leaves it, and translated by `offset` across that range.
 *
 * With `sheet` set, the band also reads as a physical sheet sliding up over
 * the section above it: it overlaps that section slightly, its top corners are
 * rounded into a lip, and a soft shadow lifts it off the band behind. The
 * alternating dark / light rhythm is untouched - only the seam changes.
 *
 * Layering is left to DOM order on purpose. The wrapper sits at `z-0`, so each
 * band paints over the one before it (the lip) while the band after it paints
 * over this one (no overshoot). Raising it further would invert that.
 *
 * A no-op for `prefers-reduced-motion`: the sheet treatment stays, the
 * scroll-linked translate does not.
 *
 * @example
 * <ParallaxSection offset={-32} sheet="light">
 *   <Section tone="light">...</Section>
 * </ParallaxSection>
 */
export function ParallaxSection({
  children,
  offset = -32,
  sheet,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const travel = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <div
      ref={ref}
      className={cn('relative z-0', sheet && LIP_OVERLAP, className)}
    >
      {sheet && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-0 bottom-0',
            SAFETY_FILL,
            sheet === 'light' ? 'bg-white' : 'bg-dark'
          )}
        />
      )}

      <motion.div
        style={{ y: shouldReduceMotion ? 0 : travel }}
        className={cn(
          'relative',
          sheet && 'overflow-hidden rounded-t-[32px]',
          sheet === 'light' &&
            'shadow-[0_-16px_48px_-16px_rgba(255,255,255,0.14)]',
          sheet === 'dark' && 'shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.55)]'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
