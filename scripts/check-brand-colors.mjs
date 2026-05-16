import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'tailwind.config.js'];

const allowedHex = new Set([
  '#ffffff',
  '#fafafa',
  '#f5f5f5',
  '#e5e5e5',
  '#d4d4d4',
  '#a3a3a3',
  '#737373',
  '#525252',
  '#404040',
  '#262626',
  '#171717',
  '#0a0a0a',
  '#050505',
  '#f97316',
]);

const disallowedPalette =
  '(?:slate|blue|indigo|cyan|sky|violet|purple|red|green|yellow|emerald|teal|lime|amber|rose|pink|fuchsia|gray)';
const classPattern = new RegExp(
  String.raw`(?:^|[\s"'` + '`' + String.raw`:{])(?:[a-z-]+:)*(?:bg|text|border|from|to|via|ring|stroke|fill|decoration|outline)-${disallowedPalette}-\d{2,3}(?:\/\d+)?`,
  'g',
);
const prosePattern = new RegExp(String.raw`prose-${disallowedPalette}`, 'g');
const tokenPattern = /\b(?:blue|green|red|yellow|amber|slate|gray)\s*:/g;
const hexPattern = /#[0-9a-fA-F]{6}\b/g;

const files = [];

function collect(path) {
  const fullPath = join(root, path);
  const stat = statSync(fullPath);

  if (stat.isDirectory()) {
    for (const entry of readdirSync(fullPath)) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.astro') continue;
      collect(join(path, entry));
    }
    return;
  }

  if (/\.(astro|css|js|jsx|mjs|ts|tsx)$/.test(path)) {
    files.push(fullPath);
  }
}

for (const path of scanRoots) collect(path);

const violations = [];

for (const file of files) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  const patterns = [
    ['disallowed Tailwind palette class', classPattern],
    ['disallowed typography palette', prosePattern],
    ['disallowed color token name', rel === 'tailwind.config.js' ? tokenPattern : null],
  ];

  for (const [label, pattern] of patterns) {
    if (!pattern) continue;
    for (const match of text.matchAll(pattern)) {
      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${rel}:${line} ${label}: ${match[0].trim()}`);
    }
  }

  for (const match of text.matchAll(hexPattern)) {
    const hex = match[0].toLowerCase();
    if (!allowedHex.has(hex)) {
      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${rel}:${line} disallowed hex color: ${match[0]}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Brand color check failed. RubberQ site colors are locked to brand orange, rubber black, white, and neutral rubber grayscale.');
  console.error('Use Tailwind tokens such as accent-orange and industrial-50..950. Do not add blue/slate/semantic color palettes.');
  console.error('');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('Brand color check passed.');
