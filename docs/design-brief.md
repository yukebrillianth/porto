# Design Brief - yukebrillianth portfolio (2026 rewrite)

> **This is the source of truth for all visual decisions.** Every agent working on this
> repo must read this file before writing UI code. The goal is to carry the _soul_ of the
> 2022 portfolio into a modern stack - not to redesign it.

---

## 1. The one-paragraph summary

Dark-first, cosmic-editorial. A near-black canvas (`#121212`) with a barely-visible
hairline graph-paper grid on every surface, punctuated by blurred violet→amber conic
"orbs" that drift to a different corner in each section. A single orange accent
(`#FF9800`) carries every call-to-action, always as a full-round pill with a soft orange
glow beneath it. Typography is one family - Gilroy - set heavy, tight and large, with
section titles that always end in a period. Light `#FFFFFF` bands are used _only_ for
reading content, creating a dark-chrome / light-paper rhythm down the page.

**Feel:** confident, spacious, slightly cosmic, engineered. Not playful, not corporate.

---

## 2. Color tokens

Defined in `app/globals.css` via `@theme inline`. **Never hardcode these hexes in
components - use the utility classes.**

| Token                  | Hex       | Utility                                      | Role                                                        |
| ---------------------- | --------- | -------------------------------------------- | ----------------------------------------------------------- |
| `--color-dark`         | `#121212` | `bg-dark`                                    | The primary canvas. Dominant ground.                        |
| `--color-primary`      | `#FF9800` | `bg-primary` `text-primary` `border-primary` | The _only_ flat accent. CTAs, eyebrow rules, active states. |
| `--color-surface`      | `#1D1D1D` | `bg-surface`                                 | Raised cards on dark. A 5% lift - no border, no shadow.     |
| `--color-surface-deep` | `#101010` | `bg-surface-deep`                            | Inset pills (blog series chips).                            |
| `--color-muted-dark`   | `#B8B8B8` | `text-muted-dark`                            | Body copy **on dark** sections.                             |
| `--color-muted-light`  | `#575958` | `text-muted-light`                           | Body copy **on light** sections.                            |
| `--color-violet`       | `#BB34FA` | -                                            | Gradient partner only. Never a flat fill.                   |
| `--color-violet-deep`  | `#B524F9` | -                                            | The `0deg` stop of the conic orb only.                      |

**Rules**

- Violet never appears as a flat color - it exists only inside gradients and glows.
- There is no secondary flat accent. If something needs emphasis, it's orange or it's white.
- Headings on dark are always pure `#FFFFFF`, never a gray.

---

## 3. Typography

**One family: Gilroy.** Self-hosted from `public/fonts/`, loaded via `next/font/local`
and exposed as `--font-gilroy` → `font-sans`. Weights 100–900 with italics available.

**Second family: PT Serif**, loaded via `next/font/google`, exposed as `--font-serif`.
Used _exclusively_ for long-form article body copy (blog posts, project detail prose) at
20px. The 2022 site declared PT Serif but never loaded it - we fix that.

### Scale

| Element                     | Mobile             | Desktop            | Weight    |
| --------------------------- | ------------------ | ------------------ | --------- |
| Hero `h1`                   | `54px` / lh `72px` | `72px`             | 600 → 700 |
| Section title (`About Me.`) | `54px` / lh `59px` | same               | 600       |
| Content heading `h2`        | `34px` / lh `34px` | `64px` / lh `64px` | 600       |
| Eyebrow label               | `13px` / lh `23px` | same               | 600       |
| Body paragraph              | `18px` / lh `24px` | same               | 400       |
| Nav link                    | `14px`             | same               | 500       |
| CTA button                  | `18px`             | `14px`             | 600       |
| Card title                  | `24px`             | same               | 600       |
| Meta / date                 | `12–14px`          | same               | 500–600   |

**Rules**

- `font-semibold` (600) is the house weight. Use it unless there's a reason not to.
- **Zero letter-spacing.** Never add `tracking-*`. The 2022 site has none, anywhere.
- Leading is hand-set to match the table above, not left to Tailwind defaults.
- **Every section title ends with a period.** "About Me." "Portfolio." "Latest Posts."
  This mirrors the dot in the logo mark. It is not optional.

---

## 4. The five signature elements

These are the things that make the site feel like _Yuke's_ site. Reproduce them exactly.

### 4.1 The glow pill (`<Button>`)

The single most-repeated token on the site. Appears on every CTA.

```
bg-primary text-white font-semibold rounded-full
px-6 py-3 (mobile: px-4 py-2)
shadow-[0px_4px_20px_rgba(255,152,0,0.3)]
hover:opacity-70 transition
```

`hover:opacity-70` is the _only_ hover treatment on buttons. No lift, no scale, no color shift.

### 4.2 The outdented eyebrow rule (`<Eyebrow>`)

A 32px orange hairline raised to superscript, sitting 1em before every section label.
Editorial and magazine-like - it's what makes labels read as labels.

```
text-[13px] leading-[23px] font-semibold
before:content-[''] before:inline-block before:align-super
before:w-[32px] before:border-t before:border-primary before:mr-[1em]
```

Used for: `FUN FACT`, `MY EDUCATION`, `MY SOCMED`, `404-ERROR`.

### 4.3 The conic orb (`<GlowOrb>`)

An ambient light source that drifts to a different irregular corner in each section.

```css
background: conic-gradient(
  from 180deg at 50% 50%,
  #b524f9 0deg,
  #ff9800 0.04deg,
  #bb34fa 360deg
);
filter: blur(100px);
```

300×300, `rounded-full`, `opacity-30` (or `opacity-70` for the brightest instance in the
fun-fact section), `absolute z-0`. The `0.04deg` orange sliver is a hard seam that, at
100px blur, reads as a magenta-to-amber bloom. **Keep the 0.04deg.**

Positions are deliberately non-repeating: Hero `left-[12%] top-[15%]` · FunFact
`md:right-[20%] top-[25%]` · Education `md:right-[25%] md:top-[25%]` · Social
`md:left-[15%] md:bottom-0`.

### 4.4 The hairline grid

`grid-dark.svg` / `grid-light.svg` at 1–6% opacity, ~111px pitch, behind **every**
section, the navbar and the footer. Background-size steps `400% → 300% → 200% → cover`
across breakpoints with `background-position: 100%`. Barely perceptible - but remove it
and the site goes flat. This is the connective tissue.

### 4.5 SVG line-draw reveal

Illustrations draw themselves on load: `stroke-dashoffset` → 0 over 0.5–0.7s per element
at `cubic-bezier(0.47, 0, 0.745, 0.715)`, staggered **120ms**, with fills fading in ~0.8s
later. One element is left bobbing `translateY(0 → -20px)` at `.9s linear infinite
alternate` forever.

**2026 upgrade:** the 2022 version fired on page load regardless of visibility (the
`onScreen` class was never wired up). We now trigger it on scroll-into-view via
`IntersectionObserver`, and respect `prefers-reduced-motion`.

---

## 5. Layout & rhythm

### 5.0 EVERY SECTION IS A CENTERED COLUMN - read this first

This is the rule the first build got wrong, and getting it wrong makes the whole
site look nothing like the original. **Every top-level section in the 2022 site is
`flex flex-col items-center`.** The section title and the content block are
_centered in the viewport_; they are NOT left-aligned to the gutter.

```
<section class="relative flex flex-col items-center px-7 py-16 md:px-[170px] md:py-32">
  <h2>About Me.</h2>              ← centered by items-center
  <div>                            ← the "Quotes" block, also centered
    <Eyebrow>FUN FACT</Eyebrow>    ← left-aligned INSIDE this block
    <h2 class="md:ml-[80px]">…</h2>← indented 80px relative to the eyebrow
    <p  class="md:ml-[80px]">…</p>
  </div>
</section>
```

So there are two levels: the **block** is centered in the page, and _within_ the
block the eyebrow hangs at the block's left edge while the heading/paragraph are
pushed 80px right of it. Left-aligning the whole block to the page gutter - which
is what "content-indent on a full-width section" produces - is wrong.

Exact original values:

| Section     | Wrapper                                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Hero        | `flex flex-col items-center md:px-0`                                                                       |
| FunFact     | `flex flex-col items-center` · `p-[64px_28px] md:p-[128px_170px]` · title `mb-[92px]` · block `mb-[100px]` |
| Education   | `flex flex-wrap justify-around items-center` · `p-[64px_32px_128px] md:p-[128px_170px_70px]`               |
| Social      | `flex flex-wrap-reverse justify-around items-center` · `p-[0_32px_128px] md:p-[0_170px_128px]`             |
| Portfolio   | `flex flex-col items-center justify-between xl:justify-center` · title `mb-[40px]` · filters `mb-[100px]`  |
| LatestPosts | `flex flex-col items-center` · `p-[64px_28px] md:p-[128px_170px]` · title `mb-[92px]`                      |

Education and Social are **not** column layouts - they are `flex-wrap` rows that
put the text block and the illustration side by side and wrap on mobile.

### 5.1 Other measures

- **Section padding:** `px-7 py-16` → `md:px-[170px] md:py-32`. The **170px side gutter**
  is the signature desktop measure.
- **The 80px indent:** within a content block, the heading and paragraph are indented
  `80px` while the eyebrow hangs outdented. Preserve it.
- **Alternating bands:** Dark → Light → Dark → Light → Footer(dark).
- **Zig-zag:** Education uses normal wrap (text left, art right); Social uses
  `flex-wrap-reverse` (art left, text right) so the two sections mirror each other.
- **Breakpoints:** this is a 2-state design. `md` does ~80% of the work.
- Portfolio grid: `1 → lg:2 → xl:3 → 2xl:4`, gap `20px`.
- **Skill logos are large and bare** - no text labels, no chips. `flex flex-wrap`
  with `space-x-8 space-y-8 md:space-x-12 lg:space-x-24 xl:space-x-32`,
  `place-items-center place-content-center`, rendered at ~100px tall.

---

## 6. Component treatments

| Component          | Treatment                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Card on dark       | `bg-surface rounded-xl px-7 py-2.5` - no border, no shadow, no hover                                              |
| Social card        | Full-card click target via stretched link: `after:absolute after:inset-0`                                         |
| Portfolio card     | `rounded-lg` cover; hover reveals `bg-dark/70` scrim + centered 22px title, `transition duration-300 ease-in-out` |
| Active filter chip | **Inverted**: `bg-white text-dark`. Inactive: transparent + white text                                            |
| Blog category flag | Orange badge tucked into the cover's top-right, `rounded-tr-lg` _only_                                            |
| Active thumbnail   | `border-4 border-primary`                                                                                         |
| Skeleton           | `animate-pulse` on the placeholder                                                                                |

---

## 7. Hard rules - do not violate

1. **No twin.macro, no styled-components.** Plain Tailwind v4 utility classes only,
   per the template. Arbitrary values (`text-[54px]`) are fine and expected.
2. **No `tracking-*`** anywhere.
3. **Never drop the period** from a section title.
4. **Never change the glow shadow value** - `0px 4px 20px rgba(255,152,0,0.3)`.
5. **No new accent colors.** Orange, white, violet-in-gradients. That's the palette.
6. **No theme toggle.** Dark/light are compositional bands, not a user preference. The
   2022 config had `darkMode: false` deliberately.
7. **Don't use Inter, Roboto, or system fonts.** Gilroy is the identity.
8. **Don't center everything.** The asymmetric 80px indent is the point.

---

## 8. What we deliberately improve

The 2022 site is the reference for _taste_, not for _code quality_. These are fixed:

- `hero.svg` / `hero-mobile.svg` were **315KB each** with a base64 PNG embedded inside.
  Replaced with a real `next/image` photo + a lightweight SVG frame for the glow,
  orbit arcs and floating chips.
- `education.svg` (68KB) rebuilt as a real, accessible React timeline component driven by
  data - so it's editable, responsive, and readable by screen readers.
- Line-draw animations now trigger on scroll and respect `prefers-reduced-motion`.
- `@font-face` cleaned up: the 2022 sheet registered ExtraBold _and_ Bold both as `bold`,
  making ExtraBold unreachable. Now loaded properly via `next/font/local` with correct
  numeric weights and subsetting.
- PT Serif is actually loaded now instead of silently falling back to generic serif.
- All decorative SVG marked `aria-hidden`; all meaningful images get real alt text.
- `rel="nofollow nooperner"` typo fixed to `noopener noreferrer`.
- Apollo + `ApolloLink.split` dropped in favour of two thin `graphql-request` clients.

---

## 9. Voice & copy

First person. Confident, not arrogant. Technical but readable. Concise.
Section titles are short noun phrases ending in a period. Eyebrows are UPPERCASE.

**Avoid:** "passionate developer", buzzword stacking, "guru/expert/10x", resume-bullet
phrasing, invented metrics. See `docs/bio-context.md` for the full content rules and the
factual record - never invent a fact that isn't in that file.
