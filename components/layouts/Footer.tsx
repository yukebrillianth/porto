import Image from 'next/image';
import Link from 'next/link';

import { footerLinks } from '@/constants';
import { cn } from '@/lib/cn';

const credits = [
  {
    label: 'Designed with',
    href: 'https://figma.com',
    icon: '/icons/figma.svg',
    name: 'Figma',
  },
  {
    label: 'Developed with',
    href: 'https://nextjs.org',
    icon: '/icons/next.svg',
    name: 'Next.js',
  },
  {
    label: 'Backend with',
    href: 'https://hygraph.com',
    icon: '/icons/graphcms.svg',
    name: 'Hygraph',
  },
] as const;

type FooterProps = {
  light?: boolean;
  className?: string;
};

export function Footer({ light = false, className }: FooterProps) {
  return (
    <footer
      className={cn(
        'relative',
        !light && 'grid-bg-dark bg-dark',
        'text-white',
        className
      )}
    >
      <div className="container mx-auto flex flex-col items-center justify-center px-[28px] py-[64px] md:py-[70px]">
        <ul className="mb-[22px] flex flex-wrap items-center justify-center gap-x-[30px] gap-y-2">
          {footerLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-primary focus-visible:ring-primary rounded text-[14px] font-medium text-white transition focus-visible:ring-2 focus-visible:outline-none"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mb-[22px] text-[12px] font-bold text-white">Here We Go</p>

        <ul className="flex flex-wrap items-center justify-center gap-x-[30px] gap-y-3">
          {credits.map((credit) => (
            <li key={credit.href}>
              <a
                href={credit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-dark focus-visible:ring-primary flex items-center gap-[10px] rounded text-[12px] font-medium transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
              >
                {credit.label}
                <Image
                  src={credit.icon}
                  alt={credit.name}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
