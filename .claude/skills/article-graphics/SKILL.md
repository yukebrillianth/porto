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

## Files

| File                    | What it holds                                                |
| ----------------------- | ------------------------------------------------------------ |
| `scripts/flowchart.mjs` | Primitives: `tokens`, `chip`, `arrow`, `bracket`, `canvas`   |
| `scripts/diagrams.mjs`  | The article's three diagrams, one function each              |
| `scripts/render.mjs`    | Font inlining, Playwright render, Ghost upload, lexical swap |

Diagrams are 1200x675, rendered at `deviceScaleFactor: 2` (2400x1350 output).

## Running it

Playwright and Gilroy live in the main repo, so from a worktree set `NODE_PATH`:

```bash
NODE_PATH=/Users/yukebrillianth/Project/porto/node_modules \
  node .claude/skills/article-graphics/scripts/render.mjs --theme dark
```

| Flag                  | Effect                                               |
| --------------------- | ---------------------------------------------------- |
| `--theme dark\|light` | Which palette. Default `dark`.                       |
| `--upload`            | Push the PNGs to the Ghost CDN.                      |
| `--replace-post <id>` | Swap them into that post's lexical (implies upload). |

PNGs land in `.claude/artifacts/{name}-{theme}.png`. Render without `--upload`
first and look at the files - a diagram that is wrong is faster to catch by eye
than by reading the code.

`--upload` needs `GHOST_ADMIN_KEY` in the environment or in `.env`; it is never
committed. `GHOST_URL` comes from `.env` too, and includes the subdirectory
Ghost is mounted under, so the script appends `/ghost/api/...` to it rather
than assuming the API sits at the domain root.

## Replacing ASCII in a post

`--replace-post` walks the post's lexical and swaps nodes in place:

- **codeblocks** matched on their content (e.g. one containing both
  `pre-stop hook` and `/tmp/drain`) become `image` nodes.
- **existing images** are matched on filename, so re-running after an edit
  updates the `src` rather than adding a duplicate.

That means the command is idempotent - run it as many times as the diagram
needs revising.

## Adding a diagram

Write a function in `diagrams.mjs` that lays out one row of chips and returns
`canvas(body, title, t, grid)`. Use `row(n)` to centre n chips. Then register it
in the `tasks` array in `render.mjs` with a `name`, `alt`, and `caption`, and add
a match rule in the replace block if it is standing in for a codeblock.

## House rules

No em dashes or section signs, in the rendered text or the source. Run
`pnpm lint:fix && pnpm format` before committing.
