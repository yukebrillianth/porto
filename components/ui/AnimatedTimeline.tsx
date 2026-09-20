'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';

import { EASE_OUT, fadeIn, VIEWPORT } from '@/components/ui/motion';
import type { TimelineEntry } from '@/constants';
import { cn } from '@/lib/cn';

const NODE_TOP = 'mt-[28px]';
const RAIL_TOP = 'top-[35px]';

const railDraw: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const nodePop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

const timelineStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

type AnimatedTimelineProps = {
  entries: readonly TimelineEntry[];
  className?: string;
};

export function AnimatedTimeline({
  entries,
  className,
}: AnimatedTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  const railVariants = shouldReduceMotion ? fadeIn : railDraw;
  const nodeVariants = shouldReduceMotion ? fadeIn : nodePop;
  const cardVariants = shouldReduceMotion ? fadeIn : cardReveal;

  return (
    <motion.ol
      variants={timelineStagger}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={cn('relative w-full', className)}
    >
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
