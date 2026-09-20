'use client';

import { motion } from 'motion/react';

import { PostCard } from '@/components/blog';
import {
  ButtonLink,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import { fadeUp, staggerContainer, VIEWPORT } from '@/components/ui/motion';
import { ParallaxSection } from '@/components/ui/ParallaxSection';
import type { PostSummary } from '@/types/content';

type LatestPostsProps = {
  posts: PostSummary[];
};

/**
 * The closing light band - the three most recent posts, then a "Show More"
 * pill through to the blog index.
 *
 * Wrapped in ParallaxSection so the band slides up over the dark portfolio
 * section, mirroring the lip at the top of the About band.
 */
export function LatestPosts({ posts }: LatestPostsProps) {
  if (posts.length === 0) return null;

  return (
    <ParallaxSection offset={-40} sheet="light">
      <Section id="posts" tone="light">
        <SectionInner>
          <motion.div
            className="flex w-full flex-col items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <motion.div variants={fadeUp}>
              <SectionTitle className="mb-[92px]">Latest Posts.</SectionTitle>
            </motion.div>

            <div className="flex w-full flex-col items-center">
              {posts.map((post, index) => (
                <motion.div key={post.slug} variants={fadeUp}>
                  <PostCard post={post} priority={index === 0} />
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp}>
              <ButtonLink href="/blog">Show More</ButtonLink>
            </motion.div>
          </motion.div>
        </SectionInner>
      </Section>
    </ParallaxSection>
  );
}
