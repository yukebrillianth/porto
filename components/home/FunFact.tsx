'use client';

import Image from 'next/image';

import { motion } from 'motion/react';

import {
  ContentBlock,
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import {
  fadeUp,
  scaleIn,
  staggerContainer,
  VIEWPORT,
} from '@/components/ui/motion';
import { ParallaxSection } from '@/components/ui/ParallaxSection';
import { coreStack } from '@/constants';

/**
 * How the eight core-stack logos are grouped, top row first.
 *
 * The row sizes taper downward (4 / 3 / 1) so the block reads as a pyramid
 * settling to a point rather than the ragged wrap the old `space-x-*` list
 * produced. Each row is its own centred flex container, so a narrow screen
 * wraps a row onto itself and stays centred instead of shifting the whole
 * arrangement off balance.
 */
const LOGO_ROWS = [5, 3] as const;

type StackItem = (typeof coreStack)[number];

/** Slice `coreStack` into the tapered rows described by LOGO_ROWS. */
function buildLogoRows(): StackItem[][] {
  const rows: StackItem[][] = [];
  let cursor = 0;

  for (const size of LOGO_ROWS) {
    rows.push(coreStack.slice(cursor, cursor + size));
    cursor += size;
  }

  // Anything beyond the declared rows joins the last one rather than vanishing.
  if (cursor < coreStack.length) {
    rows[rows.length - 1].push(...coreStack.slice(cursor));
  }

  return rows.filter((row) => row.length > 0);
}

const logoRows = buildLogoRows();

/**
 * The light reading band.
 *
 * Centred column, per section 5.0 of the design brief: the title and the
 * content block are centred in the viewport, and the eyebrow hangs at the
 * block's left edge while the heading and paragraph sit 80px to its right.
 *
 * The whole band is wrapped in ParallaxSection so it slides up over the dark
 * hero as you scroll, with a rounded top lip.
 */
export function FunFact() {
  return (
    <ParallaxSection offset={-40} sheet="light">
      <Section id="about" tone="light">
        <GlowOrb
          className="top-[25%] right-0 md:right-[20%]"
          intensity="bright"
          size="lg"
        />

        <SectionInner>
          <motion.div
            className="flex w-full flex-col items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            <motion.div variants={fadeUp}>
              <SectionTitle className="mb-[92px]">About Me.</SectionTitle>
            </motion.div>

            <ContentBlock className="mb-[100px]">
              <motion.div variants={fadeUp}>
                <Eyebrow>FUN FACT</Eyebrow>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="mt-[32px] text-[34px] leading-[34px] font-semibold md:mt-[32px] md:ml-[80px] md:text-[64px] md:leading-[64px]"
              >
                I build across the
                <br />
                whole stack, from
                <br />
                interfaces &amp; APIs
                <br />
                to robots.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-muted-light mt-[40px] max-w-[720px] text-[18px] leading-[26px] font-normal md:mt-[40px] md:ml-[80px]"
              >
                I started in full-stack web development, building interfaces,
                APIs and the databases underneath them. Curiosity about robotics
                took me to IRIS ITS, and that turned into ROS, C++, computer
                vision and real-time multi-robot communication under conditions
                where the network is never as good as the demo. I still ship
                production web software alongside all of it, and each side keeps
                sharpening the other.
              </motion.p>
            </ContentBlock>
          </motion.div>

          <motion.ul
            className="flex w-full flex-col items-center gap-8 md:gap-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {logoRows.map((row, rowIndex) => (
              <li key={LOGO_ROWS[rowIndex] ?? rowIndex}>
                <ul className="flex flex-wrap items-center justify-center gap-5 md:gap-12 lg:gap-20 xl:gap-36">
                  {row.map((tech) => (
                    <motion.li key={tech.name} variants={scaleIn}>
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={100}
                        height={100}
                        className="h-[64px] w-auto object-contain grayscale transition duration-300 ease-out hover:scale-110 hover:grayscale-0 md:h-[100px]"
                      />
                    </motion.li>
                  ))}
                </ul>
              </li>
            ))}
          </motion.ul>
        </SectionInner>
      </Section>
    </ParallaxSection>
  );
}
