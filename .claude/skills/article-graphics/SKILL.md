---
name: article-graphics
description: Render flat flowchart diagrams for blog articles in the site's own visual language - hairline chips, one accent colour, lowercase labels - then upload to the Ghost CDN and swap them into a post's lexical in place of ASCII codeblocks. Use when an article needs diagrams, or when existing diagrams read as "AI slop".
---

# Article graphics

Diagrams for the blog, in the same visual language as the site's thumbnails.

## The house style

Read `thumbnails/*-signature-og.html` before changing anything. The vocabulary
there is small on purpose:

- **One accent colour.** `#FF9800`, and nothing else. No red/amber/green status
  pills, no per-state colour coding. If three things are coloured, the reader
  has to decode a legend instead of reading a flow.
- **Hairline strokes.** `stroke-width: 1.4`, `rgba(...,0.16)` edges. Chips are
  outlined, never filled. A filled box reads as a badge and competes for
  attention.
- **One layer of containment.** A chip sits on the canvas. It does not sit
  inside a card that sits on a canvas - nesting is what makes a diagram look
  busy and generated.
- **Lowercase, short labels.** `edge`, `node a`, `web-1`. A label that needs a
  sentence belongs in the caption or the prose, not in the box.
- **Solid background, faint grid.** `#121212` / `#F8F9FA` with the grid at
  0.035-0.05 opacity. No gradients, no glow, no blurred orbs.

If a diagram needs more than this to be legible, the diagram is doing too much.
Split it or drop it.

## How a diagram gets made

Diagrams are **data, not drawings**. Nothing here is a static template: you read
the ASCII block (or the prose around it) in the article, work out what the flow
actually is, and write that down as a spec. The renderer draws it.

```text
ASCII block in the post
   |  read it, work out the actual flow
spec in diagrams/<slug>.mjs
   |  flowHtml() lays out chips, wires, brackets
HTML at 1200x675
   |  Playwright, deviceScaleFactor 2
PNG at 2400x1350
   |  upload, then swap the codeblock for an image card
the post
```

So when an article needs a diagram for a section, go and look at what that
section says. Two chips where the prose describes two states; a bracket where it
describes a window of time; an accent on the one thing the reader should take
away. The spec is the thinking; the renderer is mechanical.

## Files

| File                    | What it holds                                                |
| ----------------------- | ------------------------------------------------------------ |
| `scripts/flowchart.mjs` | Primitives: `tokens`, `chip`, `arrow`, `bracket`, `canvas`   |
| `scripts/diagrams.mjs`  | Generic renderer: `flowHtml(spec, theme, grid, fonts)`       |
| `scripts/render.mjs`    | Font inlining, Playwright render, Ghost upload, lexical swap |
| `diagrams/<slug>.mjs`   | One article's diagram specs. Pure data.                      |

Diagrams render at 1200x675, `deviceScaleFactor: 2`, so 2400x1350 out.

## Writing a spec

A spec file exports the post id and a list of diagrams:

```js
export const post = '<ghost-post-id>';

export const diagrams = [
  {
    name: 'downtime-timeline',
    alt: 'Anatomi downtime docker compose up -d',
    caption: 'Caption Ghost shows under the image',
    /* The codeblock this stands in for: all strings must appear in it. */
    match: ['docker compose up -d web', 'DOWNTIME'],
    spec: {
      title: 'Kenapa docker compose up -d bikin downtime',
      columns: [
        { chips: [{ label: 'up -d', sub: 'perintah jalan' }] },
        { chips: [{ label: 'stop', sub: 'port tertutup', accent: true }] },
        { chips: [{ label: 'healthy', sub: 'melayani lagi' }] },
      ],
      span: { from: 1, to: 1, label: 'downtime, request kena 502' },
    },
  },
];
```

| Field               | Meaning                                                             |
| :------------------ | :------------------------------------------------------------------ |
| `columns[].chips`   | One chip reads as one step; two stack to show two things coexisting |
| `chips[].accent`    | The one thing the reader should take away. Use it sparingly         |
| `chips[].dim`       | Something on its way out (the old container during a rollout)       |
| `columns[].caption` | A label under the column: `sebelum`, `saat rollout`, `sesudah`      |
| `span`              | A dashed bracket over columns `from`..`to`, for a window of time    |
| `note`              | One line of prose under the flow                                    |

## Running it

Playwright and Gilroy live in the main repo, so from a worktree set `NODE_PATH`:

```bash
NODE_PATH=/Users/yukebrillianth/Project/porto/node_modules \
  node .claude/skills/article-graphics/scripts/render.mjs \
  --article zero-downtime-deployment-dengan-docker-rollout
```

| Flag                  | Effect                                        |
| --------------------- | --------------------------------------------- |
| `--article <slug>`    | Which spec file to render. Required.          |
| `--theme dark\|light` | Which palette. Default `dark`.                |
| `--upload`            | Push the PNGs to the Ghost CDN.               |
| `--replace`           | Swap them into the post id named in the spec. |
| `--replace-post <id>` | Same, but for a different post.               |

PNGs land in `.claude/artifacts/{name}-{theme}.png`. **Render without `--upload`
first and look at the files** - a diagram that is wrong is much faster to catch
by eye than by reading the spec.

`--upload` needs `GHOST_ADMIN_KEY` in the environment or in `.env`; it is never
committed. `GHOST_URL` comes from `.env` too and includes the subdirectory Ghost
is mounted under, so the script appends `/ghost/api/...` to it rather than
assuming the API sits at the domain root.

## Swapping into a post

The replace step walks the post's lexical and swaps nodes in place:

- **codeblocks** whose content contains every string in `match` become image
  cards, set to `cardWidth: 'wide'`.
- **existing images** are matched on the diagram `name` in their filename, so
  re-running after an edit updates the `src` rather than adding a duplicate.

That makes it idempotent - run it as many times as the diagram needs revising.

## House rules

No em dashes or section signs, in the rendered text or the source. Run
`pnpm lint:fix && pnpm format` before committing.
