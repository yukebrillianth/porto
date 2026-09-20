'use client';

import { useEffect, useRef, useState } from 'react';

import type { TimelineEntry } from '@/constants';
import { cn } from '@/lib/cn';

/** Per-entry stagger for the draw-on reveal, in milliseconds. */
const STAGGER_MS = 120;

type AnimatedTimelineProps = {
  entries: readonly TimelineEntry[];
  className?: string;
};

/**
 * The education/experience timeline. Replaces the 2022 `education.svg` — a 68KB
 * static zig-zag of three dark cards joined by a white connector — with a real,
 * data-driven React component: accessible, responsive and editable.
 *
 * The connector draws itself on scroll into view (`stroke-dashoffset` → 0 with
 * the `--ease-draw` easing, staggered 120ms per entry). The 2022 markup had an
 * `onScreen` class that was never wired to anything; this uses a real
 * IntersectionObserver. `prefers-reduced-motion` is honoured globally by
 * globals.css, which collapses these transitions to 0.01ms.
 */
export function AnimatedTimeline({
  entries,
  className,
}: AnimatedTimelineProps) {
  const rootRef = useRef<HTMLOListElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    // State is only ever set from the observer callback — never synchronously
    // in the effect body. Under `prefers-reduced-motion` the reveal still runs,
    // but globals.css collapses every duration to 0.01ms, so it lands instantly
    // instead of animating.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={rootRef} className={cn('relative w-full', className)}>
      {entries.map((entry, index) => {
        const delay = `${index * STAGGER_MS}ms`;
        const isLast = index === entries.length - 1;
        // Cards alternate left/right on desktop, mirroring the 2022 zig-zag.
        const isLeft = index % 2 === 0;

        return (
          <li
            key={`${entry.org}-${entry.role}`}
            className="grid grid-cols-[24px_1fr] gap-x-4 md:grid-cols-[1fr_24px_1fr] md:gap-x-6"
          >
            {/* Desktop-only spacer so right-hand cards clear the rail. */}
            <div
              aria-hidden="true"
              className={cn('hidden md:block', isLeft && 'md:order-none')}
            />

            {/* The white connector rail and its node. */}
            <div
              aria-hidden="true"
              className="relative flex justify-center md:order-2"
            >
              {!isLast && (
                <svg
                  viewBox="0 0 4 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-[4px]"
                  fill="none"
                >
                  {/*
                    pathLength="1" normalises the dash maths, so the draw-on
                    works at any rendered height without measuring the DOM.
                  */}
                  <path
                    d="M2 0V100"
                    stroke="#fff"
                    strokeWidth="4"
                    pathLength="1"
                    strokeDasharray="1"
                    style={{
                      strokeDashoffset: drawn ? 0 : 1,
                      transition: `stroke-dashoffset 600ms var(--ease-draw) ${delay}`,
                    }}
                  />
                </svg>
              )}

              <span
                className={cn(
                  'relative mt-7 h-[18px] w-[18px] shrink-0 rounded-full',
                  'transition-[opacity,transform] duration-300 ease-out',
                  entry.current ? 'bg-primary' : 'bg-white',
                  drawn ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                )}
                style={{ transitionDelay: delay }}
              />
            </div>

            {/* The card. */}
            <div
              className={cn(
                'pb-10 md:order-3',
                isLeft &&
                  'md:order-1 md:col-start-1 md:row-start-1 md:flex md:justify-end'
              )}
            >
              <div
                className={cn(
                  'bg-surface min-h-[86px] rounded-[12px] px-7 py-4',
                  'w-full max-w-[280px]',
                  'transition-[opacity,transform] duration-500 ease-out',
                  drawn
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
                )}
                style={{ transitionDelay: delay }}
              >
                <p className="text-[18px] leading-[22px] font-semibold text-white">
                  {entry.role}
                </p>
                <p className="text-muted-dark mt-1 text-[14px] leading-[18px] font-medium">
                  {entry.org}
                </p>
                <p
                  className={cn(
                    'mt-2 text-[12px] leading-[15px] font-medium',
                    entry.current ? 'text-primary' : 'text-muted-dark'
                  )}
                >
                  {entry.period}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
