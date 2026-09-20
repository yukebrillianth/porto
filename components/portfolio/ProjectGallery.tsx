'use client';

import { useCallback, useRef, useState, type MouseEvent } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/cn';
import { BLUR_DATA_URL } from '@/lib/image';
import type { ProjectImage } from '@/types/content';

type ProjectGalleryProps = {
  images: ProjectImage[];
  /** Used for alt text on the active image. */
  title: string;
  className?: string;
};

/**
 * Cover image + thumbnail strip, with a zoom lightbox.
 *
 * The lightbox is the native `<dialog>` element opened via `showModal()`, which
 * gives us the whole accessibility contract for free — focus trap, `Escape` to
 * dismiss, implicit `aria-modal`, inertness of the rest of the page, and focus
 * restoration on close. Only backdrop-click-to-dismiss has to be wired by hand.
 * The 2022 site used Headless UI's Dialog for this; the platform now covers it,
 * so we ship no extra dependency.
 */
export function ProjectGallery({
  images,
  title,
  className,
}: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Clamp during render rather than correcting in an effect: if `images` gets
  // shorter, a stale index resolves to the first image on the same pass instead
  // of cascading a second render.
  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const active = images[safeIndex];

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const openLightbox = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  if (!active) return null;

  /**
   * `<dialog>` sizes itself to its content, so any click landing on the element
   * itself — rather than on a child — came from the ::backdrop.
   */
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) closeLightbox();
  };

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        onClick={openLightbox}
        aria-label={`Zoom image: ${active.fileName || title}`}
        className="focus-visible:ring-primary focus-visible:ring-offset-dark block w-full cursor-zoom-in rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src={active.url}
          alt={active.fileName || title}
          width={1600}
          height={900}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority
          className="w-full rounded-lg object-cover"
        />
      </button>

      {images.length > 1 && (
        <ul className="mt-6 flex flex-wrap justify-center gap-4">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === safeIndex}
                className={cn(
                  'focus-visible:ring-primary focus-visible:ring-offset-dark block overflow-hidden rounded-lg transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  index === safeIndex
                    ? 'border-primary border-4'
                    : 'hover:opacity-70'
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg bg-white object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label={`${title} — enlarged image`}
        className="backdrop:bg-dark/90 m-auto max-h-[92vh] max-w-[92vw] bg-transparent p-0 backdrop:backdrop-blur-sm"
      >
        <button
          type="button"
          onClick={closeLightbox}
          aria-label="Close enlarged image"
          className="focus-visible:ring-primary block cursor-zoom-out focus-visible:ring-2 focus-visible:outline-none"
        >
          <Image
            src={active.url}
            alt={active.fileName || title}
            width={1600}
            height={900}
            className="max-h-[92vh] w-auto rounded-lg object-contain"
          />
        </button>
      </dialog>
    </div>
  );
}
