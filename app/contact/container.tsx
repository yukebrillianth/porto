'use client';

import Image from 'next/image';

import { Footer, Navbar } from '@/components/layouts';
import {
  ButtonLink,
  ContentBlock,
  Eyebrow,
  GlowOrb,
  Section,
  SectionInner,
  SectionTitle,
} from '@/components/ui';
import { email, socials } from '@/constants';

/** The two channels Yuke actually answers on, promoted to primary CTAs. */
const INSTAGRAM = socials.find(
  (social) => social.platform === 'Instagram'
)?.href;

/** The rest of the profiles, shown as secondary cards below the CTAs. */
const OTHER_SOCIALS = socials.filter(
  (social) => social.platform !== 'Instagram'
);

/**
 * Contact.
 *
 * There is no form here on purpose. The previous one had no backend - it
 * validated three fields, then handed the message to `window.location.href =
 * mailto:`, so it was an email link wearing a form costume: it asked for the
 * visitor's name and address that their mail client already knows, and it
 * could silently fail if no mail handler was registered. Two direct channels
 * are faster for the visitor and honest about where the message ends up.
 *
 * That also drops react-hook-form, zod resolver and toast from this route.
 */
export default function ContactContainer() {
  return (
    <>
      <Section tone="dark" className="min-h-screen">
        <Navbar />

        {/*
          The orb sits in the upper half on purpose. Parked at `bottom-0` it
          rendered behind the footer, which clipped the bloom into a hard edge
          instead of letting it fade out.
        */}
        <GlowOrb className="top-[22%] left-[10%]" />

        {/*
          Design-brief Sec. 5.0, the two-level rule: the *block* is centred in
          the page (the default `SectionInner` column), and the eyebrow is
          left-aligned inside that block rather than centred with it. Setting
          `items-start` on the column instead would flush the whole thing to
          the page gutter, which is the thing Sec. 5.0 calls out as wrong.
        */}
        <SectionInner>
          <ContentBlock className="w-full max-w-[48rem]">
            <Eyebrow>CONTACT</Eyebrow>

            <div className="content-indent mt-4 w-full">
              <SectionTitle className="text-white">
                Let&apos;s Talk.
              </SectionTitle>

              <p className="text-muted-dark mt-6 max-w-[41rem] text-[18px] leading-[24px]">
                I&apos;m always happy to talk about robotics, software systems,
                distributed systems, AI and product engineering - whether
                that&apos;s a project you&apos;re building, a problem that
                won&apos;t behave, or a team looking for an engineer who works
                across the stack. Email is the surest way to reach me; Instagram
                works well for anything shorter.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <ButtonLink href={`mailto:${email}`}>Email Me</ButtonLink>

                {INSTAGRAM && (
                  <ButtonLink href={INSTAGRAM} variant="ghost">
                    Message on Instagram
                  </ButtonLink>
                )}
              </div>

              <p className="text-muted-dark mt-6 text-[14px] font-medium">
                or copy it directly:{' '}
                <span className="font-semibold text-white">{email}</span>
              </p>

              <h2 className="mt-16 text-[24px] leading-[28px] font-semibold text-white">
                Elsewhere.
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {OTHER_SOCIALS.map((social) => (
                  <div
                    key={social.platform}
                    className="bg-surface relative flex items-center gap-4 rounded-[12px] px-7 py-5"
                  >
                    <Image
                      src={social.icon}
                      alt=""
                      aria-hidden="true"
                      width={16}
                      height={17}
                      className="h-[17px] w-[16px] shrink-0 brightness-0 invert"
                    />
                    <div>
                      <p className="text-base font-semibold text-white">
                        {social.platform}
                      </p>
                      <p className="text-muted-dark text-sm font-medium">
                        {social.username}
                      </p>
                    </div>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:ring-primary rounded-[12px] transition after:absolute after:inset-0 hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="sr-only">
                        {social.platform} - {social.username}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </ContentBlock>
        </SectionInner>
      </Section>

      <Footer />
    </>
  );
}
