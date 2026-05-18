import { getFeaturedImageUrl, getAllBlogPosts, type BlogPost } from './sanity';

/** Filter published posts by category slug. Fallback for Astro where we don't have a
 *  dedicated getPostsByCategory query — we reuse getAllBlogPosts + client-side filter. */
async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.filter((p) => p.category === categorySlug);
}

type CaseStudiesCacheEntry = {
  value: CaseStudyEntry[];
  expiresAt: number;
};

export type IndustryKey = 'ev' | 'industrial' | 'semiconductor' | 'automotiveTier2';

export interface CaseStudyEntry {
  id: number;
  slug: string;
  title: string;
  location: string;
  industry: IndustryKey;
  challenge: string;
  solution: string;
  results: string[];
  image: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200';
const CASE_STUDIES_TTL_MS = 10 * 60 * 1000;

let caseStudiesCache: CaseStudiesCacheEntry | null = null;

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstSentence(value: string) {
  const plain = decodeHtml(value);
  if (!plain) {
    return '';
  }

  const parts = plain.split(/(?<=[.!?。！？])\s+/);
  return parts[0] || plain;
}

function extractResults(content: string) {
  const listItems = Array.from(content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map((match) => decodeHtml(match[1]))
    .filter(Boolean)
    .slice(0, 3);

  if (listItems.length > 0) {
    return listItems;
  }

  const fallbackText = decodeHtml(content)
    .split(/(?<=[.!?。！？])\s+/)
    .filter(Boolean)
    .slice(0, 3);

  return fallbackText;
}

function inferIndustry(post: BlogPost): IndustryKey {
  const source = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();

  if (source.includes('semiconductor') || source.includes('ffkm') || source.includes('vacuum')) {
    return 'semiconductor';
  }

  if (source.includes('automotive') || source.includes('tier 2')) {
    return 'automotiveTier2';
  }

  if (source.includes('ev') || source.includes('energy storage') || source.includes('thermal')) {
    return 'ev';
  }

  return 'industrial';
}

function inferLocation(post: BlogPost): string {
  const source = `${post.title} ${post.excerpt}`.toLowerCase();

  if (source.includes('germany') || source.includes('europe')) {
    return 'Germany';
  }
  if (source.includes('japan')) {
    return 'Japan';
  }
  if (source.includes('united states') || source.includes('usa')) {
    return 'United States';
  }

  return 'Global';
}

export async function getCaseStudiesFromCms(): Promise<CaseStudyEntry[]> {
  if (caseStudiesCache && Date.now() < caseStudiesCache.expiresAt) {
    return caseStudiesCache.value;
  }

  const categoryCandidates = ['case-studies', 'case-study', 'customer-stories'];

  let posts: BlogPost[] = [];
  for (const categorySlug of categoryCandidates) {
    const result = await getPostsByCategory(categorySlug);
    if (result.length > 0) {
      posts = result;
      break;
    }
  }

  if (posts.length === 0) {
    const allPosts = await getAllBlogPosts();
    posts = allPosts.slice(0, 6);
  }

  const entries = await Promise.all(
    posts.map(async (post) => {
      const image = (await getFeaturedImageUrl(post)) || DEFAULT_IMAGE;

      const title = post.title;
      const challenge = post.excerpt || post.content.substring(0, 200) + '...';
      const solution = post.content.substring(0, 200) + '...';
      const results: string[] = [];

      return {
        id: parseInt(post._id.replace(/[^0-9]/g, '').substring(0, 10)) || 0,
        slug: post.slug,
        title,
        location: inferLocation(post),
        industry: inferIndustry(post),
        challenge,
        solution,
        results,
        image,
      } satisfies CaseStudyEntry;
    })
  );

  caseStudiesCache = {
    value: entries,
    expiresAt: Date.now() + CASE_STUDIES_TTL_MS,
  };

  return entries;
}
