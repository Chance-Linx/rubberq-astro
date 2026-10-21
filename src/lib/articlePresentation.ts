import media from '../data/article-media.json' with { type: 'json' };

/** Hide only the exact article/asset pair reviewed; a replacement is a new decision. */
export function isArticleCoverSuppressed(articleId: string, assetRef?: string): boolean {
  return media.suppressed.some((item) => item.articleId === articleId && item.assetRef === assetRef);
}

/** Keep table semantics and cells intact while containing horizontal scrolling. */
export function makeArticleTablesScrollable(html: string): string {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table\s*>/gi,
    (table) => `<div class="article-table-scroll" role="region" aria-labelledby="article-title" tabindex="0">${table}</div>`);
}
