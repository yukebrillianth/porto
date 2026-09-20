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
  className?: string;
  children: ReactNode;
};

/** The signature measure: 28px mobile gutters, 170px on desktop. */
export function SectionInner({ className, children }: SectionInnerProps) {
  return (
    <div className={cn('section-x relative z-10 py-16 md:py-32', className)}>
      {children}
    </div>
  );
}

type SectionTitleProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Section titles are always short and always end in a period — mirroring the dot
 * in the logo mark. Pass the period in: <SectionTitle>About Me.</SectionTitle>
 */
export function SectionTitle({ className, children }: SectionTitleProps) {
  return (
    <h2 className={cn('text-[54px] leading-[59px] font-semibold', className)}>
      {children}
    </h2>
  );
}
