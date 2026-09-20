import 'server-only';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);

const LANGUAGE_ALIASES: Record<string, string> = {
  bash: 'shell',
  javascript: 'javascript',
  js: 'javascript',
  json: 'javascript',
  sh: 'shell',
  shell: 'shell',
  text: 'plaintext',
  ts: 'typescript',
  typescript: 'typescript',
  xml: 'xml',
  html: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** Highlight one Ghost code block with a small, server-only language bundle. */
export function highlightCode(code: string, language: string): string {
  const normalized =
    LANGUAGE_ALIASES[language.toLowerCase()] ?? language.toLowerCase();

  if (!hljs.getLanguage(normalized)) return escapeHtml(code);

  try {
    return hljs.highlight(code, {
      language: normalized,
      ignoreIllegals: true,
    }).value;
  } catch {
    return escapeHtml(code);
  }
}
