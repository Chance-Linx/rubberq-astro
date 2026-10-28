import legacyMaterialRedirects from '../data/legacy-material-redirects.json' with { type: 'json' };

const materialRedirects: Record<string, string> = legacyMaterialRedirects;

/** Resolve reviewed internal aliases without changing external URLs or link text. */
function canonicalArticleHref(href: string): string {
  if (!href.startsWith('/') && !/^https?:\/\//i.test(href)) return href;
  try {
    const url = new URL(href, 'https://rubberq.com');
    if (!['http:', 'https:'].includes(url.protocol) ||
        !['rubberq.com', 'www.rubberq.com'].includes(url.host)) return href;
    const target = materialRedirects[url.pathname.replace(/\/+$/, '')];
    return target ? `${target}${url.search}${url.hash}` : href;
  } catch {
    return href;
  }
}

/** Apply aliases after rendering HTML, Markdown or Portable Text from the CMS. */
export function normalizeArticleLinks(html: string): string {
  return html.replace(/<a\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi, (tag) =>
    tag.replace(/(\s+)([^\s"'<>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g,
      (attribute, space, name, equals, doubleQuoted, singleQuoted, unquoted) => {
        if (name.toLowerCase() !== 'href') return attribute;
        const href = doubleQuoted ?? singleQuoted ?? unquoted;
        const target = canonicalArticleHref(href);
        if (target === href) return attribute;
        const quote = doubleQuoted !== undefined ? '"' : singleQuoted !== undefined ? "'" : '"';
        return `${space}${name}${equals}${quote}${target}${quote}`;
      }));
}
