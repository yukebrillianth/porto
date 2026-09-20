'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Footer, Navbar } from '@/components/layouts';
import {
  CategoryFilter,
  Pagination,
  ProjectCard,
} from '@/components/portfolio';
import { Button, GlowOrb, Section, SectionInner } from '@/components/ui';
import type { ProjectSummary } from '@/types/content';

type ProjectsContainerProps = {
  projects: ProjectSummary[];
  category: string;
  query: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export default function ProjectsContainer({
  projects,
  category,
  query,
  currentPage,
  totalPages,
  totalCount,
}: ProjectsContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  /** Any filter change resets paging - page 4 of the old result set is meaningless. */
  function buildHref(next: { category?: string; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete('page');

    const search = params.toString();
    return search ? `/projects?${search}` : '/projects';
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildHref({ q: draftQuery.trim() }));
  };

  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[18%] right-[8%]" />

      <Navbar />

      <SectionInner className="pt-8 md:px-7 md:py-16 md:pt-12 2xl:px-[170px] 2xl:py-32">
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="mt-0 mb-3 text-[38px] leading-[44px] font-semibold text-white md:text-[54px] md:leading-[60px]">
            Projects.
          </h1>

          <p className="text-muted-dark mb-10 max-w-[600px] text-[16px] leading-[24px] md:text-[18px] md:leading-[26px]">
            Selected work across autonomous robotics, distributed systems, and
            production full-stack web applications.
          </p>
        </div>

        <div className="mb-14 flex w-full flex-col items-center gap-6">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex w-full max-w-[560px] flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>

            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <input
                id="project-search"
                type="search"
                name="q"
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="Search by name, description, or tech..."
                className="focus-visible:ring-primary focus-visible:ring-offset-dark h-12 w-full min-w-0 rounded-full bg-white pr-6 pl-12 text-base font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <Button type="submit" className="h-12 shrink-0 py-0 md:py-0">
              Search
            </Button>
          </form>

          <CategoryFilter active={category} query={query} />

          <p className="text-[13px] font-medium text-white/40">
            {totalCount === 0
              ? 'No projects'
              : `Showing ${projects.length} of ${totalCount} ${
                  totalCount === 1 ? 'project' : 'projects'
                }`}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-dark text-[18px] leading-[26px]">
              No projects match that search. Try another keyword or reset the
              category.
            </p>
            <div className="mt-6">
              <Button variant="ghost" onClick={() => router.push('/projects')}>
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-12 grid w-full max-w-[1140px] grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  priority={index < 3}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              params={{ category, q: query }}
              className="mb-12"
            />
          </>
        )}
      </SectionInner>

      <Footer light />
    </Section>
  );
}
