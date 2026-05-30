'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
}

const blockedBlogTerms = [
  'f' + 'da',
  'iso-13485',
  'iso ' + '13485',
  'med' + 'ical',
  'bio' + 'compatibility',
  'usp-class',
  'robotic',
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

function isAllowedBlogSearchResult(post: { title?: string; slug?: string; seo?: { metaDescription?: string } }) {
  const source = [post.title, post.slug, post.seo?.metaDescription]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return !blockedBlogTerms.some((term) => source.includes(term));
}

export default function SearchPageClient({ locale, labels }: { locale: string; labels: Record<string, string> }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);

    const lower = q.toLowerCase();
    const items: SearchResult[] = [];

    // Products
    const products = [
      { title: 'Seals & O-Rings', desc: 'Static and dynamic sealing solutions with precision tolerances to ISO 3601 and ASTM D2000 standards.', href: `${prefix}/products/seals`, cat: 'Product' },
      { title: 'Gaskets & Washers', desc: 'Die-cut and molded gaskets for fluid sealing, EMI shielding, and thermal management applications.', href: `${prefix}/products/gaskets`, cat: 'Product' },
      { title: 'Bellows & Boots', desc: 'Flexible protective covers for linear and rotary motion systems, with extended fatigue life.', href: `${prefix}/products/bellows`, cat: 'Product' },
      { title: 'Custom Molded Parts', desc: 'Application-specific rubber components from prototype to high-volume production.', href: `${prefix}/products/custom`, cat: 'Product' },
    ];
    for (const p of products) {
      if (p.title.toLowerCase().includes(lower) || p.desc.toLowerCase().includes(lower)) {
        items.push({ title: p.title, description: p.desc, href: p.href, category: p.cat });
      }
    }

    // Materials
    const materials = [
      { title: 'FKM (Viton®)', desc: 'High heat and fuel resistance for demanding environments. -20°C to +250°C.', href: `${prefix}/materials/fkm`, cat: 'Material' },
      { title: 'EPDM', desc: 'Preferred for water, steam, and weather exposure. -50°C to +150°C.', href: `${prefix}/materials/epdm`, cat: 'Material' },
      { title: 'NBR (Nitrile)', desc: 'Strong oil resistance with balanced cost profile. -30°C to +120°C.', href: `${prefix}/materials/nbr`, cat: 'Material' },
      { title: 'Silicone', desc: 'Broad thermal range and clean-room adaptability. -60°C to +230°C.', href: `${prefix}/materials/silicone`, cat: 'Material' },
    ];
    for (const m of materials) {
      if (m.title.toLowerCase().includes(lower) || m.desc.toLowerCase().includes(lower)) {
        items.push({ title: m.title, description: m.desc, href: m.href, category: m.cat });
      }
    }

    // Resources
    const resources = [
      { title: 'Material Selection Guide', desc: 'Comprehensive guide for selecting the right rubber material for your application.', href: '/downloads/material-selection-guide.pdf', cat: 'Resource' },
      { title: 'Rubber Design Manual', desc: 'Design guidelines for molded rubber parts including wall thickness and draft angles.', href: '/downloads/rubber-design-manual.pdf', cat: 'Resource' },
      { title: 'ISO Tolerance Chart', desc: 'Reference chart for ISO 3302-1 rubber dimensional tolerances.', href: '/downloads/iso-tolerance-chart.pdf', cat: 'Resource' },
    ];
    for (const r of resources) {
      if (r.title.toLowerCase().includes(lower) || r.desc.toLowerCase().includes(lower)) {
        items.push({ title: r.title, description: r.desc, href: r.href, category: r.cat });
      }
    }

    // Blog - fetch from Sanity
    try {
      const params = new URLSearchParams({
        query: '*[_type=="article" && status=="published" && publishedAt <= now() && (title match $q || seo.metaDescription match $q)]{title, "slug":slug.current, seo}|order(_createdAt desc)[0...10]',
      });
      params.set('$q', `${q.trim()}*`);

      const sanityRes = await fetch(`https://tcjl4afv.api.sanity.io/v2023-08-01/data/query/production?${params.toString()}`);
      const blogData = await sanityRes.json();
      if (blogData?.result) {
        for (const post of blogData.result.filter(isAllowedBlogSearchResult)) {
          items.push({
            title: post.title || 'Blog Post',
            description: post.seo?.metaDescription || '',
            href: `/blog/${encodeURIComponent(post.slug)}`,
            category: 'Blog',
          });
        }
      }
    } catch (e) {
      // Blog search unavailable
    }

    setResults(items);
    setLoading(false);
  }, [locale, prefix]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [performSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div>
      <section className="relative bg-industrial-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-5"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-[0.95]">
            {labels.title || 'Search'}
          </h1>
          <p className="text-xl text-industrial-300 leading-relaxed mb-8">
            {labels.subtitle || 'Find products, materials, resources, and technical articles.'}
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.placeholder || 'Search...'}
              className="flex-1 px-6 py-4 text-industrial-900 text-lg bg-white border-0 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            />
            <button type="submit" className="rq-pressable bg-accent-orange text-white px-6 py-4 font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-industrial-900">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <p className="text-center text-industrial-500">Searching...</p>
          )}
          {!loading && searched && results.length === 0 && (
            <p className="text-center text-industrial-600 text-lg">
              {labels.empty || 'No results found. Try different keywords.'}
            </p>
          )}
          {!loading && !searched && (
            <p className="text-center text-industrial-600 text-lg">
              {labels.emptyState || 'Enter a search term above to find products, materials, guides, and blog articles.'}
            </p>
          )}
          {!loading && results.length > 0 && (
            <div className="space-y-6">
              {results.map((item, i) => (
                <a key={i} href={item.href} className="block bg-white border border-industrial-200 p-6 hover:border-accent-orange transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-industrial-100 text-industrial-600">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-industrial-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-industrial-600 leading-relaxed">{item.description}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
