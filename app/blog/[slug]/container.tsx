import Image from 'next/image';

import DOMPurify from 'isomorphic-dompurify';

import { SeriesPills } from '@/components/blog';
import { Footer, Navbar } from '@/components/layouts';
import { GlowOrb, Section, SectionInner } from '@/components/ui';
import { BLUR_DATA_URL } from '@/lib/image';
import type { PostDetail } from '@/types/content';

/**
 * Ghost HTML is third-party content, so it is sanitized before it ever
 * reaches `dangerouslySetInnerHTML`.
 *
 * `lib/sanitize.ts` is DOMParser-based and returns `''` on the server, which
 * makes it unusable here - this is a server component and the article must be
 * in the static HTML for SEO. `isomorphic-dompurify` runs in both environments.
 */
function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel', 'loading'],
    FORBID_TAGS: ['style', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'srcset'],
  });
}

/**
 * Wide tables must scroll rather than blow out the reading measure. Ghost
 * emits bare `<table>`, so each one is wrapped after sanitizing - doing it on
 * the clean HTML means the markup we inject here is our own.
 */
function wrapTables(html: string) {
  return html
    .replace(/<table/g, '<div class="my-8 overflow-x-auto"><table')
    .replace(/<\/table>/g, '</table></div>');
}

function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Article body styling. This is the one place PT Serif appears - 20px body copy
 * with generous leading - while headings snap back to Gilroy.
 */
const proseClasses = [
  'font-serif text-[20px] leading-[34px] text-dark',
  // Headings return to the brand face.
  '[&_h1]:font-sans [&_h1]:text-[34px] [&_h1]:leading-[40px] [&_h1]:font-semibold [&_h1]:mt-12 [&_h1]:mb-4',
  '[&_h2]:font-sans [&_h2]:text-[30px] [&_h2]:leading-[36px] [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-4',
  '[&_h3]:font-sans [&_h3]:text-[24px] [&_h3]:leading-[30px] [&_h3]:font-semibold [&_h3]:mt-10 [&_h3]:mb-3',
  '[&_h4]:font-sans [&_h4]:text-[20px] [&_h4]:font-semibold [&_h4]:mt-8 [&_h4]:mb-2',
  '[&_p]:my-6',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:opacity-70',
  '[&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-7 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-7 [&_li]:my-2',
  '[&_strong]:font-bold',
  '[&_img]:my-8 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg',
  '[&_figure]:my-8 [&_figcaption]:font-sans [&_figcaption]:text-muted-light [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm',
  '[&_hr]:my-12 [&_hr]:border-black/10',
  // Blockquote: an orange rule, echoing the eyebrow hairline.
  '[&_blockquote]:border-primary [&_blockquote]:text-muted-light [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:pl-6 [&_blockquote]:italic',
  // Code returns to a monospace stack; `pre` is a dark inset slab.
  '[&_code]:bg-dark/5 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[16px]',
  '[&_pre]:bg-dark [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-6 [&_pre]:text-[15px] [&_pre]:leading-[24px] [&_pre]:text-white',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',
  '[&_table]:font-sans [&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:text-base',
  '[&_th]:border [&_th]:border-black/10 [&_th]:bg-black/[0.03] [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
  '[&_td]:border [&_td]:border-black/10 [&_td]:px-4 [&_td]:py-2',
].join(' ');

type PostContainerProps = {
  post: PostDetail;
};

export default function PostContainer({ post }: PostContainerProps) {
  const publishedAt = formatDate(post.publishedAt);
  const cleanHtml = wrapTables(sanitize(post.contentHtml));

  return (
    <>
      <Section tone="dark">
        <Navbar />

        <GlowOrb className="top-[25%] right-[15%]" />

        <SectionInner className="flex flex-col items-center pb-10 text-center md:pb-16">
          {post.series && (
            <SeriesPills series={[post.series]} activeSlug={post.series.slug} />
          )}

          <h1 className="mt-6 max-w-4xl text-[34px] leading-[40px] font-semibold text-white md:text-[54px] md:leading-[59px]">
            {post.title}
          </h1>

          <p className="text-muted-dark mt-5 text-[14px] font-semibold">
            {publishedAt}
            {post.readTimeMinutes !== null && (
              <> · {post.readTimeMinutes} min read</>
            )}
          </p>

          <Image
            src={post.coverUrl ?? '/placeholder.jpg'}
            alt={`Cover image for ${post.title}`}
            width={1000}
            height={563}
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="mt-10 h-auto w-full max-w-4xl rounded-lg object-cover"
          />
        </SectionInner>
      </Section>

      <Section tone="light">
        <SectionInner>
          <article className={`mx-auto max-w-3xl ${proseClasses}`}>
            {/* Sanitized above with isomorphic-dompurify - never render raw CMS HTML. */}
            <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
          </article>
        </SectionInner>
      </Section>

      <Footer />
    </>
  );
}
