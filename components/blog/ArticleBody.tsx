'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

type ArticleBodyProps = {
  html: string;
  className?: string;
};

export function ArticleBody({ html, className }: ArticleBodyProps) {
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const copyButton = target.closest<HTMLButtonElement>('[data-copy-btn]');
      if (copyButton) {
        const code = copyButton
          .closest('.code-block')
          ?.querySelector('pre code');
        if (!code) return;

        void navigator.clipboard.writeText(code.textContent || '');
        const label = copyButton.querySelector('.copy-label');
        if (label) {
          label.textContent = 'Copied!';
          window.setTimeout(() => {
            label.textContent = 'Copy';
          }, 2_000);
        }
        return;
      }

      const toggleHeading = target.closest<HTMLElement>('.kg-toggle-heading');
      const card = toggleHeading?.closest<HTMLElement>('.kg-toggle-card');
      if (card) {
        const isClosed = card.getAttribute('data-kg-toggle') === 'close';
        card.setAttribute('data-kg-toggle', isClosed ? 'open' : 'close');
      }
    }

    const article = articleRef.current;
    article?.addEventListener('click', handleClick);
    return () => article?.removeEventListener('click', handleClick);
  }, []);

  return (
    <article
      ref={articleRef}
      className={cn('prose-content mx-auto w-full max-w-[720px]', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
