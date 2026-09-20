'use client';

import { portfolioCategories } from '@/constants';
import { cn } from '@/lib/cn';

type CategoryFilterProps = {
  /** The `value` of the currently selected category, e.g. `'all'`. */
  active: string;
  onSelect: (value: string) => void;
  className?: string;
};

/**
 * The signature inverted chip row. Inactive chips are transparent with white
 * text; the active one flips to `bg-white text-dark`. Chips sit two-up on
 * mobile (`w-[45%]`) and shrink to their content from `lg` up.
 *
 * The row is full width and `justify-between` on mobile so the two-up chips
 * align to both gutters, then collapses to its content and centres from `md`,
 * matching the 2022 `w-full md:w-auto` MenuWrapper.
 */
export function CategoryFilter({
  active,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        'flex w-full flex-wrap justify-between gap-[25px] md:w-auto md:justify-center',
        className
      )}
    >
      {portfolioCategories.map((category) => {
        const isActive = category.value === active;

        return (
          <button
            key={category.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category.value)}
            className={cn(
              'focus-visible:ring-primary focus-visible:ring-offset-dark w-[45%] rounded px-6 py-3 text-[16px] font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:rounded-full lg:w-auto',
              isActive
                ? 'text-dark bg-white'
                : 'bg-transparent text-white hover:opacity-70'
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
