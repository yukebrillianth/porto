import Link from 'next/link';

import { cn } from '@/lib/cn';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Query params to preserve across pages, e.g. `{ category, q }`. */
  params?: Record<string, string | undefined>;
  basePath?: string;
  className?: string;
};

/** Pages to render as numbers; anything beyond collapses to an ellipsis. */
const WINDOW_SIZE = 5;

/**
 * Build the visible page list, collapsing long ranges around the current page.
 *
 * @example
 * buildPageList(1, 3)   // [1, 2, 3]
 * buildPageList(7, 12)  // [1, 'gap-left', 6, 7, 8, 'gap-right', 12]
 */
function buildPageList(
  currentPage: number,
  totalPages: number
): (number | 'gap-left' | 'gap-right')[] {
  if (totalPages <= WINDOW_SIZE + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | 'gap-left' | 'gap-right')[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('gap-left');

  for (let page = start; page <= end; page += 1) pages.push(page);

  if (end < totalPages - 1) pages.push('gap-right');

  pages.push(totalPages);

  return pages;
}

/**
 * Link-based pagination: every page is a real URL, so results stay
 * shareable and crawlable, and the control works without client JS.
 */
export function Pagination({
  currentPage,
  totalPages,
  params = {},
  basePath = '/projects',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value && value !== 'all') search.set(key, value);
    }

    if (page > 1) search.set('page', String(page));

    const query = search.toString();

    return query ? `${basePath}?${query}` : basePath;
  }

  const pages = buildPageList(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const arrowClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white';

  return (
    <nav
      aria-label="Project pages"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {isFirst ? (
        <span
          aria-hidden="true"
          className={cn(arrowClass, 'pointer-events-none opacity-30')}
        >
          <ArrowLeftIcon />
        </span>
      ) : (
        <Link
          href={hrefFor(currentPage - 1)}
          rel="prev"
          aria-label="Previous page"
          className={arrowClass}
        >
          <ArrowLeftIcon />
        </Link>
      )}

      {pages.map((page) =>
        typeof page === 'number' ? (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-[15px] font-semibold tabular-nums transition',
              page === currentPage
                ? 'text-dark bg-white shadow-md'
                : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
            )}
          >
            {page}
          </Link>
        ) : (
          <span
            key={page}
            aria-hidden="true"
            className="px-1 text-[15px] font-semibold text-white/30"
          >
            ...
          </span>
        )
      )}

      {isLast ? (
        <span
          aria-hidden="true"
          className={cn(arrowClass, 'pointer-events-none opacity-30')}
        >
          <ArrowRightIcon />
        </span>
      ) : (
        <Link
          href={hrefFor(currentPage + 1)}
          rel="next"
          aria-label="Next page"
          className={arrowClass}
        >
          <ArrowRightIcon />
        </Link>
      )}
    </nav>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M10 13L5 8l5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
