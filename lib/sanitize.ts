/**
 * DOM-based HTML sanitizer with allowlisted tags and attributes.
 * Prevents XSS attacks by stripping dangerous elements and attributes.
 *
 * @example
 * const clean = sanitizeHtml(dirtyHtml);
 * <div dangerouslySetInnerHTML={{ __html: clean }} />
 */

const TAGS_ALLOWED = new Set([
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'span',
  'div',
]);

const ATTRS_ALLOWED: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  '*': new Set(['class', 'title']),
};

const EVENT_HANDLER_PREFIX = 'on';
const PROTOCOLS_ALLOWED = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const CSS_DANGEROUS_PATTERNS = [
  /expression\s*\(/i,
  /url\s*\(\s*['"]?\s*javascript/i,
  /url\s*\(\s*['"]?\s*data:/i,
  /behavior\s*:/i,
  /-moz-binding\s*:/i,
  /@import/i,
];

export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return '';

  const doc = new DOMParser().parseFromString(dirty, 'text/html');

  function isEventHandler(name: string): boolean {
    return name.toLowerCase().startsWith(EVENT_HANDLER_PREFIX);
  }

  function hasDangerousCss(value: string): boolean {
    return CSS_DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
  }

  function walk(node: Node) {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (
        child.nodeType === Node.COMMENT_NODE ||
        child.nodeType === Node.PROCESSING_INSTRUCTION_NODE
      ) {
        node.removeChild(child);
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        const tag = el.tagName.toLowerCase();

        if (!TAGS_ALLOWED.has(tag)) {
          const fragment = document.createDocumentFragment();
          while (el.firstChild) fragment.appendChild(el.firstChild);
          node.replaceChild(fragment, el);
          continue;
        }

        const allowed = new Set([
          ...(ATTRS_ALLOWED['*'] || []),
          ...(ATTRS_ALLOWED[tag] || []),
        ]);

        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();

          if (isEventHandler(name)) {
            el.removeAttribute(attr.name);
            continue;
          }

          if (!allowed.has(name)) {
            el.removeAttribute(attr.name);
            continue;
          }

          if (name === 'style' && hasDangerousCss(attr.value)) {
            el.removeAttribute(attr.name);
            continue;
          }

          if (name === 'href' || name === 'src') {
            try {
              const url = new URL(attr.value, window.location.origin);
              if (!PROTOCOLS_ALLOWED.has(url.protocol)) {
                el.removeAttribute(attr.name);
              }
            } catch {
              const trimmed = attr.value.trim();
              if (
                trimmed.startsWith('javascript:') ||
                trimmed.startsWith('vbscript:') ||
                trimmed.startsWith('data:')
              ) {
                el.removeAttribute(attr.name);
              } else if (
                !trimmed.startsWith('/') &&
                !trimmed.startsWith('#') &&
                !trimmed.startsWith('?')
              ) {
                el.removeAttribute(attr.name);
              }
            }
          }

          if (name === 'target' && attr.value === '_blank') {
            el.setAttribute('rel', 'noopener noreferrer');
          }
        }

        walk(child);
      }
    }
  }

  walk(doc.body);
  return doc.body.innerHTML;
}
