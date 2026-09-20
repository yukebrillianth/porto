'use client';

import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';

/**
 * A typewriter reveal that costs nothing at runtime.
 *
 * The whole animation is CSS. Every character ships in the server-rendered
 * HTML inside its own span, and each span flips from `visibility: hidden` to
 * visible on a staggered `animation-delay`. Nothing re-renders: there is no
 * state, no interval and no requestAnimationFrame, so the gradient span is
 * painted once and the browser drives the rest off the compositor.
 *
 * Three details drove the technique, all verified in a browser rather than
 * assumed:
 *
 * 1. Wrapping characters in spans does not disturb `background-clip: text` on
 *    the parent. The gradient is painted on the parent's box and clipped to
 *    the union of the glyphs, so the per-character boxes are irrelevant to it.
 * 2. `visibility` is the only property that can hide a character here.
 *    `opacity` on a child does nothing, because the visible colour comes from
 *    the *parent's* clipped background, not from the child. `display: none`
 *    and width animations would work but they reflow the line.
 * 3. Because `visibility: hidden` still occupies space, the heading reserves
 *    its full height from the first paint. There is no layout shift, and the
 *    gradient never re-maps mid-animation.
 *
 * Accessibility and SEO are handled by the caller: the heading carries an
 * `aria-label` with the full sentence and this animated span is `aria-hidden`,
 * so a screen reader hears one clean string while crawlers still index the
 * real text nodes. Under `prefers-reduced-motion: reduce` none of the
 * animation rules apply at all - they are gated behind `motion-safe` - so the
 * text is simply present, with no caret.
 */

/**
 * Keyframes cannot be expressed as Tailwind utilities, and `app/globals.css`
 * is owned elsewhere. React hoists and de-duplicates this by `href`, so the
 * rules land in <head> once no matter how many titles render.
 */
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

/** Milliseconds per character. Fast enough to read as crisp, not sluggish. */
const DEFAULT_SPEED = 55;

/**
 * Each character flips to visible at `--typing-index * --typing-step`, and its
 * `::after` caret is lit for exactly one step from that same moment - which is
 * what makes the caret appear to march along with the text.
 *
 * Every arbitrary value here is written out as a literal string. Tailwind
 * scans source text for class names, so a value built by interpolating a
 * constant would never be generated.
 */
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

/**
 * The caret that rests at the end of the line once typing finishes. It blinks
 * three times and then stays hidden, because `forwards` holds the final
 * keyframe's zero opacity.
 */
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
  /** The string to type out. Rendered in full in the HTML. */
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Utilities for the wrapper, e.g. the gradient. */
  className?: string;
};

/**
 * Types `text` out character by character, purely in CSS.
 *
 * Mark the heading that contains this with an `aria-label` carrying the full
 * sentence, so the split text is never announced character by character.
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
  // Spread rather than split('') so astral characters stay in one piece.
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
