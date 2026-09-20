'use client';

import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';

const KEYFRAMES = `
@keyframes typing-title-char {
  to {
    visibility: visible;
  }
}

@keyframes typing-title-caret {
  from,
  to {
    opacity: 1;
  }
}

@keyframes typing-title-tail {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
`;

const DEFAULT_SPEED = 55;

const CHAR_CLASS = cn(
  'relative',
  'motion-safe:invisible',
  'motion-safe:[animation-name:typing-title-char]',
  'motion-safe:[animation-duration:1ms]',
  'motion-safe:[animation-fill-mode:forwards]',
  'motion-safe:[animation-delay:calc(var(--typing-index)*var(--typing-step))]',
  'after:absolute after:top-[0.16em] after:bottom-[0.16em]',
  'after:left-full after:ml-[0.04em] after:w-[0.06em]',
  'after:bg-primary after:opacity-0',
  "motion-safe:after:content-['']",
  'motion-safe:after:[animation-name:typing-title-caret]',
  'motion-safe:after:[animation-duration:var(--typing-step)]',
  'motion-safe:after:[animation-delay:calc(var(--typing-index)*var(--typing-step))]'
);

const TAIL_CLASS = cn(
  'hidden motion-safe:inline-block',
  'bg-primary h-[0.72em] w-[0.06em] align-[-0.04em]',
  'ml-[0.04em] opacity-0',
  '[animation-name:typing-title-tail]',
  '[animation-duration:0.9s]',
  '[animation-iteration-count:3]',
  '[animation-fill-mode:forwards]',
  '[animation-delay:calc(var(--typing-count)*var(--typing-step))]'
);

type TypingTitleProps = {
  text: string;
  speed?: number;
  className?: string;
};

/**
 * Types text out character by character, purely in CSS.
 *
 * @example
 * <h1 aria-label="Hi, I'm Yuke Brilliant Hestiavin.">
 *   Hi, I&apos;m <TypingTitle text="Yuke Brilliant Hestiavin." />
 * </h1>
 */
export function TypingTitle({
  text,
  speed = DEFAULT_SPEED,
  className,
}: TypingTitleProps) {
  const characters = [...text];

  return (
    <>
      <style href="typing-title" precedence="medium">
        {KEYFRAMES}
      </style>

      <span
        aria-hidden="true"
        style={
          {
            '--typing-step': `${speed}ms`,
            '--typing-count': characters.length,
          } as CSSProperties
        }
        className={className}
      >
        {characters.map((character, index) => (
          <span
            key={`${character}-${index}`}
            style={{ '--typing-index': index } as CSSProperties}
            className={CHAR_CLASS}
          >
            {character}
          </span>
        ))}

        <span className={TAIL_CLASS} />
      </span>
    </>
  );
}
