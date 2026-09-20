'use client';

import { motion } from 'motion/react';

import { ProjectCard } from '@/components/portfolio';
import {
  ButtonLink,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import { fadeUp, staggerContainer, VIEWPORT } from '@/components/ui/motion';
import type { ProjectSummary } from '@/types/content';

type PortfolioPreviewProps = {
  projects: ProjectSummary[];
};

/**
 * The portfolio band on the home page - the first eight projects, then a
 * "Show More" pill through to the full index.
 *
 * The title, the grid and the pill reveal as one staggered group on scroll,
 * and each card lifts slightly under the pointer. The card's own hover scrim
 * is untouched; the lift sits on a wrapper around it.
 */
export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  if (projects.length === 0) return null;

  return (
    <Section id="portfolio" tone="none">
      <SectionInner className="justify-between px-7 py-16 md:px-7 md:py-16 xl:justify-center 2xl:px-[170px] 2xl:py-32">
        <motion.div
          className="flex w-full flex-col items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.div variants={fadeUp}>
            <SectionTitle className="mb-[40px]">Portfolio.</SectionTitle>
          </motion.div>

          <div className="mb-[40px] grid w-full grid-cols-1 gap-[20px] lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project) => (
              <motion.div
                key={project.slug}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <ButtonLink href="/portfolio">Show More</ButtonLink>
          </motion.div>
        </motion.div>
      </SectionInner>
    </Section>
  );
}
