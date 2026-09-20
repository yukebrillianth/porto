import { ButtonLink, Eyebrow } from '@/components/ui';

/**
 * The 404 is the one full-bleed page on the site: no bands, no navbar chrome -
 * just the black-hole line field with its two orange accretion streaks, centred
 * under the type. The artwork is decorative, so it stays a CSS background.
 */
export default function NotFound() {
  return (
    <main
      className="bg-dark flex min-h-screen flex-col items-center justify-center bg-cover bg-no-repeat px-7 py-16 text-center text-white"
      style={{
        backgroundImage: "url('/backgrounds/black-hole.svg')",
        backgroundPosition: '50%',
      }}
    >
      <Eyebrow className="text-[14px] leading-[20px] font-bold">
        404-ERROR
      </Eyebrow>

      <h1 className="mt-6 text-[48px] leading-[53px] font-semibold md:text-[74px] md:leading-[81px]">
        Whoops!
      </h1>

      <p className="mt-2 text-[40px] leading-[44px] font-semibold md:text-[64px] md:leading-[64px]">
        The page is gone.
      </p>

      <p className="text-muted-dark mt-6 max-w-[34rem] text-[18px] leading-[24px]">
        Maybe this page used to exist or you just misspelled something.
      </p>

      <div className="mt-10">
        <ButtonLink href="/">Back Home</ButtonLink>
      </div>
    </main>
  );
}
