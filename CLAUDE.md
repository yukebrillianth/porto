# CLAUDE.md - yukebrillianth portfolio

Personal portfolio of **Yuke Brilliant Hestiavin** - Software Engineer (autonomous
robotics, distributed systems, full-stack). A 2026 rewrite of the 2022 Next.js portfolio,
rebuilt on the owner's personal Next.js template.

## Read these first

| File                   | When                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `docs/design-brief.md` | **Before writing any UI code.** Visual source of truth.    |
| `docs/bio-context.md`  | **Before writing any copy.** Factual record + voice rules. |

## Scope

**This site is a portfolio and a blog. Nothing else.**

There is no auth, no login, no dashboard, no protected routes, no user accounts, no
client-side data store. The starter template shipped an auth scaffold (AuthContext,
sign-in route, ProtectedRoute, react-query) - it has all been deleted deliberately.
**Do not reintroduce any of it.** Every page is public, and all data is fetched on the
server with ISR.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind **v4** · pnpm

## Non-negotiables

1. **Tailwind v4 is CSS-first.** Config lives in `@theme inline` inside `app/globals.css`.
   **Never create a `tailwind.config.ts`.**
2. **No twin.macro, no styled-components, no CSS-in-JS.** Plain utility classes only.
   Arbitrary values (`text-[54px]`, `md:px-[170px]`) are expected and fine.
3. **Route pattern:** every route is `page.tsx` (server, exports `metadata`) +
   `container.tsx` (`'use client'` when it needs interactivity) + `loading.tsx` if it fetches.
4. **Function declarations, not arrow components.** Arrows only for handlers.
5. **Named exports** for reusable code; default exports only where Next.js requires them
   (page/layout/loading/error/not-found/container).
6. **Props typed with `type`**, named `XProps`. `interface` is reserved for API shapes in `types/`.
7. **`cn()` lives at `@/lib/cn`** - not `lib/utils`. Use it only for conditional classes.
8. **Path alias `@/*` → repo root.** There is no `src/` directory; do not add one.
9. **Import order is enforced** (eslint `import-helpers`), blank-line separated:
   `react` → `next` → third-party → `@/` → relative. Alphabetized within groups.
10. **Never hand-order Tailwind classes** - `prettier-plugin-tailwindcss` sorts them.

## Conventions

- **Never use em dashes or section signs anywhere.** Not in UI copy, not in code, not in
  comments or JSDoc. Use a plain hyphen `-`, or rewrite the sentence. This is a hard
  house rule. To check before committing:
  `grep -rnP '\x{2014}|\x{00A7}' components app lib constants`
- **Prettier:** single quotes, semicolons, 2-space tabs, ES5 trailing commas, 80 cols.
- **Files:** `PascalCase.tsx` for components, `kebab-case.ts` for everything else.
- **UI copy is English** on this site (matching the 2022 original). Code/comments English.
  Note the template ships Indonesian strings - replace them, don't imitate them.
- **Numeric literals** use `_` separators: `60_000`, `15_000`.
- **Static content** (projects, skills, socials, nav) → `constants/` as `as const` objects
  with derived types: `type NavLink = (typeof navLinks)[number]`.
- **Env access via `lib/env.ts`** (`@t3-oss/env-nextjs`). New vars go in three places:
  the `client`/`server` block, `runtimeEnv`, and `.env.example`.
- Commits follow Conventional Commits (commitlint + husky are active).

## Data sources

Two independent CMS backends, each a thin `graphql-request` client in `lib/`:

- **Hygraph** (was GraphCMS) → portfolio projects. Endpoint format
  `https://<region>.cdn.hygraph.com/content/<projectId>/master`. Server-side env only -
  **no `NEXT_PUBLIC_` prefix**, the token must never reach the client bundle.
- **Hashnode** → blog posts, from publication `yukebrillianth.hashnode.dev`.

**Caching: ISR + cache tags, to stay well inside free-tier quotas.** Use
`next: { revalidate: 3600, tags: [...] }` and invalidate on publish via the webhook at
`app/api/revalidate/route.ts`. Never `cache: 'no-store'` on CMS reads.

**SEO:** blog posts render on this domain with `<link rel="canonical">` pointing here, and
the Hashnode-side canonical points here too - so this domain accrues the authority
instead of `*.hashnode.dev`.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint:fix     # eslint --fix
pnpm format       # prettier --write .
```

Run `pnpm lint:fix && pnpm format` before committing.

## Assets

- `public/fonts/` - Gilroy (self-hosted, the brand face)
- `public/backgrounds/` - `grid-dark.svg`, `grid-light.svg`, `black-hole.svg` (404 only)
- `public/icons/` - social + tech logos
- `public/logo.svg` - wordmark, note the trailing dot glyph
