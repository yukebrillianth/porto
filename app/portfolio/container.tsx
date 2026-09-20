'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Footer, Navbar } from '@/components/layouts';
import { CategoryFilter, ProjectCard } from '@/components/portfolio';
import {
  Button,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
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

      <SectionInner className="pt-8 md:pt-12">
        <SectionTitle className="mb-[70px]">Portfolio.</SectionTitle>

        <div className="mb-[126px] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full flex-col gap-4 md:flex-row md:items-center lg:max-w-xl"
          >
            <label htmlFor="portfolio-search" className="sr-only">
              Search projects
            </label>
            <input
              id="portfolio-search"
              type="search"
              name="q"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Search a project..."
              className="focus-visible:ring-primary focus-visible:ring-offset-dark w-full rounded-full bg-white px-[26px] py-3.5 text-base font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <Button type="submit" className="shrink-0">
              Search
            </Button>
          </form>

          <CategoryFilter
            active={category}
            onSelect={handleCategorySelect}
            className="shrink-0"
          />
        </div>

        {projects.length === 0 ? (
          <p className="text-muted-dark text-[18px] leading-[24px]">
            No projects match that search yet. Try another keyword or category.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
