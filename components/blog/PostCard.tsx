import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { BLUR_DATA_URL } from '@/lib/image';
import type { PostSummary } from '@/types/content';

/** Ghost dates are ISO strings; render them in the site's en-US locale. */
function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type PostCardProps = {
  post: PostSummary;
  /** The first card in the list gets a priority cover fetch. */
  priority?: boolean;
  className?: string;
};

/**
 * The 2022 horizontal blog card: cover left, text right, and the signature
 * orange corner flag tucked into the cover's top-right with only the top-right
 * corner rounded.
 */
export function PostCard({ post, priority = false, className }: PostCardProps) {
  const publishedAt = formatDate(post.publishedAt);

  return (
    <article
      className={cn(
        'relative mb-12 flex max-w-sm flex-col md:max-w-4xl lg:flex-row',
        className
      )}
    >
      <div className="relative shrink-0 overflow-hidden rounded-lg">
        <Image
          src={post.coverUrl ?? '/placeholder.jpg'}
          alt={`Cover image for ${post.title}`}
          width={360}
          height={203}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
          className="h-[203px] w-full rounded-lg object-cover lg:w-[360px]"
        />

        {post.series && (
          <span className="bg-primary absolute top-0 right-0 rounded-tr-lg px-[20px] py-[2px] text-xs font-bold text-white">
            {post.series.name}
          </span>
        )}
      </div>

      <div className="mt-5 lg:mt-0 lg:ml-[40px]">
        <h3 className="text-2xl font-semibold">
          <Link
            href={`/blog/${post.slug}`}
            className="focus-visible:ring-primary rounded transition after:absolute after:inset-0 hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-2 text-[14px]">
          {publishedAt && (
            <time
              dateTime={post.publishedAt}
              className="text-muted-light block font-semibold"
            >
              {publishedAt}
            </time>
          )}

          {post.languages && post.languages.length > 1 && (
            <>
              <span aria-hidden="true" className="text-black/20">
                ·
              </span>
              <span className="rounded-md bg-black/5 px-2 py-0.5 text-[11px] font-bold tracking-wider text-black/60 uppercase">
                {post.languages.join(' · ')}
              </span>
            </>
          )}
        </div>

        <p className="text-muted-light mt-2 text-base leading-[24px] font-medium">
          {post.brief}
        </p>

        <span
          aria-hidden="true"
          className="text-primary mt-2.5 block text-sm font-semibold"
        >
          READ MORE
        </span>
      </div>
    </article>
  );
}
