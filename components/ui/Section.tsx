import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type SectionProps = {
  /**
   * `paper` is `light` without the hairline grid - used for long-form reading
   * surfaces (project details, blog posts) where the grid competes with text.
   */
  tone?: 'dark' | 'light' | 'paper' | 'none';
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
};

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
        'relative',
        tone !== 'none' && 'overflow-hidden',
        tone === 'dark' && 'grid-bg-dark bg-dark text-white',
        tone === 'light' && 'grid-bg-light text-dark bg-white',
        tone === 'paper' && 'text-dark bg-white',
        className
      )}
    >
      {children}
    </Tag>
  );
}

type SectionInnerProps = {
  layout?: 'column' | 'split' | 'split-reverse';
  className?: string;
  children: ReactNode;
};

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
 * Section titles are always short and always end in a period, mirroring the dot
 * in the logo mark.
 *
 * @example
 * <SectionTitle>About Me.</SectionTitle>
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

export function ContentBlock({ className, children }: ContentBlockProps) {
  return <div className={cn('z-10 flex flex-col', className)}>{children}</div>;
}
