'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { PostCard, SeriesPills } from '@/components/blog';
import { Footer, Navbar } from '@/components/layouts';
import {
  Button,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import type { PostSeries, PostSummary } from '@/types/content';

type BlogContainerProps = {
  posts: PostSummary[];
  series: PostSeries[];
  query: string;
  activeSeriesSlug?: string;
};

/**
 * `/blog` is a two-band page: a dark hero holding the search and series filters,
 * then a light reading band for the post list.
 *
 * The 2022 site shipped a separate `/blog/search` route. Search now lives on
 * `/blog` as a `?q=` param instead, so every result set is server-rendered,
 * shareable and indexable.
 */
export default function BlogContainer({
  posts,
  series,
  query,
  activeSeriesSlug,
}: BlogContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  // Keep the input honest when the URL changes from under us (back/forward).
  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const next = draftQuery.trim();

    if (next) {
      params.set('q', next);
    } else {
      params.delete('q');
    }

    const search = params.toString();
    router.push(search ? `/blog?${search}` : '/blog');
  }

  return (
    <>
      <Section tone="dark">
        <Navbar />

        <GlowOrb className="top-[20%] left-[10%]" />

        <SectionInner className="flex flex-col items-center pt-8 text-center md:pt-12">
          <SectionTitle className="text-[54px] leading-[59px] text-white md:text-[74px]">
            Yuke&apos;s Personal Blog.
          </SectionTitle>

          <p className="text-muted-dark mt-6 max-w-[41rem] text-[18px] leading-[24px]">
            Notes from the things I actually build — autonomous robots,
            real-time communication, networking and the web stack around them.
            Mostly what broke, and what I changed because of it.
          </p>

          <form
            onSubmit={handleSubmit}
            role="search"
            className="mt-10 flex w-full flex-col gap-4 md:flex-row lg:max-w-xl"
          >
            <label htmlFor="blog-search" className="sr-only">
              Search posts
            </label>
            <input
              id="blog-search"
              type="search"
              name="q"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Search posts…"
              className="focus-visible:ring-primary w-full rounded-full bg-white px-[26px] py-3.5 text-base font-semibold text-gray-900 focus-visible:ring-2 focus-visible:outline-none"
            />
            <Button type="submit" className="shrink-0">
              Search
            </Button>
          </form>

          <SeriesPills
            series={series}
            activeSlug={activeSeriesSlug}
            query={query}
            className="mt-8"
          />
        </SectionInner>
      </Section>

      <Section tone="light">
        <SectionInner>
          {posts.length > 0 ? (
            <ul className="flex flex-col items-center lg:items-start">
              {posts.map((post, index) => (
                <li key={post.slug} className="w-full">
                  <PostCard post={post} priority={index === 0} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-2xl font-semibold">No posts found.</p>
              <p className="text-muted-light mt-2 text-base font-medium">
                Try a different search term, or browse every post.
              </p>
            </div>
          )}
        </SectionInner>
      </Section>

      <Footer />
    </>
  );
}
