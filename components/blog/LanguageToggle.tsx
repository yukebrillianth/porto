'use client';

import Link from 'next/link';

import { cn } from '@/lib/cn';
import type { PostLanguage, PostTranslation } from '@/types/content';

type LanguageToggleProps = {
  active: PostLanguage;
  translations: PostTranslation[];
  className?: string;
};

export function LanguageToggle({
  active,
  translations,
  className,
}: LanguageToggleProps) {
  const available = new Map(
    translations.map((translation) => [translation.language, translation])
  );
  const languages: { value: PostLanguage; label: string }[] = [
    { value: 'id', label: 'ID' },
    { value: 'en', label: 'EN' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1',
        className
      )}
      aria-label="Article language"
    >
      {languages.map(({ value, label }) => {
        const translation = available.get(value);
        const isActive = active === value;

        if (isActive) {
          return (
            <span
              key={value}
              aria-current="true"
              className="text-dark rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs"
            >
              {label}
            </span>
          );
        }

        if (translation) {
          return (
            <Link
              key={value}
              href={`/blog/${translation.slug}`}
              hrefLang={value}
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          );
        }

        return (
          <span
            key={value}
            title={`${label} translation not available for this article`}
            className="cursor-not-allowed rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white/20"
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
