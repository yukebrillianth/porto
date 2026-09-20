import { ProjectCardSkeleton } from '@/components/portfolio';
import { GlowOrb, Section, SectionInner } from '@/components/ui';

/** Eight skeleton tiles - roughly two rows at the xl grid width. */
const SKELETON_COUNT = 8;

/**
 * Mirrors the real container's measures exactly - same 28px gutter until 2xl,
 * same 315px grid tracks, same title and filter spacing - so swapping the
 * skeleton for the loaded page does not shift anything.
 */
export default function Loading() {
  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[18%] right-[8%]" />

      <SectionInner className="pt-8 md:px-7 md:py-16 md:pt-12 2xl:px-[170px] 2xl:py-32">
        <h1 className="mt-0 mb-[40px] text-[3.375rem] leading-[3.687rem] font-semibold">
          Portfolio.
        </h1>

        <div className="mb-[100px] flex w-full flex-col items-center gap-[25px]">
          <div className="bg-surface h-[54px] w-full max-w-[560px] animate-pulse rounded-full" />
          <div className="flex w-full flex-wrap justify-between gap-[25px] md:w-auto md:justify-center">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="bg-surface h-[46px] w-[45%] animate-pulse rounded md:rounded-full lg:w-[104px]"
              />
            ))}
          </div>
        </div>

        <div className="mb-[40px] grid w-full grid-cols-[minmax(0,315px)] justify-center gap-5 lg:grid-cols-[repeat(2,minmax(0,315px))] xl:grid-cols-[repeat(3,minmax(0,315px))] 2xl:grid-cols-[repeat(4,minmax(0,315px))]">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </SectionInner>
    </Section>
  );
}
