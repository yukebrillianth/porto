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
      className={cn('flex flex-wrap gap-2.5 lg:justify-end', className)}
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
              'focus-visible:ring-primary focus-visible:ring-offset-dark w-[45%] rounded px-6 py-3 text-[14px] font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:rounded-full lg:w-auto',
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
