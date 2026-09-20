'use client';

import Image from 'next/image';

import { motion, useReducedMotion } from 'motion/react';

import {
  ContentBlock,
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
} from '@/components/ui';
import {
  fadeIn,
  fadeUp,
  staggerContainer,
  VIEWPORT,
} from '@/components/ui/motion';
import { socials } from '@/constants';

/**
 * The social band.
 *
 * The 2022 layout stood a rigid two-up grid of 80px slabs next to the text,
 * which left the cards cramped and the row lopsided. This stacks instead: the
 * text block first at the section's measure, then the six accounts as a full
 * 1 / 2 / 3 grid beneath it, matching the column Education uses so the two
 * dark bands share one spine.
 *
 * Each card is a row - icon tile, then platform over username - with the whole
 * surface clickable through a stretched link. Hover lifts the card and lights
 * the icon tile; the arrow slides out on the same cue.
 */
export function Social() {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = shouldReduceMotion ? fadeIn : fadeUp;

  return (
    <Section id="social" tone="none">
      <GlowOrb
        className="right-0 bottom-[15%] md:right-auto md:bottom-0 md:left-[15%]"
        size="lg"
      />

      <SectionInner className="pt-0 md:pt-0">
        <ContentBlock className="w-full max-w-[860px]">
          <Eyebrow>MY SOCMED</Eyebrow>

          <h2 className="mt-[32px] text-[34px] leading-[34px] font-semibold md:mt-[32px] md:ml-[80px] md:text-[64px] md:leading-[64px]">
            I have several social
            <br />
            media accounts.
          </h2>

          <p className="text-muted-dark mt-[40px] max-w-[635px] text-[18px] leading-[24px] font-normal md:mt-[40px] md:ml-[80px]">
            I have several social media accounts that you can follow. Usually, I
            share my experiences on these accounts, although some of them are
            rarely active.
          </p>
        </ContentBlock>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="z-10 mt-[64px] grid w-full max-w-[860px] grid-cols-1 gap-4 sm:grid-cols-2 md:mt-[88px] md:pl-[80px] lg:grid-cols-3"
        >
          {socials.map((social) => (
            <motion.li
              key={social.platform}
              variants={cardVariants}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-surface relative rounded-[12px] p-5 transition-colors duration-200 focus-within:ring-2 focus-within:ring-white/40 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06] opacity-70 transition duration-200 group-hover:bg-white/10 group-hover:opacity-100">
                  <Image
                    src={social.icon}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={21}
                    className="h-[21px] w-[20px] object-contain"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-[18px] leading-[22px] font-semibold after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {social.platform}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <span className="text-muted-dark mt-1 block truncate text-[12px] leading-[15px] font-medium">
                    {social.username}
                  </span>
                </span>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="h-4 w-4 shrink-0 text-white/30 transition duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:text-white"
                >
                  <path
                    d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </SectionInner>
    </Section>
  );
}
