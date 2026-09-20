import Image from 'next/image';
import Link from 'next/link';

import { RichText } from '@graphcms/rich-text-react-renderer';
import type { RichTextContent } from '@graphcms/rich-text-types';

import { Footer, Navbar } from '@/components/layouts';
import { ProjectGallery } from '@/components/portfolio';
import { ButtonLink, GlowOrb, Section, SectionInner } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ProjectDetail, ProjectStatus } from '@/types/content';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  SHIPPED: 'Shipped',
  IN_PROGRESS: 'In Progress',
  RESEARCH: 'Research',
  ARCHIVED: 'Archived',
  CONCEPT: 'Concept',
};

const STATUS_DOT: Record<ProjectStatus, string> = {
  SHIPPED: 'bg-emerald-400',
  IN_PROGRESS: 'bg-primary',
  RESEARCH: 'bg-sky-400',
  ARCHIVED: 'bg-white/30',
  CONCEPT: 'bg-white/30',
};

/**
 * Render the project period. An absent end date means the work is ongoing.
 *
 * @example
 * formatPeriod({ year: 2024, endDate: null })          // '2024 - Present'
 * formatPeriod({ year: 2023, endDate: '2024-05-11' })  // '2023 - 2024'
 */
function formatPeriod(project: Pick<ProjectDetail, 'year' | 'endDate'>) {
  if (!project.year) return '';

  if (!project.endDate) return `${project.year} - Present`;

  const endYear = new Date(project.endDate).getFullYear();

  return endYear === project.year
    ? String(project.year)
    : `${project.year} - ${endYear}`;
}

type ProjectContainerProps = {
  project: ProjectDetail;
};

/**
 * Deliberately a server component: the only interactive part of this page is
 * the gallery lightbox, and `ProjectGallery` carries its own `'use client'`.
 * Keeping the boundary there means the rich-text renderer and the whole article
 * body stay out of the client bundle.
 */

/**
 * Article body renderers.
 *
 * Body copy is the one place a second family appears: PT Serif at 20px. Headings
 * snap back to Gilroy (`font-sans`) so the hierarchy still reads as the brand.
 *
 * Tables are wrapped in an overflow container here, in the renderer, rather than
 * by the DOM-mutating `public/table.js` the 2022 site shipped.
 */
/**
 * Rich-text renderers. Block-level styling lives in the `.prose-content` class
 * in globals.css so project details and blog posts share one reading surface;
 * these renderers only handle what the AST needs that CSS cannot express.
 */
const renderers = {
  a: ({
    children,
    href,
    openInNewTab,
  }: {
    children: React.ReactNode;
    href?: string;
    openInNewTab?: boolean;
  }) => (
    <a
      href={href}
      {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  ),
  code_block: ({ children }: { children: React.ReactNode }) => (
    <pre>
      <code>{children}</code>
    </pre>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-lg border border-black/8">
      <table>{children}</table>
    </div>
  ),
  img: ({
    src,
    altText,
    width,
    height,
  }: {
    src?: string;
    altText?: string;
    width?: number;
    height?: number;
  }) => (
    <Image
      src={src ?? ''}
      alt={altText ?? ''}
      width={width ?? 1200}
      height={height ?? 675}
      className="h-auto w-full rounded-lg"
    />
  ),
};

export default function ProjectContainer({ project }: ProjectContainerProps) {
  const gallery =
    project.images.length > 0
      ? project.images
      : [{ fileName: project.title, url: project.coverUrl }];

  return (
    <>
      <Section>
        <GlowOrb className="top-[20%] left-[10%]" />

        <Navbar />

        <SectionInner className="pt-8 md:pt-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <div className="mb-8 flex w-full justify-start">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 13L5 8l5-5"
                  />
                </svg>
                Back to Projects
              </Link>
            </div>

            {project.category.length > 0 && (
              <p className="text-muted-dark mb-4 text-lg uppercase">
                {project.category.join(' / ')}
              </p>
            )}

            <h1 className="mb-6 text-center text-[44px] leading-[55px] font-semibold text-white">
              {project.title}
            </h1>

            {project.description && (
              <p className="text-muted-dark mb-8 max-w-[640px] text-center text-[18px] leading-[28px]">
                {project.description}
              </p>
            )}

            <dl className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
              {project.status && (
                <div>
                  <dt className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                    Status
                  </dt>
                  <dd className="mt-1 flex items-center justify-center gap-1.5 text-[15px] font-medium text-white">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        STATUS_DOT[project.status]
                      )}
                    />
                    {STATUS_LABEL[project.status]}
                  </dd>
                </div>
              )}

              {project.year && (
                <div>
                  <dt className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                    Year
                  </dt>
                  <dd className="mt-1 text-[15px] font-medium text-white tabular-nums">
                    {formatPeriod(project)}
                  </dd>
                </div>
              )}

              {project.role && (
                <div>
                  <dt className="text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                    Role
                  </dt>
                  <dd className="mt-1 text-[15px] font-medium text-white">
                    {project.role}
                  </dd>
                </div>
              )}
            </dl>

            {project.techStack.length > 0 && (
              <ul className="mb-10 flex flex-wrap items-center justify-center gap-2">
                {project.techStack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/70"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            )}

            <ProjectGallery images={gallery} title={project.title} />

            {(project.projectUri || project.repoUrl) && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                {project.projectUri && (
                  <ButtonLink href={project.projectUri}>
                    <Image
                      src="/icons/link.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden="true"
                    />
                    Visit project
                  </ButtonLink>
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[15px] font-semibold text-white transition hover:border-white/35 hover:bg-white/5"
                  >
                    View source
                  </a>
                )}
              </div>
            )}
          </div>
        </SectionInner>
      </Section>

      {(project.highlights.length > 0 || project.details) && (
        <Section tone="paper">
          <SectionInner className="md:py-24">
            <div className="mx-auto w-full max-w-[720px]">
              {project.highlights.length > 0 && (
                <ul className="border-primary mb-14 grid gap-3 border-l-2 pl-6">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="text-dark font-sans text-[17px] leading-[26px] font-medium"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}

              {project.details && (
                <article className="prose-content">
                  <RichText
                    content={project.details.raw as RichTextContent}
                    renderers={renderers}
                  />
                </article>
              )}
            </div>
          </SectionInner>
        </Section>
      )}

      <Footer />
    </>
  );
}
