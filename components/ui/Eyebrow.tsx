import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Section label with the signature outdented orange hairline rule - a 32px line
 * raised to the superscript baseline, sitting 1em before the text.
 *
 * @example
 * <Eyebrow>MY EDUCATION</Eyebrow>
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        'block text-[13px] leading-[23px] font-semibold',
        "before:border-primary before:mr-[1em] before:inline-block before:w-[32px] before:align-super before:content-['']",
        // The 2022 rule borders all four sides of a zero-height inline block,
        // which renders as a 2px bar. `border-t` alone gives half that.
        'before:border',
        className
      )}
    >
      {children}
    </span>
  );
}
