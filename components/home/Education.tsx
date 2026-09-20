import {
  AnimatedTimeline,
  ContentBlock,
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
} from '@/components/ui';
import { timeline } from '@/constants';

/**
 * Education and experience, merged into one timeline.
 *
 * Stacked rather than split. The old side-by-side row squeezed the timeline
 * into whatever the text block left over, which is what forced the cramped
 * zig-zag in the first place. Text block on top, timeline full measure below,
 * both pinned to the same 860px column so the eyebrow, the heading indent and
 * the rail all line up down the left edge.
 */
export function Education() {
  return (
    <Section id="education">
      <GlowOrb className="md:top-[25%] md:right-[25%]" />

      <SectionInner className="md:pb-[70px]">
        <ContentBlock className="w-full max-w-[860px]">
          <Eyebrow>MY JOURNEY</Eyebrow>

          <h2 className="mt-[32px] text-[34px] leading-[34px] font-semibold md:mt-[32px] md:ml-[80px] md:text-[64px] md:leading-[64px]">
            From interfaces
            <br />
            to autonomous
            <br />
            robots.
          </h2>

          <p className="text-muted-dark mt-[40px] max-w-[635px] text-[18px] leading-[24px] font-normal md:mt-[40px] md:ml-[80px]">
            I&apos;m an undergraduate Computer Engineering student at Institut
            Teknologi Sepuluh Nopember in Surabaya. I taught myself to build for
            the web well before that, and full-stack development is still the
            foundation everything else sits on.
          </p>

          <p className="text-muted-dark mt-6 max-w-[635px] text-[18px] leading-[24px] font-normal md:ml-[80px]">
            Joining the IRIS ITS Robotic Team widened the work considerably:
            ROS, C++, computer vision and networking. Today I build distributed
            communication for autonomous soccer robots in the RoboCup Middle
            Size League: real-time, multi-robot, and designed to survive the
            wireless conditions of a live competition.
          </p>
        </ContentBlock>

        <div className="z-10 mt-[64px] w-full max-w-[860px] md:mt-[88px] md:pl-[80px]">
          <AnimatedTimeline entries={timeline} />
        </div>
      </SectionInner>
    </Section>
  );
}
