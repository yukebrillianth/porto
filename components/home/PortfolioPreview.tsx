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

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  if (projects.length === 0) return null;

  return (
    <Section id="projects" tone="none">
      <SectionInner className="px-7 py-16 md:px-7 md:py-24">
        <motion.div
          className="flex w-full flex-col items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
        >
          <motion.div variants={fadeUp}>
            <SectionTitle className="mb-[40px]">Projects.</SectionTitle>
          </motion.div>

          <div className="mb-[40px] grid w-full max-w-[1140px] grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {projects.map((project) => (
              <motion.div
                key={project.slug}
                variants={fadeUp}
                className="flex w-full justify-center"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp}>
            <ButtonLink href="/projects">Show More</ButtonLink>
          </motion.div>
        </motion.div>
      </SectionInner>
    </Section>
  );
}
