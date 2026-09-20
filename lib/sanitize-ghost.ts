import 'server-only';

import { parseHTML } from 'linkedom';

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
            const url = new URL(
              attribute.value,
              'https://yukebrillianth.my.id'
            );
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
      cleanNode(element);
    }
  }

  cleanNode(document.body);
  return document.body.innerHTML;
}
