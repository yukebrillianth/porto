import { Section, SectionInner } from '@/components/ui';

/** Mirrors the post hero + article rhythm so the content swap does not jump. */
export default function Loading() {
  return (
    <>
      <Section tone="dark">
        <SectionInner className="flex animate-pulse flex-col items-center pb-10 md:pb-16">
          <div className="h-[38px] w-[120px] rounded-full bg-white/10" />
          <div className="mt-6 h-[59px] w-full max-w-3xl rounded-lg bg-white/10" />
          <div className="mt-5 h-4 w-48 rounded bg-white/5" />
          <div className="mt-10 aspect-[16/9] w-full max-w-4xl rounded-lg bg-white/10" />
        </SectionInner>
      </Section>

      <Section tone="paper">
        <SectionInner className="md:py-24">
          <div className="mx-auto max-w-3xl animate-pulse">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="mt-4 h-5 rounded bg-black/5 last:w-2/3"
              />
            ))}
          </div>
        </SectionInner>
      </Section>
    </>
  );
}
