'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

import { cn } from '@/lib/cn';

/**
 * How far the sheet pulls up over the band above it.
 *
 * This is half of what kills the gap: the sheet sits in flow overlapping the
 * previous band, so its top edge is always over real pixels rather than over
 * the page canvas.
 */
const LIP_OVERLAP = '-mt-[24px] md:-mt-[48px]';

/**
 * A static block of the sheet's own colour pinned to the bottom of the flow
 * box, painted *behind* the moving sheet.
 *
 * This is the other half. The sheet translates upward, which would otherwise
 * expose the page canvas in the strip it vacates at the bottom. The fill
 * occupies that strip in the sheet's own colour, so the vacated area reads as
 * more sheet. It must stay taller than `RISE`.
 */
const SAFETY_FILL = 'h-[160px]';

/** Sheet travel in px. Small on purpose - this is a seam, not a showpiece. */
const RISE = 56;

type ParallaxSectionProps = {
  children: ReactNode;
  /** @deprecated Ignored. Travel is fixed at `RISE` so seams stay uniform. */
  offset?: number;
  /**
   * Renders the band as a sheet sliding up over the section above it: a
   * rounded top lip, a soft top shadow, and the overlap that closes the seam.
   * Pass the band's own tone so the safety fill matches its background.
   */
  sheet?: 'light' | 'dark';
  className?: string;
};

/**
 * Wraps a section as a sheet that slides up over the band above it.
 *
 * The incoming sheet starts `RISE` px low and settles flush as its top edge
 * reaches the top of the viewport, so it reads as paper sliding over the
 * section behind rather than a panel floating in a gap.
 *
 * ## Why this is a transform and not `position: sticky`
 *
 * A sticky pile-up - each band pinned while the next covers it - is the usual
 * way to build this, and it does not work on this page. It assumes every
 * layer fits in one viewport; every band here (Hero, About, the dark
 * Education/Social/Portfolio band, Latest Posts) is much taller than the
 * screen. Pinned at `top: 0` a tall band freezes while its lower half is
 * still below the fold and the next band then buries it, so that content
 * becomes unreachable. Pinned at `bottom: 0` the bands never unpin, so all
 * four collect at the bottom and the last one paints over the rest. Both were
 * tried; both broke the page. Making sticky work would mean capping every
 * band at `100vh`, which contradicts the layout in docs/design-brief.md.
 *
 * ## Cost
 *
 * `scrollYProgress` is a motion value: it drives `transform` directly without
 * a React re-render, there is no scroll listener and no rAF loop of our own,
 * and `transform` is compositor-only, so no layout or paint is triggered.
 * The spring is what keeps it from feeling mechanically welded to the wheel.
 *
 * `prefers-reduced-motion` pins the travel to 0 - the sheet, lip and shadow
 * stay, the movement does not.
 *
 * @example
 * <ParallaxSection sheet="light">
 *   <Section tone="light">...</Section>
 * </ParallaxSection>
 */
export function ParallaxSection({
  children,
  sheet,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  /**
   * Tracked from the sheet's top entering the viewport to it reaching the
   * top. Tracking further (`end start`) keeps moving the sheet after it has
   * already covered the screen, which drags the lip up across the band above.
   */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const travel = useTransform(scrollYProgress, [0, 1], [RISE, 0]);
  const y = useSpring(travel, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.5,
  });

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
        style={{ y: shouldReduceMotion ? 0 : y }}
        className={cn(
          'relative',
          sheet && 'overflow-hidden rounded-t-2xl lg:rounded-t-4xl',
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
