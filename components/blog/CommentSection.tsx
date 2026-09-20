'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';
import type { PostLanguage } from '@/types/content';

const DEFAULT_REPO = 'yukebrillianth/blog';
const DEFAULT_REPO_ID = 'R_kgDOOZHgzQ';
const DEFAULT_CATEGORY = 'General';
const DEFAULT_CATEGORY_ID = 'DIC_kwDOOZHgzc4CpEWj';

type CommentSectionProps = {
  slug: string;
  language?: PostLanguage;
  className?: string;
};

export function CommentSection({
  slug,
  language = 'id',
  className,
}: CommentSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute(
      'data-repo',
      process.env.NEXT_PUBLIC_GISCUS_REPO || DEFAULT_REPO
    );
    script.setAttribute(
      'data-repo-id',
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID || DEFAULT_REPO_ID
    );
    script.setAttribute(
      'data-category',
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY || DEFAULT_CATEGORY
    );
    script.setAttribute(
      'data-category-id',
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || DEFAULT_CATEGORY_ID
    );
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', language === 'en' ? 'en' : 'id');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }, [slug, language]);

  return (
    <section aria-label="Article comments" className={cn('w-full', className)}>
      <div className="mb-8 flex items-center gap-3">
        <h3 className="font-sans text-[22px] font-bold tracking-tight text-[#121212]">
          Comments
        </h3>
        <span className="h-px flex-1 bg-black/10" aria-hidden="true" />
      </div>

      <div ref={containerRef} className="min-h-[240px] w-full" />
    </section>
  );
}
