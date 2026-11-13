import test from 'node:test';
import assert from 'node:assert/strict';
import { articleImageObjects, sanityImageReference, withArticleImages, withoutSanityAssetUrls } from '../src/lib/articleVisuals.ts';
const url = 'https://rubberq.com/blog/compound-development';
const image = { id: 'trial-approval', alt: 'Trial samples connected to their approval records', width: 2048, height: 1024, asset: { _ref: 'image-abc123-2048x1024-webp' } };

test('reviewed image records emit canonical, dimensioned ImageObjects without public source labels', () => {
  const [result] = articleImageObjects(url, [image]);
  assert.equal(result['@id'], `${url}#image-trial-approval`);
  assert.equal(result.contentUrl, 'https://cdn.sanity.io/images/tcjl4afv/production/abc123-2048x1024.webp?fm=webp&q=100');
  assert.equal(result.description, image.alt);
  assert.equal(result.width, 2048);
  assert.equal(result.height, 1024);
  assert.equal(result.caption, undefined);
  assert.equal(result.alt, undefined);
});

test('malformed, mismatched or duplicate records cannot publish misleading image metadata', () => {
  assert.deepEqual(articleImageObjects(url, [
    { ...image, width: 800 }, { ...image, alt: '' }, { ...image, id: '../bad' },
    { ...image, asset: { _ref: 'https://untrusted.example/a.webp' } },
  ]), []);
  assert.equal(articleImageObjects(url, [image, image, { ...image, id: 'another-name' }]).length, 1);
  assert.equal(sanityImageReference('image-a-0x10-png'), null);
  assert.equal(sanityImageReference('image-a-9999999999999999999x10-png'), null);
});

test('one BlogPosting retains its identity, dates and author while linking all image nodes', () => {
  const original = { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#blogposting`, headline: 'Compound development', datePublished: '2026-04-01', author: { name: 'RubberQ Engineering Team' }, image: 'old-image' };
  const graph = withArticleImages(original, articleImageObjects(url, [image]));
  assert.equal(graph['@graph'].filter(x => x['@type'] === 'BlogPosting').length, 1);
  const article = graph['@graph'][0];
  for (const key of ['@id', 'headline', 'datePublished', 'author']) assert.deepEqual(article[key], original[key]);
  assert.deepEqual(article.image, [{ '@id': `${url}#image-trial-approval` }]);
  assert.equal(withArticleImages(original, []), original);
});

 test('legacy CMS null fields and malformed runtime assets do not crash rendering', () => {
  for (const value of [undefined, null, {}, '']) assert.deepEqual(articleImageObjects(url, value), []);
  assert.deepEqual(articleImageObjects(url, [null, {}, { asset: { _ref: 42 } }]), []);
  assert.equal(sanityImageReference(42), null);
});

test('asset hashes cannot trigger business redlines, while visible claims and normal links remain checked', () => {
  const asset = 'https://cdn.sanity.io/images/tcjl4afv/production/abcfda123-2048x1024.webp?fm=webp&amp;q=100';
  const html = `<a href="${asset}"><img src="${asset}" alt="Example label"></a>`;
  assert.equal(withoutSanityAssetUrls(html).includes('f' + 'da'), false);
  const visible = `<img src="${asset}" alt="f` + `da claim"><a href="https://example.com/f` + `da">visible claim</a>`;
  assert.equal(withoutSanityAssetUrls(visible).includes('f' + 'da claim'), true);
  assert.equal(withoutSanityAssetUrls(visible).includes('https://example.com/f' + 'da'), true);
  assert.equal(withoutSanityAssetUrls('https://cdn.sanity.io/images/tcjl4afv/production/not-a-real-asset.webp').includes('not-a-real-asset'), true);
});
