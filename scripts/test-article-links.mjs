import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeArticleLinks } from '../src/lib/articleLinks.ts';
import { renderArticleContent } from '../src/lib/articleContent.ts';

test('the reported VMQ link goes directly to the existing Silicone (VMQ) page', () => {
  assert.equal(normalizeArticleLinks('<p>Review <a href="/materials/vmq">VMQ</a>.</p>'),
    '<p>Review <a href="/materials/silicone">VMQ</a>.</p>');
});

test('reviewed aliases preserve locale, query, fragment and anchor attributes', () => {
  for (const locale of ['', '/en', '/de', '/ja', '/es', '/zh']) {
    const target = locale === '/en' ? '' : locale;
    assert.equal(normalizeArticleLinks(`<a class="material" href='${locale}/materials/vmq/?a=1&amp;b=2#selection' title="VMQ">VMQ</a>`),
      `<a class="material" href='${target}/materials/silicone?a=1&amp;b=2#selection' title="VMQ">VMQ</a>`);
  }
  for (const origin of ['https://rubberq.com', 'http://www.rubberq.com', '//rubberq.com']) {
    assert.equal(normalizeArticleLinks(`<a href="${origin}/materials/vmq">VMQ</a>`),
      '<a href="/materials/silicone">VMQ</a>');
  }
});

test('HTML, Markdown and Portable Text all use the same direct material destination', () => {
  const portable = [{ _type: 'block', children: [{ _type: 'span', text: 'VMQ', marks: ['vmq'] }],
    markDefs: [{ _key: 'vmq', _type: 'link', href: '/materials/vmq' }] }];
  for (const content of ['<p><a href="/materials/vmq">VMQ</a></p>', '[VMQ](/materials/vmq)', portable]) {
    const html = normalizeArticleLinks(renderArticleContent(content));
    assert.match(html, /href="\/materials\/silicone"/);
    assert.doesNotMatch(html, /href="\/materials\/vmq/);
  }
});

test('other destinations, text, images and data attributes retain their exact output', () => {
  const html = '<p>/materials/vmq <code>&lt;a href="/materials/vmq"&gt;</code></p>' +
    '<img src="/materials/vmq"/><a data-href="/materials/vmq" href="/contact">RFQ</a>' +
    '<a href="https://example.com/materials/vmq">External</a>' +
    '<a href="https://rubberq.com.example.com/materials/vmq">Other host</a>' +
    '<a href="materials/vmq">Relative</a>' +
    '<a href="/materials/vmq-extra">Unknown</a><a href="mailto:contact@rubberq.com">Email</a>';
  assert.equal(normalizeArticleLinks(html), html);
});

test('HTML anchor quoting and attribute order do not hide the reviewed alias', () => {
  assert.equal(normalizeArticleLinks('<A title="x > y" HREF=/materials/vmq>VMQ</A>'),
    '<A title="x > y" HREF="/materials/silicone">VMQ</A>');
  assert.equal(normalizeArticleLinks('<a data-example=\'use href="/materials/vmq"\' href="/contact">RFQ</a>'),
    '<a data-example=\'use href="/materials/vmq"\' href="/contact">RFQ</a>');
});
