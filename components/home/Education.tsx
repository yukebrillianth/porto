import { Eyebrow, GlowOrb, Section, SectionInner } from '@/components/ui';
import { AnimatedTimeline } from '@/components/ui/AnimatedTimeline';
import { timeline } from '@/constants';

/**
 * The education band. Text sits left with the illustration right — normal wrap,
 * which the Social section mirrors with `flex-wrap-reverse` to zig-zag down the
 * page. The 2022 copy described a high-school student; that is no longer true.
 */
export function Education() {
  return (
    <Section id="education">
      <GlowOrb className="md:top-[25%] md:right-[25%]" />

      <SectionInner>
        <div className="flex flex-wrap items-start gap-y-16 md:flex-nowrap md:gap-x-16">
          <div className="w-full md:w-1/2">
            <Eyebrow>MY EDUCATION</Eyebrow>

            <h2 className="content-indent mt-4 max-w-[635px] text-[34px] leading-[34px] font-semibold md:text-[64px] md:leading-[64px]">
              From interfaces
              <br />
              to autonomous
              <br />
              robots.
            </h2>

            <p className="content-indent text-muted-dark mt-8 max-w-[635px] text-[18px] leading-[24px]">
              I&apos;m an undergraduate Computer Engineering student at Institut
              Teknologi Sepuluh Nopember in Surabaya. I taught myself to build
              for the web well before that, and full-stack development is still
              the foundation everything else sits on — frontend interfaces,
              backend APIs, databases and deployment.
            </p>

            <p className="content-indent text-muted-dark mt-6 max-w-[635px] text-[18px] leading-[24px]">
              I joined the IRIS ITS Robotic Team out of curiosity about
              robotics, and it widened the work considerably: ROS, C++, computer
              vision, and networking. Today I build distributed communication
              for autonomous soccer robots in the RoboCup Middle Size League —
              real-time, multi-robot, and designed to survive the wireless
              conditions of a live competition.
            </p>
          </div>

          <div className="w-full md:w-1/2">
            <AnimatedTimeline entries={timeline} />
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
