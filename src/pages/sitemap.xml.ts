import type { APIRoute } from 'astro';
import { getAllBlogPosts, getBlogUrl } from '../lib/sanity';
import acquisitionPages from '../data/acquisition-pages.json';

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

  const plannedPages = acquisitionPages.filter(page => !['/search', '/blog'].includes(page.url));

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

  for (const page of plannedPages) {
    for (const locale of locales) {
      const path = pathForLocale(locale, page.url === '/' ? '' : page.url.slice(1));
      urls.push(sitemapUrl(`${base}${path}`, {
        changefreq: 'weekly',
        priority: page.url === '/' ? '1.0' : '0.7',
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
