import assert from 'node:assert/strict';
import test from 'node:test';
import { renderArticleContent } from '../src/lib/articleContent.ts';

const block = (text, extra = {}) => ({ _type: 'block', style: 'normal', children: [{ _type: 'span', text, marks: [] }], ...extra });

test('existing publisher HTML retains its exact established output', () => {
  const html = '<h2 id="selection">Selection</h2><table><tr><td>FKM</td></tr></table>';
  assert.equal(renderArticleContent(html), html);
  const literal = '<p>Keep **literal** punctuation and [reference](value) in this HTML block.</p>';
  assert.equal(renderArticleContent(literal), literal);
});

test('prose-first mixed content parses formatting and lists after HTML', () => {
  const html = renderArticleContent('Introduction with **bold** and [Contact](/contact).\n\n<h2>Conditions</h2>\n\n- One\n- Two');
  assert.match(html, /Introduction with <strong>bold<\/strong> and <a href="\/contact">Contact<\/a>/);
  assert.match(html, /<h2>Conditions<\/h2>/);
  assert.match(html, /<ul>\s*<li>One<\/li>\s*<li>Two<\/li>\s*<\/ul>/);
});

test('HTML-first mixed content parses subsequent Markdown blocks', () => {
  const html = renderArticleContent('<p>HTML introduction.</p>\n\n- **One**\n- [Two](/contact)');
  assert.match(html, /<p>HTML introduction\.<\/p>/);
  assert.match(html, /<li><strong>One<\/strong><\/li>/);
  assert.match(html, /<li><a href="\/contact">Two<\/a><\/li>/);
});

test('plain prose before HTML still recognizes a following Markdown list', () => {
  const html = renderArticleContent('Introduction.\n\n<h2>Conditions</h2>\n\n- One\n- Two');
  assert.match(html, /<p>Introduction\.<\/p>/);
  assert.match(html, /<ul>\s*<li>One<\/li>\s*<li>Two<\/li>\s*<\/ul>/);
});

test('Markdown headings, tables, lists and links produce HTML and retain a single page H1', () => {
  const html = renderArticleContent('# Selection\n\n| Material | Test |\n| --- | --- |\n| FFKM | Plasma |\n\n- [Contact](/contact)\n- **Drawing**');
  assert.match(html, /<h2>Selection<\/h2>/);
  assert.match(html, /<table>/);
  assert.match(html, /<ul>/);
  assert.match(html, /href="\/contact"/);
  assert.match(html, /<strong>Drawing<\/strong>/);
  assert.doesNotMatch(html, /<h1>/);
});

test('mixed Markdown and HTML preserves body text and removes executable elements', () => {
  const html = renderArticleContent('# Selection\n\n<h3>Conditions</h3>\n<p>Retain this text.</p>\n<script>alert(1)</script>');
  assert.match(html, /<h3>Conditions<\/h3>/);
  assert.match(html, /<p>Retain this text\.<\/p>/);
  assert.doesNotMatch(html, /<script|alert\(1\)/);
});

test('Markdown rejects script/data URLs, event handlers and unsafe images', () => {
  const html = renderArticleContent('# Selection\n\n[Bad](javascript:alert%281%29)\n\n<a href="java&#x09;script:alert(1)" onclick="alert(1)">Bad HTML</a>\n\n![Bad](data:image/svg+xml,test)\n\n[Email](mailto:contact@rubberq.com)');
  assert.doesNotMatch(html, /javascript:|java\s+script:|data:|onclick=|<img/);
  assert.match(html, /mailto:contact@rubberq.com/);
});

test('Portable Text renders paragraphs, marks, line breaks and safe links', () => {
  const html = renderArticleContent([block('<safe>\nText', { children: [{ _type: 'span', text: '<safe>\nText', marks: ['strong', 'link1'] }], markDefs: [{ _key: 'link1', _type: 'link', href: 'https://rubberq.com/contact' }] }), block('Heading', { style: 'h3' })]);
  assert.match(html, /<p><a href="https:\/\/rubberq.com\/contact"><strong>&lt;safe&gt;<br\/>Text<\/strong><\/a><\/p>/);
  assert.match(html, /<h3>Heading<\/h3>/);
  assert.doesNotMatch(html, /\[object Object\]/);
});

test('Portable Text keeps contiguous and nested lists structurally valid', () => {
  const html = renderArticleContent([block('A', { listItem: 'bullet' }), block('Child', { listItem: 'bullet', level: 2 }), block('B', { listItem: 'bullet' }), block('C', { listItem: 'number' }), block('End')]);
  assert.equal(html, '<ul><li>A<ul><li>Child</li></ul></li><li>B</li></ul><ol><li>C</li></ol><p>End</p>');
});

test('Portable Text uses Sanity image references and refuses malicious links or image URLs', () => {
  const html = renderArticleContent([block('Keep text', { children: [{ _type: 'span', text: 'Keep text', marks: ['bad'] }], markDefs: [{ _key: 'bad', _type: 'link', href: 'javascript:alert(1)' }] }), { _type: 'image', asset: { _ref: 'image-abcdef-800x600-webp' }, alt: 'Test <image>', caption: 'Caption' }, { _type: 'image', url: 'data:image/svg+xml,test' }]);
  assert.match(html, /cdn\.sanity\.io\/images\/tcjl4afv\/production\/abcdef-800x600\.webp/);
  assert.match(html, /alt="Test &lt;image&gt;"/);
  assert.match(html, /<figcaption>Caption<\/figcaption>/);
  assert.match(html, /<p>Keep text<\/p>/);
  assert.doesNotMatch(html, /javascript:|data:/);
});

test('empty and unsupported content types do not stringify objects', () => {
  for (const value of [undefined, null, '', {}, 123, [], [null, {}]]) assert.equal(renderArticleContent(value), '');
  assert.equal(renderArticleContent([block('Item', { listItem: 'bullet' }), null, block('After')]), '<ul><li>Item</li></ul><p>After</p>');
});
