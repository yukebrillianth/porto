import Link from 'next/link';

import { cn } from '@/lib/cn';
import type { PostSeries } from '@/types/content';

/**
 * The 2022 series chip: a `#101010` inset pill whose 1px border is a gradient
 * hairline, painted with the double-background trick (padding-box fill +
 * border-box gradient over a transparent border). It cannot be expressed as a
 * single utility, so it lives here as an inline style.
 */
const hairlineFill = {
  background: [
    'linear-gradient(var(--color-surface-deep), var(--color-surface-deep)) padding-box',
    'linear-gradient(48deg, hsla(0, 0%, 100%, 0.12), hsla(0, 0%, 100%, 0.2)) border-box',
  ].join(', '),
  border: '1px solid transparent',
  boxShadow: '75px -24px 128px rgba(0, 0, 0, 0.6)',
} as const;

const pillBase =
  'inline-block rounded-full px-5 py-2 text-sm font-semibold backdrop-blur-[30px] transition hover:opacity-70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

type SeriesPillsProps = {
  series: readonly PostSeries[];
  /** Slug of the series currently filtering the list, if any. */
  activeSlug?: string;
  /** Preserved so filtering by series does not drop an active search. */
  query?: string;
  className?: string;
};

/** Builds a /blog href that keeps the search term alongside the series filter. */
function buildHref(query: string | undefined, slug?: string) {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (slug) params.set('series', slug);

  const search = params.toString();

  return search ? `/blog?${search}` : '/blog';
}

export function SeriesPills({
  series,
  activeSlug,
  query,
  className,
}: SeriesPillsProps) {
  if (series.length === 0) return null;

  return (
    <nav aria-label="Filter posts by series" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-3">
        <li>
          <Link
            href={buildHref(query)}
            aria-current={activeSlug ? undefined : 'page'}
            className={cn(
              pillBase,
              activeSlug ? 'text-white' : 'text-dark bg-white'
            )}
            style={activeSlug ? hairlineFill : undefined}
          >
            All
          </Link>
        </li>

        {series.map((item) => {
          const active = item.slug === activeSlug;

          return (
            <li key={item.slug}>
              <Link
                href={buildHref(query, item.slug)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  pillBase,
                  active ? 'text-dark bg-white' : 'text-white'
                )}
                style={active ? undefined : hairlineFill}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
