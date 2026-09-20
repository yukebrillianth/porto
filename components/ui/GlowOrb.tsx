import { cn } from '@/lib/cn';

type GlowOrbProps = {
  /** Tailwind position utilities, e.g. "left-[12%] top-[15%]". */
  className?: string;
  /** The fun-fact section uses the brightest instance. */
  intensity?: 'normal' | 'bright';
  /**
   * `md` is the hero's orb, which starts at 150px and grows at md. Every other
   * section in the 2022 site used a flat 300px at all widths, which is `lg`.
   */
  size?: 'md' | 'lg';
};

/**
 * The ambient conic light source that drifts to a different irregular corner in
 * each section. Purely decorative.
 *
 * Always give it a mobile position as well as a desktop one. An absolutely
 * positioned element with every offset set to `auto` falls back to its static
 * position, which parks it at the top left of the section instead of the edge.
 *
 * @example
 * <GlowOrb className="left-[12%] top-[15%]" />
 */
export function GlowOrb({
  className,
  intensity = 'normal',
  size = 'md',
}: GlowOrbProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'orb pointer-events-none absolute z-0 rounded-full',
        size === 'md'
          ? 'h-[150px] w-[150px] md:h-[300px] md:w-[300px]'
          : 'h-[300px] w-[300px]',
        intensity === 'bright' ? 'opacity-70' : 'opacity-30',
        className
      )}
    />
  );
}
