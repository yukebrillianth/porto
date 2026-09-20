import Image from 'next/image';

import {
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import { coreStack } from '@/constants';

/**
 * Icons that actually exist in public/icons. Entries in `coreStack` without a
 * shipped file (ros.svg, cpp.svg, ts.svg) fall back to a text chip rather than
 * rendering a broken image.
 */
const availableIcons = new Set([
  '/icons/react.svg',
  '/icons/next.svg',
  '/icons/node.svg',
  '/icons/laravel.svg',
  '/icons/gql.svg',
]);

/**
 * The light reading band. The eyebrow hangs outdented at the true margin while
 * the heading and paragraph sit at the 80px content indent — the most
 * distinctive compositional move on the site.
 */
export function FunFact() {
  return (
    <Section id="about" tone="light">
      <GlowOrb className="top-[25%] md:right-[20%]" intensity="bright" />

      <SectionInner>
        <SectionTitle>About Me.</SectionTitle>

        <div className="mt-12">
          <Eyebrow>FUN FACT</Eyebrow>

          <h2 className="content-indent mt-4 text-[34px] leading-[34px] font-semibold md:text-[64px] md:leading-[64px]">
            I build across the
            <br />
            whole stack, from
            <br />
            interfaces to robots.
          </h2>

          <p className="content-indent text-muted-light mt-8 max-w-[404px] text-[18px] leading-[22px]">
            I started in full-stack web and mobile development, then joined IRIS
            ITS out of curiosity about robotics.
            <br />
            That turned into ROS, C++, computer vision and real-time multi-robot
            communication.
            <br />
            These days I work on autonomous soccer robots and distributed
            systems, and still ship production web software.
          </p>

          <ul className="content-indent mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            {coreStack.map((tech) =>
              availableIcons.has(tech.icon) ? (
                <li key={tech.name} className="flex items-center gap-2">
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                  />
                  <span className="text-muted-light text-[14px] leading-[18px] font-medium">
                    {tech.name}
                  </span>
                </li>
              ) : (
                <li key={tech.name}>
                  <span className="text-muted-light rounded-full border border-current/25 px-3 py-1.5 text-[14px] leading-[18px] font-semibold">
                    {tech.name}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </SectionInner>
    </Section>
  );
}
