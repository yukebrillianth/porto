import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

import {
  ArticleBody,
  CommentSection,
  LanguageToggle,
  PostShare,
  TableOfContents,
} from '@/components/blog';
import { Footer, Navbar } from '@/components/layouts';
import { GlowOrb, Section, SectionInner } from '@/components/ui';
import { BLUR_DATA_URL } from '@/lib/image';
import { sanitizeGhostHtml } from '@/lib/sanitize-ghost';
import type { PostDetail } from '@/types/content';

/**
 * Ghost HTML is sanitized on the server before it reaches the article markup.
 * The sanitizer lives in a server-only module because the content is already
 * clean before the client component handles copy buttons and toggles.
 */
/** Ghost emits bare tables; wrap them so a wide table scrolls instead of overflowing. */
function wrapTables(html: string) {
  return html
    .replace(
      /<table/g,
      '<div class="overflow-x-auto rounded-lg border border-black/8 my-8 shadow-xs"><table'
    )
    .replace(/<\/table>/g, '</table></div>');
}

/**
 * Enhance codeblocks into polished macOS style terminal windows with
 * language pills and one-click copy.
 */
function wrapCodeBlocks(html: string) {
  return html.replace(
    /<pre[^>]*><code(?:\s+class="[^"]*language-([^"\s]+)[^"]*")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_match, lang, code) => {
      const language = (lang || 'code').toLowerCase();
      const displayLang = language.toUpperCase();

      return `<div class="code-block my-8 overflow-hidden rounded-xl border border-white/10 bg-[#12141a] text-[#f1f5f9] shadow-xl">
  <div class="code-block-header flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
    <div class="flex items-center gap-2">
      <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" aria-hidden="true"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden="true"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]" aria-hidden="true"></span>
    </div>
    <div class="flex items-center gap-3">
      <span class="font-mono text-[11px] font-bold tracking-wider text-white/50 uppercase">${displayLang}</span>
      <button type="button" class="copy-code-btn flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white" data-copy-btn aria-label="Copy code">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span class="copy-label">Copy</span>
      </button>
    </div>
  </div>
  <pre class="overflow-x-auto p-4 md:p-5 font-mono text-[13px] md:text-[14px] leading-[1.65]"><code class="language-${language}">${code}</code></pre>
</div>`;
    }
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function authorLabel(post: PostDetail) {
  return post.authors.length > 0
    ? post.authors.map((author) => author.name).join(', ')
    : 'Yuke Brilliant Hestiavin';
}

type PostContainerProps = {
  post: PostDetail;
  cardsCss?: string | null;
  cardsJs?: string | null;
};

export default function PostContainer({
  post,
  cardsCss,
  cardsJs,
}: PostContainerProps) {
  const publishedAt = formatDate(post.publishedAt);
  const cleanHtml = wrapCodeBlocks(
    wrapTables(sanitizeGhostHtml(post.contentHtml))
  );
  const author = authorLabel(post);
  const publicUrl = post.canonicalUrl;

  return (
    <>
      {cardsCss && <link rel="stylesheet" href={cardsCss} />}
      {cardsJs && <Script src={cardsJs} strategy="afterInteractive" />}

      <Section tone="dark">
        <Navbar />

        <GlowOrb className="top-[25%] right-[15%]" />

        <SectionInner className="flex flex-col items-center pb-10 md:pb-16">
          <div className="w-full max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-left">
              <ol className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-white/50">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/20">
                  /
                </li>
                <li>
                  <Link href="/blog" className="transition hover:text-white">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/20">
                  /
                </li>
                <li
                  className="max-w-[16rem] truncate text-white/80 sm:max-w-md"
                  aria-current="page"
                >
                  {post.title}
                </li>
              </ol>
            </nav>

            <div className="mb-4 flex items-center justify-between gap-3">
              {post.series ? (
                <Link
                  href={`/blog?series=${post.series.slug}`}
                  className="text-primary rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[12px] font-semibold transition hover:border-white/25 hover:bg-white/10"
                >
                  {post.series.name}
                </Link>
              ) : (
                <span />
              )}
              <LanguageToggle
                active={post.language}
                translations={post.translations}
              />
            </div>

            <h1 className="text-left text-[34px] leading-[40px] font-semibold text-white md:text-[48px] md:leading-[54px] lg:text-[54px] lg:leading-[60px]">
              {post.title}
            </h1>

            {post.brief && (
              <p className="text-muted-dark mt-4 text-left text-[17px] leading-[26px] md:text-[19px] md:leading-[28px]">
                {post.brief}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-[13px] md:text-[14px]">
              <div className="text-muted-dark flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium">
                <span className="font-semibold text-white">{author}</span>
                <span aria-hidden="true" className="text-white/20">
                  ·
                </span>
                <time dateTime={post.publishedAt}>{publishedAt}</time>
                {post.readTimeMinutes !== null && (
                  <>
                    <span aria-hidden="true" className="text-white/20">
                      ·
                    </span>
                    <span>{post.readTimeMinutes} min read</span>
                  </>
                )}
              </div>

              <PostShare title={post.title} url={publicUrl} />
            </div>

            {post.coverUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={post.coverUrl}
                  alt={post.coverAlt ?? `Cover image for ${post.title}`}
                  width={1200}
                  height={675}
                  priority
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>
        </SectionInner>
      </Section>

      <Section tone="paper">
        <SectionInner className="md:py-24">
          <div className="w-full max-w-3xl">
            <TableOfContents html={cleanHtml} />
            <ArticleBody html={cleanHtml} />

            <div className="mx-auto mt-20 w-full max-w-3xl border-t border-black/10 pt-12">
              <CommentSection slug={post.slug} language={post.language} />
            </div>
          </div>
        </SectionInner>
      </Section>

      <Footer />
    </>
  );
}
