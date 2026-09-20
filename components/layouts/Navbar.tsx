'use client';

import { useId, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AnimatePresence, motion } from 'motion/react';

import { ButtonLink } from '@/components/ui';
import { navLinks } from '@/constants';
import { cn } from '@/lib/cn';

function MenuIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M31 16H13" />
      <path d="M31 26.6001H1" />
      <path d="M31 5.3999H1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M24 8L8 24" />
      <path d="M8 8L24 24" />
    </svg>
  );
}

function isActiveHref(href: string, pathname: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

type NavbarProps = {
  className?: string;
  solid?: boolean;
};

export function Navbar({ className, solid = false }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      className={cn(
        'relative z-50 px-[28px] py-[28px] md:py-[50px]',
        solid && 'grid-bg-dark bg-dark',
        className
      )}
    >
      <div className="relative container mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="focus-visible:ring-primary rounded focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Yuke Brilliant - home"
        >
          <Image
            src="/logo.svg"
            alt="Yuke Brilliant"
            width={90}
            height={48}
            priority
            className="h-auto w-[90px]"
          />
        </Link>

        {/* Desktop nav centered */}
        <nav
          aria-label="Main navigation"
          className="hidden md:absolute md:left-1/2 md:block md:-translate-x-1/2"
        >
          <ul className="flex items-center space-x-16">
            {navLinks.map((link) => {
              const active = isActiveHref(link.href, pathname);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block py-1 text-sm font-medium tracking-wide uppercase transition',
                      'focus-visible:ring-primary hover:text-primary focus-visible:ring-2 focus-visible:outline-none',
                      active ? 'text-primary' : 'text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right side: desktop CTA and mobile trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ButtonLink href="/contact">Let&apos;s Talk</ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
            className="focus-visible:ring-primary p-1 text-white transition hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none md:hidden"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              id={menuId}
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full overflow-hidden md:hidden"
            >
              <ul className="mt-6 flex flex-col gap-1 font-medium">
                {navLinks.map((link) => {
                  const active = isActiveHref(link.href, pathname);

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'block py-2.5 text-[16px] font-semibold tracking-wide uppercase transition',
                          active
                            ? 'text-primary'
                            : 'hover:text-primary text-white'
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 mb-2">
                <ButtonLink
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="w-full justify-center text-center text-[18px]"
                >
                  Let&apos;s Talk
                </ButtonLink>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
