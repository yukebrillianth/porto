'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';

type PostShareProps = {
  title: string;
  url: string;
  className?: string;
};

function ShareIcon({
  name,
}: {
  name: 'x' | 'linkedin' | 'facebook' | 'whatsapp' | 'link';
}) {
  if (name === 'x') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path d="M11.65 8.47 17.3 2h-1.34l-4.9 5.61L7.14 2H2.62l5.93 8.62L2.62 18h1.34l5.18-5.94L13.28 18h4.52l-6.15-9.53Zm-1.84 2.11-.6-.86L4.45 3h2.06l3.82 5.49.6.86 5.03 7.23H13.9l-4.09-6Z" />
      </svg>
    );
  }

  if (name === 'linkedin') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path d="M4.25 6.25A1.75 1.75 0 1 0 4.25 2.75a1.75 1.75 0 0 0 0 3.5ZM2.75 17.25h3V7.75h-3v9.5ZM7.5 7.75v9.5h3v-5.28c0-1.39.26-2.74 1.99-2.74 1.71 0 1.73 1.6 1.73 2.83v5.19h3v-5.81c0-2.85-.61-5.04-3.9-5.04-1.58 0-2.64.87-3.08 1.69h-.04V7.75H7.5Z" />
      </svg>
    );
  }

  if (name === 'facebook') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path d="M18 10a8 8 0 1 0-9.25 7.9v-5.59H6.72V10h2.03V8.24c0-2 1.19-3.11 3.02-3.11.88 0 1.8.16 1.8.16v1.98h-1.01c-.99 0-1.3.62-1.3 1.25V10h2.23l-.36 2.31h-1.87v5.59A8.003 8.003 0 0 0 18 10Z" />
      </svg>
    );
  }

  if (name === 'whatsapp') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="h-3.5 w-3.5"
      >
        <path d="M10 2a8 8 0 0 0-6.9 12.04L2 18l4.08-1.07A8 8 0 1 0 10 2Zm0 14.65a6.6 6.6 0 0 1-3.37-.92l-.24-.14-2.51.66.67-2.45-.16-.25A6.64 6.64 0 1 1 10 16.65Zm3.64-4.98c-.2-.1-1.18-.58-1.36-.65-.18-.07-.32-.1-.45.1-.13.2-.52.65-.64.79-.12.13-.23.15-.43.05a5.45 5.45 0 0 1-1.61-.99 6.01 6.01 0 0 1-1.11-1.38c-.12-.2 0-.31.09-.41.09-.09.2-.23.3-.35.1-.11.13-.2.2-.32.07-.13.03-.25-.02-.35-.05-.1-.45-1.09-.62-1.5-.16-.39-.33-.34-.45-.34h-.39c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.2.85.33 1.14.43.48.15.92.13 1.26.08.39-.06 1.18-.48 1.35-.95.17-.46.17-.86.12-.95-.05-.08-.19-.13-.39-.23Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path
        d="M8.25 11.75 11.75 8.25M6.4 14.1l-1.1 1.1a3.18 3.18 0 1 1-4.5-4.5l3.2-3.2a3.18 3.18 0 0 1 4.5 0M13.6 5.9l1.1-1.1a3.18 3.18 0 1 1 4.5 4.5L16 12.5a3.18 3.18 0 0 1-4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PostShare({ title, url, className }: PostShareProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  const iconButton =
    'flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white';

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label="Share this post"
    >
      <span className="mr-1 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
        Share:
      </span>
      <a
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="Share on X"
        className={iconButton}
      >
        <ShareIcon name="x" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className={iconButton}
      >
        <ShareIcon name="linkedin" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className={iconButton}
      >
        <ShareIcon name="facebook" />
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className={iconButton}
      >
        <ShareIcon name="whatsapp" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        title={copied ? 'Link copied' : 'Copy link'}
        className={cn(iconButton, copied && 'text-primary border-primary/50')}
      >
        <ShareIcon name="link" />
      </button>
    </div>
  );
}
