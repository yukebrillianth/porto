import Image from 'next/image';

import { Eyebrow, GlowOrb, Section, SectionInner } from '@/components/ui';
import { socials } from '@/constants';

/**
 * The social band. `flex-wrap-reverse` puts the icon grid first in the DOM — so
 * it sits left on desktop but drops *below* the text on mobile, mirroring
 * Education's normal wrap for a zig-zag down the page.
 */
export function Social() {
  return (
    <Section id="social">
      <GlowOrb className="md:bottom-0 md:left-[15%]" />

      <SectionInner>
        <div className="flex flex-wrap-reverse items-center gap-y-16 md:flex-nowrap md:gap-x-16">
          <ul
            className="grid w-full auto-rows-[80px] gap-x-[20px] gap-y-[30px] md:w-1/2"
            style={{
              gridTemplateColumns: 'repeat(2, minmax(100px, 200px))',
            }}
          >
            {socials.map((social) => (
              <li
                key={social.platform}
                className="bg-surface relative flex flex-col justify-center rounded-[12px] px-7 py-2.5"
              >
                <Image
                  src={social.icon}
                  alt=""
                  aria-hidden="true"
                  width={16}
                  height={17}
                  className="h-[17px] w-4 object-contain"
                />
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 text-[18px] leading-[22px] font-semibold after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {social.platform}
                  <span className="sr-only"> — opens in a new tab</span>
                </a>
                <span className="text-muted-dark text-[12px] leading-[15px] font-medium">
                  {social.username}
                </span>
              </li>
            ))}
          </ul>

          <div className="w-full md:w-1/2">
            <Eyebrow>MY SOCMED</Eyebrow>

            <h2 className="content-indent mt-4 text-[34px] leading-[34px] font-semibold md:text-[64px] md:leading-[64px]">
              I have several
              <br />
              social / media
              <br />
              accounts.
            </h2>

            <p className="content-indent text-muted-dark mt-8 max-w-[404px] text-[18px] leading-[22px]">
              You can find me on several social media platforms. Feel free to
              follow or contact me there.
            </p>
          </div>
        </div>
      </SectionInner>
    </Section>
  );
}
