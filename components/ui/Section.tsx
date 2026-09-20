import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type SectionProps = {
  /** Dark sections are chrome; light sections are for reading content. */
  tone?: 'dark' | 'light';
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A full-width band with the hairline grid background. The page alternates
 * dark → light → dark → light → footer(dark).
 */
export function Section({
  tone = 'dark',
  as: Tag = 'section',
  id,
  className,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'relative overflow-hidden',
        tone === 'dark'
          ? 'grid-bg-dark bg-dark text-white'
          : 'grid-bg-light text-dark bg-white',
        className
      )}
    >
      {children}
    </Tag>
  );
}

type SectionInnerProps = {
  /**
   * `column` centres everything in a stack (About, Portfolio, Latest Posts).
   * `split` is the wrapping row used by Education and Social, where a text
   * block and an illustration sit side by side and wrap on mobile.
   */
  layout?: 'column' | 'split' | 'split-reverse';
  className?: string;
  children: ReactNode;
};

/**
 * The section's inner measure. Every 2022 section centres its content - see
 * Sec. 5.0 of docs/design-brief.md. Do not left-align these to the page gutter.
 */
export function SectionInner({
  layout = 'column',
  className,
  children,
}: SectionInnerProps) {
  return (
    <div
      className={cn(
        'relative z-10 h-full px-7 py-16 md:px-[170px] md:py-32',
        layout === 'column' && 'flex flex-col items-center',
        layout === 'split' &&
          'flex flex-wrap items-center justify-around gap-y-16',
        layout === 'split-reverse' &&
          'flex flex-wrap-reverse items-center justify-around gap-y-16',
        className
      )}
    >
      {children}
    </div>
  );
}

type SectionTitleProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Section titles are always short and always end in a period - mirroring the dot
 * in the logo mark. Pass the period in: <SectionTitle>About Me.</SectionTitle>
 */
export function SectionTitle({ className, children }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'mt-0 text-[3.375rem] leading-[3.687rem] font-semibold',
        className
      )}
    >
      {children}
    </h2>
  );
}

type ContentBlockProps = {
  className?: string;
  children: ReactNode;
};

/**
 * The eyebrow + heading + paragraph unit. The eyebrow hangs at this block's
 * left edge while the heading and paragraph are pushed 80px right of it, so the
 * block reads as a hanging-indent unit rather than a flush-left column.
 */
export function ContentBlock({ className, children }: ContentBlockProps) {
  return <div className={cn('z-10 flex flex-col', className)}>{children}</div>;
}
