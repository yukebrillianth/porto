'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';

import {
  EASE_DRAW,
  EASE_OUT,
  fadeIn,
  fadeUp,
  staggerContainer,
  VIEWPORT,
} from '@/components/ui/motion';
import type { TimelineEntry } from '@/constants';
import { cn } from '@/lib/cn';

/**
 * Geometry. The rail sits in a 24px gutter column, the node is a 14px bead
 * centred in it, and the card is padded 24px with a 22px first line - so the
 * node's centre lands at 24 + 11 = 35px, exactly on the card title's baseline
 * box. Change the card padding and these two numbers must move with it.
 */
const NODE_TOP = 'mt-[28px]';
const RAIL_TOP = 'top-[35px]';

/** The rail draws itself downward from the first node. */
const railDraw: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.1, ease: EASE_DRAW },
  },
};

/** Each bead pops onto the rail as its row arrives. */
const nodePop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

type AnimatedTimelineProps = {
  entries: readonly TimelineEntry[];
  className?: string;
};

/**
 * The merged education + experience timeline.
 *
 * Single column: one unbroken rail down the left, every card to its right.
 * The previous version used a 3-column alternating zig-zag whose connector was
 * rebuilt per row, which left visible seams between segments and stranded the
 * node dots in empty space. Here the rail is a *single* element spanning the
 * whole list, so it physically cannot break, and each bead is centred in the
 * same gutter column the rail runs through.
 *
 * `kind` is carried by the bead: work is a solid disc, education is a hollow
 * ring. `current` colours it `primary`; past entries are white. Every bead
 * wears a soft ring so it reads as threaded onto the rail rather than laid
 * beside it.
 *
 * The rail draws downward on scroll into view and the rows stagger in behind
 * it. Under `prefers-reduced-motion` all three collapse to a plain cross-fade.
 */
export function AnimatedTimeline({
  entries,
  className,
}: AnimatedTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  const railVariants = shouldReduceMotion ? fadeIn : railDraw;
  const nodeVariants = shouldReduceMotion ? fadeIn : nodePop;
  const cardVariants = shouldReduceMotion ? fadeIn : fadeUp;

  return (
    <motion.ol
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={cn('relative w-full', className)}
    >
      {/*
        One rail for the whole list. It starts on the first bead and fades out
        below the last one, so the line is continuous between every node
        without needing to measure the final card's height.
      */}
      <motion.span
        aria-hidden="true"
        variants={railVariants}
        className={cn(
          'absolute bottom-0 left-[11px] w-[2px] origin-top rounded-full',
          'from-primary/60 bg-linear-to-b via-white/25 to-white/10',
          '[mask-image:linear-gradient(to_bottom,#000_0%,#000_calc(100%-88px),transparent_100%)]',
          RAIL_TOP
        )}
      />

      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isEducation = entry.kind === 'education';

        return (
          <li
            key={`${entry.org}-${entry.role}`}
            className={cn(
              'grid grid-cols-[24px_1fr] gap-x-4 md:gap-x-6',
              !isLast && 'pb-8 md:pb-10'
            )}
          >
            {/* The bead, centred on the rail and level with the card title. */}
            <div aria-hidden="true" className="flex justify-center">
              <motion.span
                variants={nodeVariants}
                className={cn(
                  'h-[14px] w-[14px] shrink-0 rounded-full',
                  NODE_TOP,
                  entry.current ? 'ring-primary/15' : 'ring-white/10',
                  'ring-4',
                  isEducation
                    ? cn(
                        'bg-dark border-[3px]',
                        entry.current ? 'border-primary' : 'border-white'
                      )
                    : entry.current
                      ? 'bg-primary'
                      : 'bg-white'
                )}
              />
            </div>

            <motion.div
              variants={cardVariants}
              className="bg-surface rounded-[12px] p-6"
            >
              <h3 className="text-[18px] leading-[22px] font-semibold text-white">
                {entry.role}
              </h3>

              <p className="text-muted-dark mt-1 text-[14px] leading-[18px] font-medium">
                {entry.org}
              </p>

              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={cn(
                    'text-[12px] leading-[15px] font-medium',
                    entry.current ? 'text-primary' : 'text-muted-dark'
                  )}
                >
                  {entry.period}
                </span>
                <span
                  aria-hidden="true"
                  className="h-[3px] w-[3px] rounded-full bg-white/25"
                />
                <span className="text-[10px] leading-[15px] font-semibold text-white/40 uppercase">
                  {isEducation ? 'Education' : 'Work'}
                </span>
              </p>

              {entry.detail && (
                <p className="text-muted-dark mt-3 text-[13px] leading-[19px] font-normal">
                  {entry.detail}
                </p>
              )}
            </motion.div>
          </li>
        );
      })}
    </motion.ol>
  );
}
