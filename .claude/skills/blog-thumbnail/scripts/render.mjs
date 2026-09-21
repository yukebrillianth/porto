#!/usr/bin/env node
/**
 * Renders blog thumbnails from the portfolio's design tokens.
 *
 * Content comes from Ghost when a slug resolves; every field can be overridden
 * on the command line, and an unreachable Ghost degrades to manual input
 * rather than failing.
 *
 * Rendering is Playwright + Chromium (already a devDependency) rather than
 * Satori, because Satori cannot read the woff2 files Gilroy ships as, and
 * cannot do the backdrop-filter the glass variant needs.
 *
 * Usage:
 *   node render.mjs --slug my-post
 *   node render.mjs --title "..." --variant glass --format jpg --quality 82
 *   node render.mjs --slug my-post --all-variants --size og,portrait
 */

import { mkdir, writeFile, readFile, stat, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { customDiagramSvg } from './diagrams.mjs';
import { fetchPost, isGhostConfigured } from './ghost.mjs';
import { renderHtml, VARIANTS, VARIANT_NOTES } from './templates.mjs';

/* ==========================================================================
   Canvases
   ========================================================================== */

const SIZES = {
  og: {
    width: 1200,
    height: 630,
    note: 'Open Graph, Twitter, Ghost feature image',
  },
  portrait: {
    width: 1080,
    height: 1350,
    note: 'Instagram and LinkedIn portrait 4:5',
  },
  square: { width: 1080, height: 1080, note: 'Instagram feed' },
  wide: { width: 1920, height: 1080, note: '16:9, YouTube and slides' },
};

const DEFAULT_SIZES = ['og', 'portrait'];
const DEFAULT_VARIANT = 'signature';

/** Ceilings before the compressor starts trying harder. Ghost caps uploads. */
const BUDGET_BYTES = {
  png: 900_000,
  jpg: 300_000,
  jpeg: 300_000,
  webp: 220_000,
};

/* ==========================================================================
   Arguments
   ========================================================================== */

function parseArgs(argv) {
  const args = { _: [] };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const [flag, inline] = token.slice(2).split(/=(.*)/s);
    const next = argv[i + 1];

    if (inline !== undefined) {
      args[flag] = inline;
    } else if (next !== undefined && !next.startsWith('--')) {
      args[flag] = next;
      i++;
    } else {
      args[flag] = true;
    }
  }

  return args;
}

function list(value, fallback) {
  if (value === undefined || value === true) return fallback;

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function usage() {
  const sizes = Object.entries(SIZES)
    .map(
      ([key, { width, height, note }]) =>
        `    ${key.padEnd(9)} ${`${width}x${height}`.padEnd(10)} ${note}`
    )
    .join('\n');

  const variants = VARIANTS.map(
    (name) => `    ${name.padEnd(11)} ${VARIANT_NOTES[name]}`
  ).join('\n');

  return `Generate blog thumbnails from the portfolio design tokens.

  Content
    --slug <slug>        Pull title, category and read time from Ghost
    --title <text>       Override the title (required when there is no slug)
    --brief <text>       Override the supporting line
    --category <text>    Override the eyebrow / chip text
    --badge <text>       Text for the badge / pill
    --author <name>      Name in the footer capsule
    --handle <handle>    Social handle (default: @yukebrillianth)
    --site <domain>      Site URL (default: yukebrillianth.com)
    --read-time <n>      Minutes, as an integer
    --date <text>        Free text, rendered as-is
    --icon <name>        Icon or tech logo (auto-detected if omitted)
    --diagram <name>     Diagram motif: fanout, pipeline, stack, mesh, cycle, trace, console, none, auto
    --diagram-file <p>   Path to a bespoke diagram module, authored for this one article.
                         Default-exports (data, theme, primitives) => svg string.
                         Overrides --diagram.
    --highlight <text>   Word or phrase to highlight with a stabilo marker effect

  Output
    --variant <name>     Default: ${DEFAULT_VARIANT} (e.g. minimal, minimal-light, carousel, signature)
    --theme <theme>      dark | light (maps minimal to minimal-light)
    --all-variants       Render every variant, for comparison
    --size <list>        Default: ${DEFAULT_SIZES.join(',')}
    --format <list>      png | jpg | webp. Default: png
    --quality <n>        1-100 for jpg and webp. Default: 88
    --compress           Shrink until the size budget is met
    --out <dir>          Default: thumbnails/
    --dry-run            Write the HTML only, skip the browser

  Variants
${variants}

  Sizes
${sizes}
`;
}

/* ==========================================================================
   Content
   ========================================================================== */

/**
 * Ghost supplies the defaults; explicit flags always win. A flag passed
 * without a value parses as boolean `true`, which would render as the string
 * "true", so those are discarded.
 */
function override(flagValue, fallback) {
  if (flagValue === undefined || flagValue === true) return fallback;

  return flagValue;
}

async function resolveContent(args) {
  const slug = typeof args.slug === 'string' ? args.slug : null;
  let post = null;

  if (slug) {
    if (!isGhostConfigured()) {
      process.stderr.write(
        'GHOST_URL / GHOST_CONTENT_KEY not set; using manual fields.\n'
      );
    } else {
      post = await fetchPost(slug);

      if (post) process.stderr.write(`Loaded "${post.title}" from Ghost.\n`);
    }
  }

  const readTimeRaw = override(args['read-time'], post?.readTime ?? null);
  const readTime = readTimeRaw
    ? Number.parseInt(readTimeRaw, 10) || null
    : null;

  const data = {
    slug,
    title: override(args.title, post?.title ?? ''),
    brief: override(args.brief, post?.brief ?? ''),
    category: override(args.category, post?.category ?? null),
    badge: override(args.badge, null),
    author: override(args.author, null),
    handle: override(args.handle, null),
    site: override(args.site, null),
    date: override(args.date, null),
    icon: override(args.icon, null),
    diagram: override(args.diagram, null),
    highlight: override(args.highlight, null),
    diagramFile: override(args['diagram-file'], null),
    readTime,
  };

  if (!data.title) {
    throw new Error(
      slug
        ? `No title: Ghost had nothing for "${slug}". Pass --title explicitly.`
        : 'Nothing to render. Pass --title or --slug.'
    );
  }

  return data;
}

/* ==========================================================================
   Rendering
   ========================================================================== */

function safeName(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'thumbnail'
  );
}

/**
 * Chromium screenshots PNG and JPEG natively. WebP is transcoded afterwards
 * with `cwebp` when it is on PATH; without it, the PNG is kept and the caller
 * is told why.
 */
async function encode(page, target, format, quality) {
  if (format === 'webp') {
    const png = `${target}.tmp.png`;

    await page.screenshot({ path: png, type: 'png' });

    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);

    try {
      await run('cwebp', ['-quiet', '-q', String(quality), png, '-o', target]);
      await unlink(png);
    } catch {
      await writeFile(target.replace(/\.webp$/, '.png'), await readFile(png));
      await unlink(png);

      return { fallback: 'png', reason: 'cwebp not found on PATH' };
    }

    return {};
  }

  await page.screenshot({
    path: target,
    type: format === 'jpg' ? 'jpeg' : format,
    ...(format === 'jpg' || format === 'jpeg' ? { quality } : {}),
  });

  return {};
}

/**
 * Walks quality down in steps until the file fits its budget. Lossless PNG
 * has no quality dial, so it is re-encoded as JPEG at the same dimensions -
 * a thumbnail is a photograph of type, and JPEG is fine for that.
 */
async function compress(page, target, format, quality, budget) {
  let current = (await stat(target)).size;

  if (current <= budget) return { bytes: current, quality, format };

  if (format === 'png') {
    const jpg = target.replace(/\.png$/, '.jpg');

    for (const q of [88, 78, 68, 58]) {
      await page.screenshot({ path: jpg, type: 'jpeg', quality: q });
      current = (await stat(jpg)).size;

      if (current <= budget) {
        await unlink(target);

        return {
          bytes: current,
          quality: q,
          format: 'jpg',
          path: jpg,
          converted: true,
        };
      }
    }

    await unlink(jpg).catch(() => {});

    return {
      bytes: (await stat(target)).size,
      quality,
      format,
      overBudget: true,
    };
  }

  for (const q of [78, 68, 58, 48]) {
    if (q >= quality) continue;

    await encode(page, target, format, q);
    current = (await stat(target)).size;

    if (current <= budget) return { bytes: current, quality: q, format };
  }

  return { bytes: current, quality, format, overBudget: true };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/* ==========================================================================
   Main
   ========================================================================== */

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    process.stdout.write(usage());

    return;
  }

  const data = await resolveContent(args);

  let requestedVariants = list(args.variant, [DEFAULT_VARIANT]);
  if (args.theme === 'light') {
    requestedVariants = requestedVariants.map((v) =>
      v === 'minimal' ? 'minimal-light' : v
    );
  }
  const variants = args['all-variants'] ? VARIANTS : requestedVariants;
  const sizeKeys = list(args.size, DEFAULT_SIZES);
  const formats = list(args.format, ['png']).map((f) => f.toLowerCase());
  const quality = Number.parseInt(override(args.quality, '88'), 10) || 88;
  const outDir = resolve(process.cwd(), override(args.out, 'thumbnails'));

  for (const name of variants) {
    if (!VARIANTS.includes(name)) {
      throw new Error(
        `Unknown variant "${name}". Available: ${VARIANTS.join(', ')}`
      );
    }
  }

  for (const key of sizeKeys) {
    if (!SIZES[key]) {
      throw new Error(
        `Unknown size "${key}". Available: ${Object.keys(SIZES).join(', ')}`
      );
    }
  }

  for (const format of formats) {
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(format)) {
      throw new Error(`Unknown format "${format}". Use png, jpg or webp.`);
    }
  }

  await mkdir(outDir, { recursive: true });

  const base = safeName(data.slug ?? data.title);
  const jobs = [];

  for (const variant of variants) {
    // A bespoke diagram is authored per article, and it has to be resolved per
    // variant because a light canvas needs different ink than a dark one.
    let customDiagram = null;

    if (data.diagramFile) {
      const theme = variant.endsWith('-light') ? 'light' : 'dark';

      customDiagram = await customDiagramSvg(data.diagramFile, data, theme);
    }

    for (const sizeKey of sizeKeys) {
      const { width, height } = SIZES[sizeKey];
      const html = renderHtml(
        variant,
        { ...data, customDiagram },
        width,
        height
      );
      const stem = `${base}-${variant}-${sizeKey}`;

      jobs.push({ variant, sizeKey, width, height, html, stem });
    }
  }

  if (args['dry-run']) {
    for (const job of jobs) {
      const path = join(outDir, `${job.stem}.html`);

      await writeFile(path, job.html, 'utf8');
      process.stdout.write(`${path}\n`);
    }

    return;
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const written = [];

  try {
    for (const job of jobs) {
      const page = await browser.newPage({
        viewport: { width: job.width, height: job.height },
        deviceScaleFactor: 1,
      });

      await page.setContent(job.html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // The fitter runs on `fonts.ready` too, and that promise may already have
      // settled before the listener attached. Re-running it is idempotent.
      await page.evaluate(() => window.__fit?.());

      for (const format of formats) {
        const ext = format === 'jpeg' ? 'jpg' : format;
        let target = join(outDir, `${job.stem}.${ext}`);

        const result = await encode(page, target, format, quality);

        if (result.fallback) {
          target = target.replace(/\.webp$/, '.png');
          process.stderr.write(
            `  webp unavailable (${result.reason}); wrote PNG instead.\n`
          );
        }

        let bytes = (await stat(target)).size;
        let note = '';

        if (args.compress) {
          const budget = BUDGET_BYTES[format] ?? BUDGET_BYTES.png;
          const outcome = await compress(page, target, ext, quality, budget);

          bytes = outcome.bytes;

          if (outcome.path) target = outcome.path;
          if (outcome.converted) note = ' (converted to jpg to meet budget)';
          if (outcome.overBudget) note = ' (over budget, kept best effort)';
          else if (outcome.quality !== quality)
            note = ` (quality ${outcome.quality})`;
        }

        written.push({ path: target, bytes, note });
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  for (const file of written) {
    process.stdout.write(`${file.path}  ${kb(file.bytes)}${file.note}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
