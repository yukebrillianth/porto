import 'server-only';

import { parseHTML } from 'linkedom';

import { siteConfig } from '@/constants';

const ALLOWED_TAGS = new Set([
  'a',
  'article',
  'audio',
  'blockquote',
  'br',
  'button',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'source',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'track',
  'ul',
  'video',
]);

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SITE_ORIGIN = siteConfig.url;
const ALLOWED_ATTRIBUTES = new Set([
  'allow',
  'allowfullscreen',
  'alt',
  'aria-expanded',
  'aria-label',
  'class',
  'controls',
  'data-kg-toggle',
  'frameborder',
  'height',
  'href',
  'id',
  'loading',
  'max',
  'min',
  'poster',
  'preload',
  'rel',
  'sizes',
  'src',
  'srcset',
  'step',
  'target',
  'title',
  'type',
  'value',
  'width',
]);

/** Sanitize Ghost's rendered HTML while preserving Koenig card markup. */
export function sanitizeGhostHtml(html: string): string {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);

  function cleanNode(node: Element | Document) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 8) {
        child.remove();
        continue;
      }

      if (child.nodeType !== 1) continue;
      const element = child as Element;
      const tag = element.tagName.toLowerCase();

      if (
        !ALLOWED_TAGS.has(tag) ||
        tag === 'script' ||
        tag === 'style' ||
        tag === 'form'
      ) {
        const parent = element.parentNode;
        if (!parent) continue;
        while (element.firstChild)
          parent.insertBefore(element.firstChild, element);
        parent.removeChild(element);
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (!ALLOWED_ATTRIBUTES.has(name) || name.startsWith('on')) {
          element.removeAttribute(attribute.name);
          continue;
        }

        if (name === 'href' || name === 'src' || name === 'poster') {
          try {
            const url = new URL(attribute.value, SITE_ORIGIN);
            if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
              element.removeAttribute(attribute.name);
            }
          } catch {
            element.removeAttribute(attribute.name);
          }
        }
      }

      if (element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }

      if (tag === 'a') normalizeLink(element);
      cleanNode(element);
    }
  }

  cleanNode(document.body);
  return document.body.innerHTML;
}

/**
 * Ghost rewrites every link with `?ref=<ghost-host>` when outbound link tagging
 * is on. These posts render on our own domain, so that parameter both misreports
 * the referrer and turns internal links into off-site-looking URLs. Strip it,
 * rewrite links back to our origin as relative paths so they stay same-origin,
 * and mark genuinely external links.
 */
function normalizeLink(anchor: Element) {
  const href = anchor.getAttribute('href');
  if (!href) return;

  let url: URL;
  try {
    url = new URL(href, SITE_ORIGIN);
  } catch {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  url.searchParams.delete('ref');
  const query = url.searchParams.toString();

  if (url.origin === SITE_ORIGIN) {
    anchor.setAttribute(
      'href',
      `${url.pathname}${query ? `?${query}` : ''}${url.hash}`
    );
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
    return;
  }

  anchor.setAttribute('href', url.toString());
  anchor.setAttribute('target', '_blank');
  anchor.setAttribute('rel', 'noopener noreferrer');
}
