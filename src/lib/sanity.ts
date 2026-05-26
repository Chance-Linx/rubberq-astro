import { createClient } from '@sanity/client';

const PROJECT_ID = import.meta.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = import.meta.env.SANITY_DATASET || 'production';

const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const PUBLIC_ARTICLE_FILTER = '_type == "article" && status == "published" && publishedAt <= now()';

export interface BlogPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  author?: string;
  category?: string;
  tags?: string[];
  coverImage?: {
    asset?: {
      _ref: string;
      _type: string;
    };
  };
  status: 'draft' | 'published' | 'archived';
}

export function getBlogUrl(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}

const blockedBlogTerms = [
  'f' + 'da',
  'iso-' + '13485',
  'iso ' + '13485',
  'med' + 'ical',
  'bio' + 'compatibility',
  'usp-class',
  'robot' + 'ic',
  'robot' + 'ics',
  'robot' + 's',
  'ai-server',
  'ai-and-automation',
  'data-center',
  'battery-pack',
  'p' + 'du',
  'b' + 'ms',
  'pharma' + 'ceutical',
  'sterile',
];

function isPublicAllowedBlogPost(post: Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'content' | 'category' | 'tags'>): boolean {
  const source = [
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.category,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return !blockedBlogTerms.some((term) => source.includes(term));
}

// Get all public blog posts. Future publishedAt values act as scheduled publishing.
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const query = `*[${PUBLIC_ARTICLE_FILTER}] | order(publishedAt desc) {
      _id, _createdAt, _updatedAt, title, "slug": slug.current,
      excerpt, content, publishedAt, author, category, tags,
      coverImage { asset { _ref, _type } },
      status
    }`;
    const posts = await sanityClient.fetch<BlogPost[]>(query);
    return posts.filter(isPublicAllowedBlogPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const query = `*[${PUBLIC_ARTICLE_FILTER} && slug.current == $slug][0] {
      _id, _createdAt, _updatedAt, title, "slug": slug.current,
      excerpt, content, publishedAt, author, category, tags,
      coverImage { asset { _ref, _type } },
      status
    }`;
    const post = await sanityClient.fetch<BlogPost | null>(query, { slug });
    if (!post || !isPublicAllowedBlogPost(post)) {
      return null;
    }
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getUnavailableBlogPostStatus(slug: string): Promise<'scheduled' | 'gone' | 'missing'> {
  try {
    const query = `*[_type == "article" && slug.current == $slug][0] {
      _id, _createdAt, _updatedAt, title, "slug": slug.current,
      excerpt, content, publishedAt, author, category, tags,
      coverImage { asset { _ref, _type } },
      status
    }`;
    const post = await sanityClient.fetch<BlogPost | null>(query, { slug });

    if (!post) {
      return 'missing';
    }

    if (post.status === 'archived') {
      return 'gone';
    }

    if (post.status !== 'published' || !post.publishedAt || new Date(post.publishedAt) > new Date()) {
      return 'scheduled';
    }

    return isPublicAllowedBlogPost(post) ? 'missing' : 'gone';
  } catch (error) {
    console.error('Error checking blog post availability:', error);
    return 'missing';
  }
}

function isNearSlugMatch(inputSlug: string, candidateSlug: string): boolean {
  const input = decodeURIComponent(inputSlug).replace(/\/+$/, '');
  const candidate = decodeURIComponent(candidateSlug).replace(/\/+$/, '');
  const shorter = input.length <= candidate.length ? input : candidate;
  const longer = input.length > candidate.length ? input : candidate;

  return shorter.length >= 40 && longer.startsWith(shorter) && longer.length - shorter.length <= 16;
}

export async function findCanonicalBlogSlug(slug: string): Promise<string | null> {
  const posts = await getAllBlogPosts();
  const matches = posts
    .map((post) => post.slug)
    .filter((candidate) => candidate && candidate !== slug && isNearSlugMatch(slug, candidate));

  return matches.length === 1 ? matches[0] : null;
}

// Get featured image URL
export function getFeaturedImageUrl(post: BlogPost): string | null {
  if (!post.coverImage?.asset?._ref) return null;
  const projectId = PROJECT_ID;
  const dataset = DATASET;
  const ref = post.coverImage.asset._ref.replace(/^image-/, '');
  const extMatch = ref.match(/-(jpg|png|webp)$/);
  const ext = extMatch ? extMatch[1] : 'jpg';
  const assetId = ref.replace(/-(jpg|png|webp)$/, '');
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}.${ext}?w=800&h=400&fit=crop`;
}

// Get categories
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  try {
    const posts = await sanityClient.fetch<BlogPost[]>(`*[${PUBLIC_ARTICLE_FILTER}] {
      title, "slug": slug.current, excerpt, content, category, tags, status
    }`);
    const categoryCount: Record<string, number> = {};
    posts.filter(isPublicAllowedBlogPost).forEach((p: BlogPost) => {
      if (p.category) categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get related posts
export async function getRelatedPosts(currentPost: BlogPost, limit = 3): Promise<BlogPost[]> {
  try {
    const query = `*[${PUBLIC_ARTICLE_FILTER} && _id != $currentId && category == $category] | order(publishedAt desc)[0...${limit}] {
      _id, title, "slug": slug.current, excerpt, publishedAt, author, category,
      coverImage { asset { _ref, _type } },
      status
    }`;
    const posts = await sanityClient.fetch<BlogPost[]>(query, { currentId: currentPost._id, category: currentPost.category });
    return posts.filter(isPublicAllowedBlogPost).slice(0, limit);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}
