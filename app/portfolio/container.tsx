'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Footer, Navbar } from '@/components/layouts';
import { CategoryFilter, ProjectCard } from '@/components/portfolio';
import { Button, GlowOrb, Section, SectionInner } from '@/components/ui';
import type { ProjectSummary } from '@/types/content';

type PortfolioContainerProps = {
  projects: ProjectSummary[];
  category: string;
  query: string;
};

/**
 * `/portfolio` is dark end to end - no light band - so the navbar sits inside
 * the section and the footer takes the `light` prop to drop its own background.
 *
 * Search and category both write to the URL (`?q=`, `?category=`) rather than to
 * local state, which keeps every filtered view linkable and server-rendered.
 *
 * Layout notes, from the 2022 original:
 * - The gutter stays at 28px all the way up and only opens to 170px at `2xl`.
 *   `SectionInner` defaults to the 170px measure from `md`, which on this page
 *   starved the grid of width, so the padding is overridden here.
 * - The grid columns are capped at the card's own 315px rather than stretching
 *   to `1fr`, and the whole block is centred - see design-brief Sec. 5.0.
 */
export default function PortfolioContainer({
  projects,
  category,
  query,
}: PortfolioContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  // Keep the input honest when the URL changes from under us (back/forward).
  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  function buildHref(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    const search = params.toString();
    return search ? `/portfolio?${search}` : '/portfolio';
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildHref({ q: draftQuery.trim() }));
  };

  const handleCategorySelect = (value: string) => {
    router.push(buildHref({ category: value }));
  };

  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[18%] right-[8%]" />

      <Navbar />

      <SectionInner className="pt-8 md:px-7 md:py-16 md:pt-12 2xl:px-[170px] 2xl:py-32">
        <h1 className="mt-0 mb-[40px] text-[3.375rem] leading-[3.687rem] font-semibold">
          Portfolio.
        </h1>

        <div className="mb-[100px] flex w-full flex-col items-center gap-[25px]">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-[560px] flex-col gap-4 sm:flex-row sm:items-stretch"
          >
            <label htmlFor="portfolio-search" className="sr-only">
              Search projects
            </label>
            {/*
              The input and the Search pill must be the same height. Their
              paddings and font sizes differ (and the pill's change at `md`),
              so matching them by eye breaks at some breakpoint. `items-stretch`
              plus a shared `h-12` pins both to one height at every width
              instead - the pill's own vertical padding just stops deciding it.
            */}
            <input
              id="portfolio-search"
              type="search"
              name="q"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Search a project..."
              className="focus-visible:ring-primary focus-visible:ring-offset-dark h-12 w-full min-w-0 rounded-full bg-white px-[26px] text-base font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <Button type="submit" className="h-12 shrink-0 py-0 md:py-0">
              Search
            </Button>
          </form>

          <CategoryFilter active={category} onSelect={handleCategorySelect} />
        </div>

        {projects.length === 0 ? (
          <p className="text-muted-dark text-center text-[18px] leading-[24px]">
            No projects match that search yet. Try another keyword or category.
          </p>
        ) : (
          <div className="mb-[40px] grid w-full grid-cols-[minmax(0,315px)] justify-center gap-5 lg:grid-cols-[repeat(2,minmax(0,315px))] xl:grid-cols-[repeat(3,minmax(0,315px))] 2xl:grid-cols-[repeat(4,minmax(0,315px))]">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </SectionInner>

      <Footer light />
    </Section>
  );
}
