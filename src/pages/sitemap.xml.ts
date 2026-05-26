import type { APIRoute } from 'astro';
import { getAllBlogPosts, getBlogUrl } from '../lib/sanity';
import { PRODUCT_SLUGS } from '../lib/products';
import { MATERIAL_SLUGS } from '../lib/materials';

export const GET: APIRoute = async () => {
  const base = 'https://rubberq.com';
  const posts = await getAllBlogPosts();
  const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;

  const latestIsoDate = (...values: Array<string | undefined>) => {
    const dates = values
      .filter(Boolean)
      .map((value) => new Date(value as string))
      .filter((date) => !Number.isNaN(date.getTime()));

    if (!dates.length) return '';
    return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
  };

  const staticPages = [
    '', 'products', 'case-studies', 'factory', 'about', 'capabilities',
    'compounding', 'testing', 'industries',
    'materials', 'quality', 'resources', 'contact', 'sample-request',
    'batch-rfq', 'standards', 'privacy', 'terms'
  ];
  const industryPages = ['ev-energy-storage', 'industrial-equipment', 'semiconductor', 'automotive-tier2'];

  const xmlEscape = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const sitemapUrl = (loc: string, options: { lastmod?: string; changefreq: string; priority: string }) => {
    const lines = [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
    ];
    if (options.lastmod) {
      lines.push(`    <lastmod>${xmlEscape(options.lastmod)}</lastmod>`);
    }
    lines.push(`    <changefreq>${options.changefreq}</changefreq>`);
    lines.push(`    <priority>${options.priority}</priority>`);
    lines.push('  </url>');
    return lines.join('\n');
  };

  const pathForLocale = (locale: string, path = '') => {
    const pathSuffix = path ? `/${path}` : '';
    return locale === 'en' ? pathSuffix || '/' : `/${locale}${pathSuffix}`;
  };

  const urls: string[] = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const path = pathForLocale(locale, page);
      urls.push(sitemapUrl(`${base}${path}`, {
        changefreq: 'weekly',
        priority: page ? '0.7' : '1.0',
      }));
    }
  }

  for (const locale of locales) {
    for (const slug of PRODUCT_SLUGS) {
      urls.push(sitemapUrl(`${base}${pathForLocale(locale, `products/${slug}`)}`, {
        changefreq: 'monthly',
        priority: '0.7',
      }));
    }

    for (const slug of MATERIAL_SLUGS) {
      urls.push(sitemapUrl(`${base}${pathForLocale(locale, `materials/${slug}`)}`, {
        changefreq: 'monthly',
        priority: '0.7',
      }));
    }

    for (const slug of industryPages) {
      urls.push(sitemapUrl(`${base}${pathForLocale(locale, `industries/${slug}`)}`, {
        changefreq: 'monthly',
        priority: '0.75',
      }));
    }
  }

  urls.push(sitemapUrl(`${base}/blog`, {
    changefreq: 'daily',
    priority: '0.9',
  }));

  for (const post of posts) {
    const url = getBlogUrl(post.slug);
    const lastmod = latestIsoDate(post._updatedAt, post.publishedAt);
    urls.push(sitemapUrl(`${base}${url}`, {
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    }));
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
};
