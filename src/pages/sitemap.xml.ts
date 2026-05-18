import type { APIRoute } from 'astro';
import { getAllBlogPosts, getBlogUrl } from '../lib/sanity';
import { PRODUCT_SLUGS } from '../lib/products';
import { MATERIAL_SLUGS } from '../lib/materials';

export const GET: APIRoute = async () => {
  const base = 'https://rubberq.com';
  const posts = await getAllBlogPosts();
  const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;

  const staticPages = [
    '', 'products', 'case-studies', 'factory', 'about', 'capabilities',
    'compounding', 'testing', 'industries',
    'materials', 'quality', 'resources', 'contact', 'sample-request',
    'batch-rfq', 'search', 'standards', 'privacy', 'terms'
  ];
  const industryPages = ['ev-energy-storage', 'industrial-equipment', 'semiconductor', 'automotive-tier2'];

  const urls: string[] = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const path = page ? `/${locale}/${page}` : `/${locale}`;
      urls.push(`  <url><loc>${base}${path}</loc><changefreq>weekly</changefreq><priority>${page ? '0.7' : '1.0'}</priority></url>`);
    }
  }

  for (const locale of locales) {
    for (const slug of PRODUCT_SLUGS) {
      urls.push(`  <url><loc>${base}/${locale}/products/${slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    }

    for (const slug of MATERIAL_SLUGS) {
      urls.push(`  <url><loc>${base}/${locale}/materials/${slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    }

    for (const slug of industryPages) {
      urls.push(`  <url><loc>${base}/${locale}/industries/${slug}</loc><changefreq>monthly</changefreq><priority>0.75</priority></url>`);
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
