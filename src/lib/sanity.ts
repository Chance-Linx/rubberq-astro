import { createClient } from '@sanity/client';

const PROJECT_ID = import.meta.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = import.meta.env.SANITY_DATASET || 'production';
const API_TOKEN = import.meta.env.SANITY_API_TOKEN;

const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
  token: API_TOKEN,
});

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

// Get all published blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const query = `*[_type == "article" && status == "published"] | order(publishedAt desc) {
      _id, _createdAt, _updatedAt, title, "slug": slug.current,
      excerpt, content, publishedAt, author, category, tags,
      coverImage { asset { _ref, _type } }
    }`;
    return await sanityClient.fetch(query);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const query = `*[_type == "article" && slug.current == $slug && status == "published"][0] {
      _id, _createdAt, _updatedAt, title, "slug": slug.current,
      excerpt, content, publishedAt, author, category, tags,
      coverImage { asset { _ref, _type } }
    }`;
    const post = await sanityClient.fetch(query, { slug });
    return post || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
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
    const posts = await sanityClient.fetch(`*[_type == "article" && status == "published"] { category }`);
    const categoryCount: Record<string, number> = {};
    posts.forEach((p: BlogPost) => {
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
    const query = `*[_type == "article" && status == "published" && _id != $currentId && category == $category] | order(publishedAt desc)[0...${limit}] {
      _id, title, "slug": slug.current, excerpt, publishedAt, author, category,
      coverImage { asset { _ref, _type } }
    }`;
    return await sanityClient.fetch(query, { currentId: currentPost._id, category: currentPost.category });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}
