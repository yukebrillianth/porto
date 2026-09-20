import { Section, SectionInner } from '@/components/ui';

/** Mirrors the /blog band rhythm so the swap to real content does not jump. */
export default function Loading() {
  return (
    <>
      <Section tone="dark">
        <SectionInner className="flex animate-pulse flex-col items-center">
          <div className="h-[59px] w-full max-w-lg rounded-lg bg-white/10" />
          <div className="mt-6 h-[72px] w-full max-w-[41rem] rounded-lg bg-white/5" />
          <div className="mt-10 h-[52px] w-full rounded-full bg-white/10 lg:max-w-xl" />
          <div className="mt-8 flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[38px] w-[96px] rounded-full bg-white/10"
              />
            ))}
          </div>
        </SectionInner>
      </Section>

      <Section tone="light">
        <SectionInner className="animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="mb-12 flex max-w-sm flex-col md:max-w-4xl lg:flex-row"
            >
              <div className="h-[203px] w-full shrink-0 rounded-lg bg-black/10 lg:w-[360px]" />
              <div className="mt-5 w-full lg:mt-0 lg:ml-[40px]">
                <div className="h-8 w-3/4 rounded bg-black/10" />
                <div className="mt-3 h-4 w-32 rounded bg-black/5" />
                <div className="mt-4 h-4 w-full rounded bg-black/5" />
                <div className="mt-2 h-4 w-5/6 rounded bg-black/5" />
              </div>
            </div>
          ))}
        </SectionInner>
      </Section>
    </>
  );
}
