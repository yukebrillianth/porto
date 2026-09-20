'use client';

import { useMemo } from 'react';

import { cn } from '@/lib/cn';

type TocItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

type TableOfContentsProps = {
  html: string;
  className?: string;
};

function decodeEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function extractItems(html: string): TocItem[] {
  const headingPattern = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(html)) !== null) {
    const attributes = match[2];
    const label = match[3]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!label) continue;

    const explicitId = attributes.match(/\bid="([^"]+)"/i)?.[1];
    const id =
      explicitId ||
      label
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    if (!id) continue;

    items.push({
      id,
      label: decodeEntities(label),
      level: Number(match[1]) as 2 | 3,
    });
  }

  return items;
}

export function TableOfContents({ html, className }: TableOfContentsProps) {
  const items = useMemo(() => extractItems(html), [html]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'mb-12 rounded-xl border border-black/10 bg-black/[0.025] p-5 md:p-6',
        className
      )}
    >
      <p className="font-sans text-[12px] font-bold tracking-[0.12em] text-black/50 uppercase">
        On this page
      </p>
      <ol className="mt-3 space-y-2 text-[15px] leading-6">
        {items.map((item, index) => (
          <li
            key={`${item.id}-${index}`}
            className={cn(item.level === 3 && 'pl-4 text-black/60')}
          >
            <a
              href={`#${item.id}`}
              className="hover:text-primary font-sans font-medium text-black/75 transition"
            >
              <span className="mr-2 text-black/30">{index + 1}.</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
