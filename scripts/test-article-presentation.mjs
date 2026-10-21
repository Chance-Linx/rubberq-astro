import assert from 'node:assert/strict';
import test from 'node:test';
import { isArticleCoverSuppressed, makeArticleTablesScrollable } from '../src/lib/articlePresentation.ts';

test('an image decision requires the exact reviewed article and asset pair', () => {
  const id = 'Iht31guWKGVyy0fDUhwnFo';
  const asset = 'image-1cc62adc22999944f88c38aa831b47f06a91fe28-1792x1024-webp';
  assert.equal(isArticleCoverSuppressed(id, asset), true);
  assert.equal(isArticleCoverSuppressed(id, 'image-replacement-800x400-webp'), false);
  assert.equal(isArticleCoverSuppressed('another-article', asset), false);
  assert.equal(isArticleCoverSuppressed(id), false);
});

test('scroll regions preserve table markup, links, labels, units and surrounding content', () => {
  const table = '<table class="source"><thead><tr><th scope="col">Length (mm)</th></tr></thead><tbody><tr><td><a href="/contact">1 &lt; 2</a></td></tr></tbody></table>';
  const before = '<h2 id="data">Report</h2>';
  const after = '<p>Conditions apply.</p>';
  const html = makeArticleTablesScrollable(before + table + after);
  assert.equal(html, before + '<div class="article-table-scroll" role="region" aria-labelledby="article-title" tabindex="0">' + table + '</div>' + after);
  assert.equal(makeArticleTablesScrollable(before + after), before + after);
  assert.equal((makeArticleTablesScrollable(table + table).match(/role="region"/g) || []).length, 2);
});
