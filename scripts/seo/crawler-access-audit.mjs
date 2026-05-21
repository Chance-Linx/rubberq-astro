#!/usr/bin/env node
import {
  SITE_ORIGIN,
  extractSitemapLocs,
  fetchText,
  localUrl,
  normalizeTarget,
} from './audit-helpers.mjs';

const target = normalizeTarget();
const failures = [];

const ensure = (condition, message) => {
  if (!condition) failures.push(message);
};

const robotsResponse = await fetchText(localUrl(target, '/robots.txt'), '/robots.txt');
const llmsResponse = await fetchText(localUrl(target, '/llms.txt'), '/llms.txt');
const sitemapResponse = await fetchText(localUrl(target, '/sitemap.xml'), '/sitemap.xml');

const robots = robotsResponse.text;
const llms = llmsResponse.text;
const sitemapLocs = extractSitemapLocs(sitemapResponse.text);

for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot']) {
  ensure(robots.includes(`User-agent: ${bot}`), `robots.txt must include AI search crawler ${bot}.`);
}

for (const bot of ['GPTBot', 'Google-Extended', 'CCBot']) {
  const block = new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`, 'i');
  ensure(block.test(robots), `robots.txt must disallow training crawler ${bot}.`);
}

ensure(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`), 'robots.txt must point to the canonical sitemap.');
ensure(robots.includes(`${SITE_ORIGIN}/llms.txt`), 'robots.txt must point to llms.txt in a comment.');
ensure(llms.includes('/blog'), 'llms.txt must use the canonical /blog entry.');
ensure(!/^- \/en\/blog\s+—/m.test(llms), 'llms.txt must not recommend legacy /en/blog.');
ensure(sitemapLocs.includes(`${SITE_ORIGIN}/`), 'sitemap.xml must include root English homepage.');
ensure(!sitemapLocs.includes(`${SITE_ORIGIN}/en`), 'sitemap.xml must not include legacy /en homepage.');
ensure(!sitemapLocs.includes(`${SITE_ORIGIN}/llms.txt`), 'sitemap.xml should not include llms.txt as an HTML page.');

if (failures.length > 0) {
  console.error('Crawler access audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Crawler access audit passed at ${target}.`);
