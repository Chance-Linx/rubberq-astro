import { createElement as h, Fragment, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type PortableNode = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
  children?: PortableNode[];
  markDefs?: (PortableNode & { href?: string })[];
  style?: string;
  listItem?: string;
  level?: number;
  href?: string;
  url?: string;
  alt?: string;
  caption?: string;
  asset?: { _ref?: string; url?: string };
};

// Only navigation and web image URLs are emitted from structured/Markdown content.
function safeUrl(value: string | undefined, image = false): string | undefined {
  if (!value) return undefined;
  const url = value.trim();
  const scheme = url.replace(/[\u0000-\u0020\u007f]/g, '').match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase();
  if (scheme && !(image ? ['http', 'https'] : ['http', 'https', 'mailto', 'tel']).includes(scheme)) return undefined;
  return url;
}

function portableChildren(block: PortableNode): ReactNode[] {
  return (block.children || []).map((span, index) => {
    if (span._type !== 'span' || typeof span.text !== 'string') return null;
    let text: ReactNode = span.text.split('\n').flatMap((line, i) => i ? [h('br', { key: `br-${i}` }), line] : [line]);
    for (const mark of span.marks || []) {
      const tag = { strong: 'strong', em: 'em', code: 'code', underline: 'u', 'strike-through': 's' }[mark];
      if (tag) text = h(tag, null, text);
      else {
        const definition = block.markDefs?.find((item) => item._key === mark && item._type === 'link');
        const href = safeUrl(definition?.href);
        if (href) text = h('a', { href }, text);
      }
    }
    return h(Fragment, { key: span._key || index }, text);
  });
}

function portableImage(node: PortableNode, key: string | number): ReactNode {
  const match = node.asset?._ref?.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-zA-Z0-9]+)$/);
  const src = safeUrl(node.asset?.url || node.url || (match ? `https://cdn.sanity.io/images/tcjl4afv/production/${match[1]}-${match[2]}.${match[3]}` : undefined), true);
  if (!src) return null;
  return h('figure', { key }, h('img', { src, alt: node.alt || '', loading: 'lazy' }), node.caption ? h('figcaption', null, node.caption) : null);
}

function portableBlocks(nodes: PortableNode[]): ReactNode[] {
  const output: ReactNode[] = [];
  let index = 0;
  // Recursion keeps nested list items inside their preceding parent <li>.
  function list(level: number, kind: string): ReactNode {
    const items: ReactNode[] = [];
    while (index < nodes.length) {
      const node = nodes[index];
      if (!node || node._type !== 'block' || !node.listItem || Math.max(1, node.level || 1) < level) break;
      if (Math.max(1, node.level || 1) === level && node.listItem !== kind) break;
      index++;
      const children = portableChildren(node);
      while (index < nodes.length && nodes[index]?._type === 'block' && nodes[index].listItem && Math.max(1, nodes[index].level || 1) > level) {
        children.push(list(Math.max(1, nodes[index].level || 1), nodes[index].listItem!));
      }
      items.push(h('li', { key: node._key || index }, children));
    }
    return h(kind === 'number' ? 'ol' : 'ul', { key: `list-${index}` }, items);
  }
  while (index < nodes.length) {
    const node = nodes[index];
    if (!node || typeof node !== 'object') { index++; continue; }
    if (node._type === 'block' && node.listItem) {
      output.push(list(Math.max(1, node.level || 1), node.listItem));
      continue;
    }
    index++;
    if (node._type === 'image') output.push(portableImage(node, node._key || index));
    else if (node._type === 'block') {
      const style = node.style === 'h1' ? 'h2' : node.style;
      const tag = style && /^(h[2-6]|blockquote)$/.test(style) ? style : 'p';
      output.push(h(tag, { key: node._key || index }, portableChildren(node)));
    }
  }
  return output;
}

/** Normalize the three article.content formats already stored in Sanity. */
export function renderArticleContent(content: unknown): string {
  if (Array.isArray(content)) return renderToStaticMarkup(h(Fragment, null, portableBlocks(content)));
  if (typeof content !== 'string' || !content.trim()) return '';
  // Inspect actual Markdown nodes outside raw HTML blocks, regardless of their
  // position. This handles HTML-first and prose-first mixed documents without
  // mistaking literal Markdown punctuation inside an HTML block for formatting.
  let hasMarkdown = false;
  const markdownTypes = new Set(['heading', 'list', 'strong', 'emphasis', 'delete', 'link', 'linkReference', 'image', 'imageReference', 'code', 'inlineCode', 'blockquote', 'thematicBreak', 'table', 'break']);
  function inspectMarkdown() {
    return function visit(node: { type: string; children?: { type: string }[] }) {
      if (markdownTypes.has(node.type)) hasMarkdown = true;
      node.children?.forEach(visit);
    };
  }
  const rendered = renderToStaticMarkup(h(ReactMarkdown, {
    remarkPlugins: [remarkGfm, inspectMarkdown],
    rehypePlugins: [rehypeRaw],
    allowedElements: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'section', 'figure', 'figcaption', 'span', 'sup', 'sub'],
    urlTransform: (url, key) => safeUrl(url, key === 'src') || '',
    components: {
      h1: ({ children }) => h('h2', null, children),
      a: ({ children, href }) => h('a', { href: safeUrl(href) }, children),
      img: ({ src, alt }) => safeUrl(src, true) ? h('img', { src: safeUrl(src, true), alt: alt || '', loading: 'lazy' }) : null,
    },
    children: content,
  }));
  // Existing publisher-authored HTML retains its exact established output.
  return !hasMarkdown && /<\/?[a-z][\w:-]*(?:\s[^<>]*)?>/i.test(content) ? content : rendered;
}
