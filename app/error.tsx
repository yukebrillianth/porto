'use client';

import { Button, Eyebrow, GlowOrb } from '@/components/ui';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-dark grid-bg-dark relative flex min-h-screen flex-col items-center justify-center gap-6 px-7 text-center">
      <GlowOrb className="top-[20%] left-[15%]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <Eyebrow>SOMETHING BROKE</Eyebrow>

        <h1 className="text-[48px] leading-[52px] font-semibold text-white md:text-[74px] md:leading-[81px]">
          Whoops!
        </h1>

        <p className="text-muted-dark max-w-md text-[18px] leading-[24px] font-normal">
          Something went wrong on our end. Try again, and if it keeps happening
          it&apos;s probably worth telling me about.
        </p>

        <Button onClick={reset} className="mt-2">
          Try Again
        </Button>
      </div>
    </div>
  );
}
