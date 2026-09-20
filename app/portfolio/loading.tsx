import { ProjectCardSkeleton } from '@/components/portfolio';
import { GlowOrb, Section, SectionInner, SectionTitle } from '@/components/ui';

/** Eight skeleton tiles - roughly two rows at the xl grid width. */
const SKELETON_COUNT = 8;

export default function Loading() {
  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[18%] right-[8%]" />

      <SectionInner className="pt-8 md:pt-12">
        <SectionTitle className="mb-[70px]">Portfolio.</SectionTitle>

        <div className="mb-[126px] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="bg-surface h-[54px] w-full animate-pulse rounded-full lg:max-w-xl" />
          <div className="bg-surface h-[46px] w-full animate-pulse rounded-full lg:w-[320px]" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </SectionInner>
    </Section>
  );
}
