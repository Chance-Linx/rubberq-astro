import drafts from '../../docs/2026-10-21-全站规划落实/content-revisions/manifest.json';
import metadata from '../../docs/2026-10-21-全站规划落实/evidence/article-metadata-current.json';
import type { BlogPost } from '../../src/lib/sanity';

export const records = drafts.drafts.map((draft) => {
  const source = metadata.result.find((item) => item._id === draft.article_id);
  if (!source || source._rev !== draft.expected_source_revision) throw new Error('Refresh and reconcile article metadata: ' + draft.article_id);
  const slug = source.slug.current;
  if (draft.url !== '/blog/' + encodeURIComponent(slug)) throw new Error('Unexpected draft URL: ' + draft.url);
  if (!['draft', 'published', 'archived'].includes(source.status)) throw new Error('Unknown article status.');
  const post: BlogPost = {
    _id: source._id, _createdAt: source._createdAt, _updatedAt: source._updatedAt,
    title: draft.fields.title, excerpt: draft.fields.excerpt, content: draft.fields.content,
    slug, publishedAt: source.publishedAt, status: source.status as BlogPost['status'],
    author: typeof source.author === 'string' ? source.author : undefined,
    category: typeof source.category === 'string' ? source.category : undefined,
    tags: Array.isArray(source.tags) ? source.tags : undefined,
    coverImage: source.coverImage?.asset?._ref ? { asset: { _ref: source.coverImage.asset._ref, _type: 'reference' } } : undefined,
  };
  return { draft, source, post, url: draft.url, reviewUrl: '/__review/articles/' + encodeURIComponent(slug) };
});
export const recordsBySlug = new Map(records.map((record) => [record.post.slug, record]));
export const recordsByUrl = new Map(records.map((record) => [record.url, record]));
export function relatedDrafts(content: string): BlogPost[] {
  const urls = [...content.matchAll(/href="(\/blog\/[^"#?]+)"/g)].map((match) => match[1]);
  return [...new Set(urls)].flatMap((url) => recordsByUrl.has(url) ? [recordsByUrl.get(url)!.post] : []).slice(0,3);
}
