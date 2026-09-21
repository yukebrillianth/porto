---
name: blog-thumbnail
description: Generate minimalist, high-end blog article thumbnails from portfolio design tokens and Ghost CMS data. Supports multiple sizes (og, portrait, square, wide), formats (png, jpg, webp), and automated compression. Triggers on "generate thumbnail", "buat thumbnail", "blog thumbnail", "thumbnail artikel".
---

# Blog Article Thumbnail Generator

Generate high-end technical article thumbnails using the portfolio's visual design
tokens (`#121212`, `--color-primary: #FF9800`, `--color-surface: #1D1D1D`,
`--color-surface-deep: #101010`, Gilroy typography, conic glow, and hairline grid).

Thumbnails support multiple layouts with technical vector diagrams, brand glyphs,
and modern frosted author capsules (`avatar + @yukebrillianth / yukebrillianth.com`).

## Quick Start

Run the generator script directly with Node:

```bash
# Fetch post data from Ghost CMS by slug
node .claude/skills/blog-thumbnail/scripts/render.mjs --slug <slug>

# Full manual override (no Ghost connection required)
node .claude/skills/blog-thumbnail/scripts/render.mjs \
  --title "HTTP Load Balancing dengan NginX" \
  --category "Back End" \
  --brief "Membagi trafik ke beberapa server upstream." \
  --read-time 7 \
  --variant carousel \
  --size og,portrait \
  --format png,webp \
  --compress
```

## Content Resolution

Content can be pulled from self-hosted Ghost CMS or specified manually:

- `--slug <slug>`: Pulls title, custom excerpt, series tag, and reading time from
  Ghost REST API (`{GHOST_URL}/ghost/api/content/posts/slug/{slug}/`).
- Command-line flags override Ghost values. If Ghost is unreachable or unconfigured,
  the script falls back to manual arguments without crashing.

### Available Content Flags

| Flag             | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| `--title`        | Article headline (required if no slug). Handled by font-fitter.                        |
| `--brief`        | Supporting summary or subtitle.                                                        |
| `--category`     | Eyebrow chip text (e.g. `Back End`, `Robotics`, `DevOps`).                             |
| `--badge`        | Secondary badge text (e.g. `01 // DEEP DIVE`).                                         |
| `--read-time`    | Integer minutes, rendered as a frosted clock pill.                                     |
| `--author`       | Author name in capsule (default: `Yuke Brilliant`).                                    |
| `--handle`       | Social handle (default: `@yukebrillianth`).                                            |
| `--site`         | Domain label (default: `yukebrillianth.com`).                                          |
| `--icon`         | Tech logo or line glyph name (auto-detected if omitted).                               |
| `--diagram`      | Generic vector diagram motif (auto-detected if omitted).                               |
| `--diagram-file` | Path to a bespoke diagram module authored for this one article. Overrides `--diagram`. |
| `--theme`        | Canvas theme: `dark` (default) or `light` (maps minimal to minimal-light).             |
| `--highlight`    | Target keyword for neon yellow stabilo marker effect.                                  |

## Design Variants

| Variant         | Characteristics                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `signature`     | Brand-forward 2-column layout with conic orb and wireframe diagram.                                                                  |
| `carousel`      | High-impact slide card with category badge, bold title, and CTA.                                                                     |
| `minimal`       | Solid minimalist dark (`#121212`). Bold headline with stabilo, diagram, category tag, left logo & right read time.                   |
| `minimal-light` | Solid minimalist light (`#F8F9FA`). High-contrast paper, dark bold headline with stabilo, diagram, tag, left logo & right read time. |
| `glass`         | Deep frosted backdrop-filter panel with luminous orange glow.                                                                        |
| `terminal`      | Dark developer console with colored status dots and live glyphs.                                                                     |
| `spotlight`     | Radial orange wash behind the display title with balanced graphic.                                                                   |
| `editorial`     | Clean typographic layout with subtle branding and technical icon.                                                                    |

Pass `--all-variants` to generate all variants simultaneously for previewing.

## Diagram Motifs

Vector diagrams render on a scalable 480x360 SVG canvas.

### Bespoke diagrams (preferred)

The seven motifs below are generic shapes: they say "this post is about a
pipeline", not what the pipeline actually does. **For a real article, read the
post first and author a diagram module that draws its actual argument.**

```bash
node .claude/skills/blog-thumbnail/scripts/render.mjs \
  --slug my-post --diagram-file .claude/skills/blog-thumbnail/diagrams/my-post.mjs
```

The module default-exports `(data, theme, primitives) => svgString`. The
`primitives` kit (`svg`, `chip`, `node`, `wire`, `glyphTile`, `techLogo`,
`iconSvg`, `esc`, `W`, `H`) keeps the visual language identical while the
content is free. Brand logos come from `techLogo(name, { size, color })`, which
resolves any of the 3400+ Simple Icons brands and injects the official hex.
Pass `theme` through: a light canvas needs different ink than a dark one.
The module is re-imported on every render, so edit and re-run to iterate.

See `diagrams/zero-downtime-deployment-dengan-docker-rollout.mjs` for a worked
example: two aligned timelines contrasting the 502 gap of `compose up -d`
against the overlap of `docker rollout`.

### Generic fallbacks

- `fanout`: One-to-many architecture (load balancing, gateways, ingress).
- `pipeline`: Stage-by-stage workflow (CI/CD, ETL, data pipelines).
- `stack`: Layered architecture (UI / Service / Database, OSI layers).
- `mesh`: Decentralized peer clusters (Raft, gossip, distributed consensus).
- `cycle`: Client-server request and response loops.
- `trace`: Performance, latency curves, and benchmark metrics.
- `console`: Interactive terminal window with colored command outputs.
- `none`: Suppresses the diagram to give full width to the title.

Pass `--diagram <name>` to override auto-detection.

## Canvas Sizes and Formats

### Supported Aspect Ratios

- `og`: 1200x630 (Open Graph, Twitter card, Ghost feature image).
- `portrait`: 1080x1350 (Instagram and LinkedIn 4:5 portrait).
- `square`: 1080x1080 (1:1 feed square).
- `wide`: 1920x1080 (16:9 full HD for YouTube or presentations).

### Export Formats and Compression

- Formats: `--format png`, `--format jpg`, or `--format webp`.
- Quality: `--quality <1-100>` (default: `88` for JPEG/WebP).
- Compression: Pass `--compress` to automatically walk down quality or re-encode
  lossless PNG to JPEG to fit within social media and CMS upload budgets
  (PNG < 900 KB, JPG < 300 KB, WebP < 220 KB).

## Verification and Safety

- Inlines all brand fonts (`Gilroy-*.woff2`), logos, and icons as base64 or SVG
  data URIs to guarantee offline rendering consistency without network races.
- Automatic font-fitter script prevents title truncation on any screen size.
- Prettier and ESLint compliant. Conforms strictly to portfolio house rules (no em
  dashes or section signs).
