/**
 * Shared site-wide motion variants.
 *
 * Every animated section imports from this file so the whole page moves with
 * one voice: short travel, no bounce, and an ease that decelerates hard at the
 * end. That deceleration is what makes the motion read as "engineered" rather
 * than playful, which is the register set by docs/design-brief.md.
 *
 * This module is plain data on purpose - no 'use client', no JSX, no hooks. It
 * can therefore be imported from server and client components alike, and the
 * variants can be spread or overridden at the call site.
 *
 * Usage:
 *   <motion.div
 *     variants={staggerContainer}
 *     initial="hidden"
 *     whileInView="visible"
 *     viewport={VIEWPORT}
 *   >
 *     <motion.h2 variants={fadeUp}>About Me.</motion.h2>
 *   </motion.div>
 *
 * Note that a child only inherits `hidden`/`visible` from its parent while the
 * child has no `animate` prop of its own. To combine an entrance reveal with a
 * continuous loop (a floating chip, for example), put the variant on a wrapper
 * and the looping `animate` on the element inside it.
 */

import type { Variants } from 'motion/react';

/**
 * The house easing: a strong ease-out, roughly easeOutQuint. Elements arrive
 * quickly and settle without overshooting.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * The easing used by the 2022 illustration draw-on (easeInQuad), kept here so
 * line-draw and scroll-linked effects stay consistent with the original site.
 * Mirrors `--ease-draw` in app/globals.css.
 */
export const EASE_DRAW = [0.47, 0, 0.745, 0.715] as const;

/** Default duration for a single reveal, in seconds. */
export const DURATION = 0.6;

/** The stagger between siblings of a `staggerContainer`, in seconds. */
export const STAGGER = 0.12;

/**
 * Shared `whileInView` viewport config: fire once, when a quarter of the
 * element is on screen. Reveals should not replay as the user scrolls back up.
 */
export const VIEWPORT = { once: true, amount: 0.25 } as const;

/** The workhorse reveal: 24px up into place while fading in. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION, ease: EASE_OUT },
  },
};

/** A plain cross-fade, for elements that should not move at all. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION, ease: EASE_OUT },
  },
};

/**
 * A gentle swell, for art and media rather than text. The 0.96 floor is
 * deliberately shallow so nothing looks like it is zooming.
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

/**
 * Wrap a group in this to reveal its children one after another. It animates
 * nothing itself, so it is safe on a layout wrapper that already carries
 * positioning utilities.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER },
  },
};

/**
 * Same as `staggerContainer`, but holds the first child back briefly. Useful
 * when a group follows a heading that is already animating in.
 */
export const staggerContainerDelayed: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER, delayChildren: 0.2 },
  },
};
