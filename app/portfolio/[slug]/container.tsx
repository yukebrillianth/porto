import Image from 'next/image';

import { RichText } from '@graphcms/rich-text-react-renderer';
import type { RichTextContent } from '@graphcms/rich-text-types';

import { Footer, Navbar } from '@/components/layouts';
import { ProjectGallery } from '@/components/portfolio';
import { ButtonLink, GlowOrb, Section, SectionInner } from '@/components/ui';
import type { ProjectDetail } from '@/types/content';

type ProjectContainerProps = {
  project: ProjectDetail;
};

/**
 * Deliberately a server component: the only interactive part of this page is
 * the gallery lightbox, and `ProjectGallery` carries its own `'use client'`.
 * Keeping the boundary there means the rich-text renderer and the whole article
 * body stay out of the client bundle.
 */

/**
 * Article body renderers.
 *
 * Body copy is the one place a second family appears: PT Serif at 20px. Headings
 * snap back to Gilroy (`font-sans`) so the hierarchy still reads as the brand.
 *
 * Tables are wrapped in an overflow container here, in the renderer, rather than
 * by the DOM-mutating `public/table.js` the 2022 site shipped.
 */
const renderers = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="font-sans text-[34px] leading-[34px] font-semibold md:text-[64px] md:leading-[64px]">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mt-12 mb-4 font-sans text-[30px] leading-[36px] font-semibold md:text-[40px] md:leading-[48px]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-10 mb-3 font-sans text-[24px] leading-[32px] font-semibold">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="mt-8 mb-2 font-sans text-[20px] leading-[28px] font-semibold">
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-muted-light mb-6 font-serif text-[20px] leading-[32px]">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="text-muted-light mb-6 list-disc pl-6 font-serif text-[20px] leading-[32px]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="text-muted-light mb-6 list-decimal pl-6 font-serif text-[20px] leading-[32px]">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-2">{children}</li>
  ),
  a: ({
    children,
    href,
    openInNewTab,
  }: {
    children: React.ReactNode;
    href?: string;
    openInNewTab?: boolean;
  }) => (
    <a
      href={href}
      {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      className="text-primary font-serif underline underline-offset-4 hover:opacity-70"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-primary text-muted-light mb-6 border-l-4 pl-6 font-serif text-[20px] leading-[32px] italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="rounded-md bg-gray-100 p-2 font-mono text-sm">
      {children}
    </code>
  ),
  code_block: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-6 overflow-x-auto rounded-md bg-gray-100 p-2 font-mono text-sm">
      <code>{children}</code>
    </pre>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="mb-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-left font-sans text-base">
        {children}
      </table>
    </div>
  ),
  table_head: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-800 text-white">{children}</thead>
  ),
  table_body: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  table_row: ({ children }: { children: React.ReactNode }) => (
    <tr className="transition even:bg-gray-100 hover:bg-gray-300">
      {children}
    </tr>
  ),
  table_header_cell: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-gray-300 px-4 py-2.5 font-semibold whitespace-nowrap">
      {children}
    </th>
  ),
  table_cell: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-gray-300 px-4 py-2.5">{children}</td>
  ),
  img: ({
    src,
    altText,
    width,
    height,
  }: {
    src?: string;
    altText?: string;
    width?: number;
    height?: number;
  }) => (
    <Image
      src={src ?? ''}
      alt={altText ?? ''}
      width={width ?? 1200}
      height={height ?? 675}
      className="mb-6 h-auto w-full rounded-lg"
    />
  ),
};

export default function ProjectContainer({ project }: ProjectContainerProps) {
  const gallery =
    project.images.length > 0
      ? project.images
      : [{ fileName: project.title, url: project.coverUrl }];

  return (
    <>
      <Section>
        <GlowOrb className="top-[20%] left-[10%]" />

        <Navbar />

        <SectionInner className="pt-8 md:pt-12">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            {project.category.length > 0 && (
              <p className="text-muted-dark mb-4 text-lg uppercase">
                {project.category.join(' · ')}
              </p>
            )}

            <h1 className="mb-6 text-center text-[44px] leading-[55px] font-semibold text-white">
              {project.title}
            </h1>

            {project.portfolioStatus && (
              <span className="bg-primary mb-10 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                {project.portfolioStatus}
              </span>
            )}

            <ProjectGallery images={gallery} title={project.title} />

            {project.projectUri && (
              <ButtonLink href={project.projectUri} className="mt-12">
                <Image
                  src="/icons/link.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
                Link to this project
              </ButtonLink>
            )}
          </div>
        </SectionInner>
      </Section>

      {project.details && (
        <Section tone="light">
          <SectionInner>
            <article className="mx-auto max-w-3xl">
              <RichText
                content={project.details.raw as RichTextContent}
                renderers={renderers}
              />
            </article>
          </SectionInner>
        </Section>
      )}

      <Footer />
    </>
  );
}
