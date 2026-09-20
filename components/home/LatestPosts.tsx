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
 *
 * The band renders even with no posts. Returning null instead would drop the
 * closing light band entirely and leave the page ending on three stacked dark
 * sections, so a CMS outage would silently break the page rhythm.
 */
export function LatestPosts({ posts }: LatestPostsProps) {
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

            {posts.length > 0 ? (
              <div className="flex w-full flex-col items-center">
                {posts.map((post, index) => (
                  <motion.div key={post.slug} variants={fadeUp}>
                    <PostCard post={post} priority={index === 0} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p
                variants={fadeUp}
                className="text-muted-light mb-[64px] max-w-[41rem] text-center text-[18px] leading-[26px]"
              >
                Nothing published yet. Writing is in progress.
              </motion.p>
            )}

            <motion.div variants={fadeUp}>
              <ButtonLink href="/blog">Show More</ButtonLink>
            </motion.div>
          </motion.div>
        </SectionInner>
      </Section>
    </ParallaxSection>
  );
}
