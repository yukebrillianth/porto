import { GlowOrb, Section, SectionInner } from '@/components/ui';

export default function Loading() {
  return (
    <Section className="min-h-screen">
      <GlowOrb className="top-[20%] left-[10%]" />

      <SectionInner className="pt-8 md:pt-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <div className="bg-surface mb-4 h-6 w-32 animate-pulse rounded" />
          <div className="bg-surface mb-3 h-[44px] w-full max-w-xl animate-pulse rounded" />
          <div className="bg-surface mb-10 h-5 w-24 animate-pulse rounded-full" />
          <div className="bg-surface aspect-video w-full animate-pulse rounded-lg" />

          <div className="mt-6 flex gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="bg-surface h-24 w-24 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
