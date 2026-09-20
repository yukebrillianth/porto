import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import Link from 'next/link';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'ghost' | 'inverted';

const variants: Record<ButtonVariant, string> = {
  /** The signature glow pill. The shadow value is not negotiable. */
  primary: 'bg-primary text-white shadow-glow hover:opacity-70',
  ghost: 'border border-white/20 text-white hover:bg-white/5',
  /** Inverted chip — white on black. Used for active filter states. */
  inverted: 'bg-white text-dark hover:opacity-70',
};

const base = cn(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
  'px-4 py-2 text-[18px] md:px-6 md:py-3 md:text-[14px]',
  'transition focus-visible:ring-2 focus-visible:ring-primary',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-dark focus-visible:outline-none'
);

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & ComponentPropsWithoutRef<'button'>;

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className'>;

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const isExternal = href.startsWith('http');

  return (
    <Link
      href={href}
      className={cn(base, variants[variant], className)}
      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
    </Link>
  );
}
