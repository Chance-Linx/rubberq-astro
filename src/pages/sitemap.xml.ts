import type { APIRoute } from 'astro';
import { getAllBlogPosts, getBlogUrl } from '../lib/sanity';

export const GET: APIRoute = async () => {
  const base = 'https://rubberq.com';
  const posts = await getAllBlogPosts();
  const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;

  const staticPages = [
    '', 'products', 'case-studies', 'factory', 'about', 'capabilities',
    'materials', 'quality', 'resources', 'contact', 'sample-request',
    'batch-rfq', 'search', 'standards', 'privacy', 'terms'
  ];

  const urls: string[] = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const path = page ? `/${locale}/${page}` : `/${locale}`;
      urls.push(`  <url><loc>${base}${path}</loc><changefreq>weekly</changefreq><priority>${page ? '0.7' : '1.0'}</priority></url>`);
    }
  }

  urls.push(`  <url><loc>${base}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`);

  for (const post of posts) {
    const url = getBlogUrl(post.slug);
    urls.push(`  <url><loc>${base}${url}</loc><lastmod>${post._updatedAt || post.publishedAt || ''}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
