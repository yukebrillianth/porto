import { ProjectCardSkeleton } from '@/components/portfolio';
import { GlowOrb, Section, SectionInner } from '@/components/ui';

const SKELETON_COUNT = 6;

export default function Loading() {
  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[18%] right-[8%]" />

      <SectionInner className="pt-8 md:px-7 md:py-16 md:pt-12 2xl:px-[170px] 2xl:py-32">
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="mt-0 mb-3 text-[38px] leading-[44px] font-semibold text-white md:text-[54px] md:leading-[60px]">
            Projects.
          </h1>

          <div className="mb-10 h-6 w-full max-w-[420px] animate-pulse rounded-full bg-white/5" />
        </div>

        <div className="mb-14 flex w-full flex-col items-center gap-6">
          <div className="bg-surface h-12 w-full max-w-[560px] animate-pulse rounded-full" />
          <div className="flex w-full flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="bg-surface h-10 w-20 animate-pulse rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="mb-12 grid w-full max-w-[1140px] grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </SectionInner>
    </Section>
  );
}
