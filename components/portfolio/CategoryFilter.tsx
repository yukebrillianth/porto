import Link from 'next/link';

import { portfolioCategories } from '@/constants';
import { cn } from '@/lib/cn';

type CategoryFilterProps = {
  active: string;
  query?: string;
  className?: string;
};

/**
 * The 2022 series/tab chip: a `#101010` inset pill whose 1px border is a gradient
 * hairline, painted with the double-background trick. Matches SeriesPills on /blog.
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

function buildHref(category: string, query?: string) {
  const params = new URLSearchParams();

  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);

  const search = params.toString();
  return search ? `/projects?${search}` : '/projects';
}

export function CategoryFilter({
  active,
  query,
  className,
}: CategoryFilterProps) {
  return (
    <nav
      role="group"
      aria-label="Filter projects by category"
      className={className}
    >
      <ul className="flex flex-wrap items-center justify-center gap-3">
        {portfolioCategories.map((category) => {
          const isActive = category.value === active;

          return (
            <li key={category.value}>
              <Link
                href={buildHref(category.value, query)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  pillBase,
                  isActive ? 'text-dark bg-white' : 'text-white'
                )}
                style={isActive ? undefined : hairlineFill}
              >
                {category.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
