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
import { cn } from '@/lib/cn';

export function FunFact() {
  return (
    <ParallaxSection sheet="light">
      <Section id="about" tone="light">
        <GlowOrb
          className="top-[20%] right-0 md:right-[20%]"
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
                className="mt-[32px] max-w-[540px] text-[34px] leading-[34px] font-semibold md:mt-[32px] md:ml-[80px] md:text-[64px] md:leading-[64px]"
              >
                I build across the whole stack, from interfaces &amp; APIs to
                robots.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="text-muted-light mt-[40px] max-w-[550px] text-[18px] leading-[22px] font-normal md:mt-[40px] md:ml-[80px]"
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
            className="mx-auto grid w-full max-w-[560px] grid-cols-4 items-center justify-items-center gap-x-4 gap-y-8 sm:max-w-[680px] sm:gap-x-8 sm:gap-y-10 md:max-w-[780px] md:gap-x-12 lg:max-w-[1040px] lg:grid-cols-10 lg:gap-x-8 lg:gap-y-14"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {coreStack.map((tech, index) => (
              <motion.li
                key={tech.name}
                variants={scaleIn}
                className={cn(
                  'flex items-center justify-center',
                  'col-span-1 lg:col-span-2',
                  index === 5 && 'lg:col-start-3'
                )}
              >
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  width={100}
                  height={100}
                  className="h-[52px] w-auto object-contain grayscale transition duration-300 ease-out hover:scale-110 hover:grayscale-0 sm:h-[68px] md:h-[84px] lg:h-[100px]"
                />
              </motion.li>
            ))}
          </motion.ul>
        </SectionInner>
      </Section>
    </ParallaxSection>
  );
}
