import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { BLUR_DATA_URL } from '@/lib/image';
import type { ProjectStatus, ProjectSummary } from '@/types/content';

type ProjectCardProps = {
  project: ProjectSummary;
  priority?: boolean;
  className?: string;
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  SHIPPED: 'Shipped',
  IN_PROGRESS: 'In Progress',
  RESEARCH: 'Research',
  ARCHIVED: 'Archived',
  CONCEPT: 'Concept',
};

/** Only a live project earns colour; the rest stay quiet. */
const STATUS_DOT: Record<ProjectStatus, string> = {
  SHIPPED: 'bg-emerald-400',
  IN_PROGRESS: 'bg-primary',
  RESEARCH: 'bg-sky-400',
  ARCHIVED: 'bg-white/30',
  CONCEPT: 'bg-white/30',
};

/** Chips are capped so a long stack cannot push the card out of alignment. */
const MAX_VISIBLE_TECH = 3;

export function ProjectCard({
  project,
  priority = false,
  className,
}: ProjectCardProps) {
  const visibleTech = project.techStack.slice(0, MAX_VISIBLE_TECH);
  const hiddenTechCount = project.techStack.length - visibleTech.length;

  return (
    <article
      className={cn(
        'group bg-surface relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10',
        'transition duration-300 hover:-translate-y-1',
        'focus-within:ring-primary focus-within:ring-offset-dark focus-within:ring-2 focus-within:ring-offset-2',
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/20">
            No Preview
          </div>
        )}

        <div
          aria-hidden="true"
          className="from-surface via-surface/20 absolute inset-0 bg-linear-to-t to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2.5 text-[12px] font-medium text-white/45">
          {project.year && <span className="tabular-nums">{project.year}</span>}

          {project.year && project.role && (
            <span aria-hidden="true" className="h-3 w-px bg-white/15" />
          )}

          {project.role && <span className="truncate">{project.role}</span>}

          {project.status && (
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  STATUS_DOT[project.status]
                )}
              />
              {STATUS_LABEL[project.status]}
            </span>
          )}
        </div>

        <h3 className="group-hover:text-primary text-[20px] leading-[26px] font-semibold text-white transition-colors duration-200">
          {project.title}
        </h3>

        {project.description && (
          <p className="text-muted-dark mt-2 line-clamp-2 text-[14px] leading-[22px] font-normal">
            {project.description}
          </p>
        )}

        <div className="mt-auto pt-5">
          {visibleTech.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              {visibleTech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/60"
                >
                  {tech}
                </span>
              ))}

              {hiddenTechCount > 0 && (
                <span className="text-[11px] font-medium text-white/35">
                  +{hiddenTechCount}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-4">
            <span className="truncate text-[12px] font-medium text-white/40">
              {project.category.join(' / ')}
            </span>

            <span className="text-primary/80 group-hover:text-primary flex shrink-0 items-center gap-1 text-[13px] font-medium transition-colors">
              View Details
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-20 outline-none"
      >
        <span className="sr-only">View {project.title}</span>
      </Link>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-surface relative flex w-full animate-pulse flex-col overflow-hidden rounded-2xl border border-white/5">
      <div className="aspect-[16/10] w-full bg-white/5" />
      <div className="flex flex-col gap-3 p-5 md:p-6">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="h-6 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-2/3 rounded bg-white/5" />
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-4 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
