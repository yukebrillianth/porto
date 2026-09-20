'use client';

import { useId, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ButtonLink } from '@/components/ui';
import { navLinks } from '@/constants';
import { cn } from '@/lib/cn';

/**
 * The hamburger from the 2022 original. Its character comes from the
 * deliberately short bar (`M31 16H13`) breaking the rhythm of the two
 * full-width rules - stroke-width 2, round caps, on a 32x32 box.
 */
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
      aria-hidden="true"
    >
      <path d="M31 8H1" />
      <path d="M31 16H13" />
      <path d="M31 24H1" />
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

/** Home only matches exactly; every other route also owns its children. */
function isActiveHref(href: string, pathname: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  return (
    <nav
      className={cn(
        'relative z-20 container mx-auto px-[28px] py-[28px] md:py-[50px]',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="focus-visible:ring-primary rounded focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Yuke Brilliant - home"
        >
          <Image
            src="/logo.svg"
            alt="Yuke Brilliant"
            width={89}
            height={25}
            priority
            className="h-auto w-[90px]"
          />
        </Link>

        <div className="flex items-center gap-2 md:order-2">
          <div className="hidden md:block">
            <ButtonLink href="/contact">Let&apos;s Talk</ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls={menuId}
            aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
            className="focus-visible:ring-primary rounded p-1 text-white transition hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none md:hidden"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div
          id={menuId}
          className={cn(
            'w-full md:order-1 md:block md:w-auto',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <ul className="mt-4 flex flex-col md:mt-0 md:flex-row md:items-center md:gap-2">
            {navLinks.map((link) => {
              const active = isActiveHref(link.href, pathname);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded py-2 pr-4 pl-3 font-medium transition md:text-sm',
                      'focus-visible:ring-primary hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none',
                      active ? 'text-primary' : 'text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li className="mt-2 pl-3 md:hidden">
              <ButtonLink href="/contact" onClick={() => setIsOpen(false)}>
                Let&apos;s Talk
              </ButtonLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
