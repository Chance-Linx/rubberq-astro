/** Apply the approved English page copy to the existing Astro routes.
 * No CMS, network, deployment, or paid collection. Other locales are tracked
 * separately and must be complete before the final release audit.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Archived initial migration: subsequent edits belong in messages and route files.
if (JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8')).acquisition?.pages) {
  throw new Error('Initial acquisition migration already applied. Edit src/messages and existing routes; rerunning would overwrite reviewed implementation.');
}

const root = process.cwd();
const input = 'docs/2026-10-21-线上获客执行/data/pages.json';
const pages = JSON.parse(fs.readFileSync(input, 'utf8'));
const labels = {
  '/': 'Precision Rubber Components', '/about': 'About RubberQ', '/products': 'Products',
  '/products/seals': 'O-Rings & Seals', '/products/gaskets': 'Custom Gaskets',
  '/products/bellows': 'Bellows & Boots', '/products/custom': 'Custom Molded Parts',
  '/products/diaphragms': 'Diaphragms', '/products/rubber-to-metal-bonded-parts': 'Rubber-to-Metal Parts',
  '/products/ffkm-replacement-seals': 'FFKM Replacement Seals', '/materials': 'Materials',
  '/capabilities': 'Capabilities', '/capabilities/rubber-molding': 'Rubber Molding',
  '/capabilities/lsr-molding': 'LSR Molding', '/compounding': 'Compounding & Formulation',
  '/compounds': 'Compound Supply', '/testing': 'Testing', '/quality': 'Quality & Traceability',
  '/factory': 'Factory', '/industries': 'Industries', '/industries/semiconductor': 'Semiconductor Equipment',
  '/industries/liquid-cooling-energy-storage': 'Liquid Cooling & Energy Storage',
  '/industries/ev-energy-storage': 'EV Thermal Management', '/industries/humanoid-robotics': 'Humanoid Robotics',
  '/industries/industrial-equipment': 'General Industrial', '/industries/automotive-tier2': 'Automotive Tier 2',
  '/resources': 'Engineering Resources', '/standards': 'Standards',
  '/resources/o-ring-size-guide': 'O-Ring Size Guide', '/resources/rubber-hardness-guide': 'Rubber Hardness Guide',
  '/resources/material-compatibility': 'Material Compatibility', '/resources/seal-failure-analysis': 'Seal Failure Review',
  '/blog': 'English Blog', '/case-studies': 'Project Experience', '/contact': 'Engineering & Quotations',
  '/sample-request': 'Sample Request', '/batch-rfq': 'Multi-Part RFQ', '/search': 'Search',
  '/privacy': 'Privacy Policy', '/terms': 'Terms of Use',
};
for (const p of pages) if (p.url.startsWith('/materials/')) labels[p.url] = p.url.split('/').at(-1).toUpperCase();
labels['/materials/silicone'] = 'Silicone';
const write = (file, text) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const existingForms = {};
for (const [kind, name] of [['sample', 'sample-request'], ['batch', 'batch-rfq']]) {
  const source = fs.readFileSync(`src/pages/[locale]/${name}.astro`, 'utf8');
  const start = source.indexOf('const labelsByLocale:');
  if (start !== -1) {
    const tail = source.slice(start);
    const object = tail.slice(tail.indexOf('=') + 1, tail.indexOf('\n};') + 2).trim();
    // The old template's object consists only of literal label strings.
    existingForms[kind] = vm.runInNewContext(`(${object})`, Object.create(null), { timeout: 500 });
  }
}
const registry = pages.map(({ id, url, links, cta_url }) => ({ id, url, links, cta_url }));
write('src/data/acquisition-pages.json', JSON.stringify(registry, null, 2) + '\n');
for (const locale of ['en', 'de', 'ja', 'es', 'zh']) {
  const file = `src/messages/${locale}.json`;
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'));
  messages.acquisition ??= {};
  if (locale === 'en') {
    messages.acquisition.pages = Object.fromEntries(pages.map(p => [p.id, {
      label: labels[p.url], title: p.title, description: p.meta, h1: p.h1, intro: p.intro,
      sections: p.sections.map(([heading, body]) => ({ heading, body })), cta: p.cta,
      faq: p.faq.map(([question, answer]) => ({ question, answer })),
    }]));
    messages.acquisition.ui = {
      manufacturer: 'Precision rubber manufacturing · Since 1995',
      factoryImage: 'RubberQ manufacturing facility in Fuzhou', factoryCaption: 'Fuzhou, China · Compound preparation, molding and inspection',
      projectInputs: 'Prepare your project review', inputs: ['Drawing or reference part', 'Material and operating conditions', 'Quantity and project stage'],
      engineering: 'Discuss an engineering requirement', sample: 'Request Samples', manufacturingFacts: 'Manufacturing facts',
      established: 'Established in Fuzhou', facilities: 'Production facilities', factoryArea: 'Approximate facility area', traceability: 'Production traceability',
      questions: 'Questions about your project', nextStep: 'Define the next step',
      nextStepDescription: 'Bring the drawing, service conditions and quantity. We can discuss the material, sample and quotation requirements together.',
      supplierInformation: 'Supplier information', quality: 'Quality & traceability', testing: 'In-house testing', factory: 'Factory information',
      continue: 'Continue your project', explore: 'Find the right starting point', related: 'Related components and resources',
      projectStart: 'From your requirements to a component review', closing: 'Send your drawing or describe the application. Include service conditions, material requirements and quantity.',
      sendRequirements: 'Send Project Requirements', home: 'Home', navigation: 'Main navigation', language: 'Language', menu: 'Menu', closeMenu: 'Close menu', search: 'Search RubberQ',
    };
  }
  messages.acquisition.forms ??= {};
  for (const [kind, translations] of Object.entries(existingForms)) {
    const data = translations[locale];
    if (data) messages.acquisition.forms[kind] = data;
  }
  if (messages.acquisition.forms.sample) {
    delete messages.acquisition.forms.sample.subtitle;
    delete messages.acquisition.forms.sample.title;
  }
  if (messages.acquisition.forms.batch) {
    delete messages.acquisition.forms.batch.subtitle;
    delete messages.acquisition.forms.batch.title;
  }
  write(file, JSON.stringify(messages, null, 2) + '\n');
}

const specialized = new Set(['/blog', '/privacy', '/terms', '/search']);
const forms = new Map([['/contact', 'contact'], ['/sample-request', 'sample'], ['/batch-rfq', 'batch']]);
const grouped = ['products', 'materials', 'industries'];
for (const section of grouped) {
  write(`src/pages/[locale]/${section}/[slug].astro`, `---
import AcquisitionPage from '@/components/acquisition/AcquisitionPage.astro';
import { acquisitionPage, acquisitionPages } from '@/lib/acquisition';
export function getStaticPaths() {
  return ['en','de','ja','es','zh'].flatMap(locale => acquisitionPages.filter(p => p.url.startsWith('/${section}/')).map(p => ({ params: { locale, slug: p.url.split('/').at(-1) } })));
}
const { locale = 'en', slug } = Astro.params;
const path = '/${section}/' + slug;
if (!acquisitionPage(path)) return new Response('Not Found', { status: 404 });
---
<AcquisitionPage locale={locale} path={path} />
`);
}
for (const p of pages) {
  if (specialized.has(p.url) || grouped.some(g => p.url.startsWith('/'+g+'/'))) continue;
  const form = forms.get(p.url);
  const filename = p.url === '/' ? 'index' : p.url === '/industries' ? 'industries/index' : p.url.slice(1);
  write(`src/pages/[locale]/${filename}.astro`, `---
import AcquisitionPage from '@/components/acquisition/AcquisitionPage.astro';
${form ? "import RfqForm from '@/components/acquisition/RfqForm.astro';\n" : ''}export function getStaticPaths() { return ['en','de','ja','es','zh'].map(locale => ({ params: { locale } })); }
const { locale = 'en' } = Astro.params;
---
<AcquisitionPage locale={locale} path="${p.url}"${form ? ' form' : ''}>${form ? `\n  <RfqForm slot="form" locale={locale} kind="${form}" />\n` : ''}</AcquisitionPage>
`);
}
console.log(`Implemented ${pages.length-specialized.size} page specifications, preserving search, blog, and legal implementations. Non-English copy remains separately tracked.`);
