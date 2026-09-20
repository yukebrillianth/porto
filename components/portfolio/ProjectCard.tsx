import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { BLUR_DATA_URL } from '@/lib/image';
import type { ProjectSummary } from '@/types/content';

type ProjectCardProps = {
  project: ProjectSummary;
  priority?: boolean;
};

/**
 * Cover tile for the portfolio grid. Hovering (or focusing) reveals a dark
 * scrim with the project title centred over the whole tile.
 *
 * The tile is a fixed 315x190 box, as in the 2022 original. It only shrinks
 * below 315px on narrow phones, which is what `max-w-full` covers - it never
 * stretches to fill its grid column, because a full-width tile at the desktop
 * measure reads as a huge sparse banner rather than a card.
 */
export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="group focus-within:ring-primary focus-within:ring-offset-dark relative h-[190px] w-[315px] max-w-full overflow-hidden rounded-lg focus-within:ring-2 focus-within:ring-offset-2">
      <Image
        src={project.coverUrl}
        alt={project.title}
        fill
        sizes="315px"
        className="object-cover"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        priority={priority}
      />

      <div
        className={cn(
          'bg-dark/70 absolute inset-0 flex items-center justify-center',
          'px-[50px] opacity-0 transition duration-300 ease-in-out',
          'group-focus-within:opacity-100 group-hover:opacity-100'
        )}
      >
        <h3 className="text-center text-[22px] font-semibold text-white">
          {project.title}
        </h3>
      </div>

      <Link
        href={`/portfolio/${project.slug}`}
        className="absolute inset-0 z-10 outline-none"
      >
        <span className="sr-only">View {project.title}</span>
      </Link>
    </article>
  );
}

/** Loading placeholder. The grid renders eight of these while fetching. */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-surface h-[190px] w-[315px] max-w-full animate-pulse rounded-lg" />
  );
}
