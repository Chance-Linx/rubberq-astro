export interface DiscoveryEntry {
  title: string;
  description: string;
  href: string;
  category: string;
  searchText: string;
}

interface Page { id: string; url: string }
interface Article {
  _id: string; title: string; slug: string; excerpt?: string;
  content?: unknown; category?: string; publishedAt: string; status: string;
}

function values(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(values).join(' ');
  if (value && typeof value === 'object') return Object.entries(value)
    .filter(([key]) => !['url', 'cta_url', 'id'].includes(key))
    .map(([, child]) => values(child)).join(' ');
  return '';
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

export function pageSearchEntries(pages: Page[], copies: Record<string, any>, locale: string, category: string): DiscoveryEntry[] {
  return pages.filter(page => !['/blog', '/search', '/privacy', '/terms'].includes(page.url)).flatMap(page => {
    const copy = copies[page.id];
    if (!copy) return [];
    const href = locale === 'en' ? page.url : `/${locale}${page.url === '/' ? '' : page.url}`;
    return [{ title: copy.h1, description: copy.description, href, category,
      searchText: values(copy) + ' ' + page.url.replaceAll('/', ' ') }];
  });
}

/** The same published/date boundary is enforced for normal and local candidate lists. */
export function publicArticles<T extends Article>(posts: T[], now = Date.now()): T[] {
  return posts.filter(post => post.status === 'published' && post.slug && post.title &&
    Number.isFinite(Date.parse(post.publishedAt)) && Date.parse(post.publishedAt) <= now)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a._id.localeCompare(b._id));
}

export function articleSearchEntries(posts: Article[], category: string): DiscoveryEntry[] {
  return publicArticles(posts).map(post => ({ title: post.title, description: post.excerpt || '',
    href: '/blog/' + encodeURIComponent(post.slug), category,
    searchText: [post.title, post.excerpt, values(post.content).replace(/<[^>]*>/g, ' '), post.category].join(' ') }));
}

function contains(text: string, token: string): boolean {
  // Latin queries match words, so FKM is not silently treated as the word FFKM.
  return /^[a-z0-9]+$/.test(token) ? text.split(' ').includes(token) : text.includes(token);
}

export function searchEntries(entries: DiscoveryEntry[], query: string): DiscoveryEntry[] {
  const needle = normalizeSearch(query);
  if (!needle) return [];
  const tokens = [...new Set(needle.split(' '))];
  return entries.flatMap((entry, index) => {
    const title = normalizeSearch(entry.title), description = normalizeSearch(entry.description);
    const text = normalizeSearch(entry.searchText + ' ' + title + ' ' + description);
    if (!tokens.every(token => contains(text, token))) return [];
    const score = (title === needle ? 200 : title.includes(needle) ? 100 : 0) +
      tokens.reduce((sum, token) => sum + (contains(title, token) ? 20 : contains(description, token) ? 8 : 0), 0);
    return [{ entry, score, index }];
  }).sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.entry);
}

export function paginate<T>(items: T[], rawPage: string | null, pageSize = 12) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = rawPage && /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1;
  const page = Math.min(requested, totalPages);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), page, totalPages, total: items.length };
}

export function discoveryUrl(path: string, options: { query?: string; category?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (options.query) params.set('q', options.query);
  if (options.category) params.set('category', options.category);
  if (options.page && options.page > 1) params.set('page', String(options.page));
  return path + (params.size ? '?' + params.toString() : '');
}
