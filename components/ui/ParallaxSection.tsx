'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

import { cn } from '@/lib/cn';

const LIP_OVERLAP = '-mt-[300px]';
const SAFETY_FILL = 'h-[160px]';
const RISE = 180;

type ParallaxSectionProps = {
  children: ReactNode;
  offset?: number;
  sheet?: 'light' | 'dark';
  className?: string;
};

export function ParallaxSection({
  children,
  sheet,
  className,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

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
      className={cn('relative z-100', sheet && LIP_OVERLAP, className)}
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
          sheet && 'overflow-hidden',
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
