import { cn } from '@/lib/cn';

type GlowOrbProps = {
  /** Tailwind position utilities, e.g. "left-[12%] top-[15%]". */
  className?: string;
  /** The fun-fact section uses the brightest instance. */
  intensity?: 'normal' | 'bright';
  size?: 'sm' | 'md';
};

/**
 * The ambient conic light source that drifts to a different irregular corner in
 * each section. Purely decorative.
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
          : 'h-[150px] w-[150px]',
        intensity === 'bright' ? 'opacity-70' : 'opacity-30',
        className
      )}
    />
  );
}
