import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'public/llms.txt', 'docs/content'].filter((path) => existsSync(join(root, path)));
const filePattern = /\.(astro|md|mdx|json|txt|ts|tsx)$/;

const blockedPatterns = [
  ['Japanese partner company name must stay private', /\bJ&C\b|J&C 株式会社/],
  ['medical market direction is no longer public-facing', /\bmedical\b|\bMedical\b|implant/i],
  ['FDA/ISO 13485 should not appear in public copy', /\bFDA\b|ISO\s*13485/i],
  ['old robotics positioning should not appear in public copy', /\b(?:industrial|legacy|general)\s+robotics\b/i],
  ['old AI/data-center positioning should not appear in public copy', /\bAI\s+(?:hardware|infrastructure)\b/i],
  ['unconfirmed EV high-voltage component examples are blocked', /\bbattery\s+pack\s+(?:cells?|module)\b|\bPDU\b|\bBMS\b/i],
  ['old founding-year/age claims are blocked', /\bSince\s+1990\b|\b1990\b|\b35\s+years\b/i],
  ['prototype timing must be scoped, not promised as 3-5 days', /Prototype\s+3-5\s+days|Rapid prototyping\s*\(3-5 days\)/i],
  ['do not promise new compound development in four weeks', /new compound from scratch in 4 weeks/i],
];

const files = [];

function collect(path) {
  const fullPath = join(root, path);
  const stat = statSync(fullPath);

  if (stat.isDirectory()) {
    for (const entry of readdirSync(fullPath)) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.astro' || entry === '.git') continue;
      collect(join(path, entry));
    }
    return;
  }

  if (filePattern.test(path)) {
    files.push(fullPath);
  }
}

for (const path of scanRoots) collect(path);

const violations = [];

for (const file of files) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');

  if (rel.endsWith('.json')) {
    try {
      const parsed = JSON.parse(text);
      scanJsonStrings(parsed, rel);
      continue;
    } catch {
      // Fall through to raw text scanning if a JSON file is malformed.
    }
  }

  scanText(text, rel);
}

function scanText(text, rel) {
  for (const [label, pattern] of blockedPatterns) {
    const flags = `${pattern.flags.includes('i') ? 'i' : ''}g`;
    for (const match of text.matchAll(new RegExp(pattern.source, flags))) {
      const line = text.slice(0, match.index).split('\n').length;
      violations.push(`${rel}:${line} ${label}: ${match[0]}`);
    }
  }
}

function scanJsonStrings(value, rel, path = '$') {
  if (typeof value === 'string') {
    for (const [label, pattern] of blockedPatterns) {
      const match = value.match(pattern);
      if (match) {
        violations.push(`${rel}:${path} ${label}: ${match[0]}`);
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanJsonStrings(item, rel, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      scanJsonStrings(child, rel, `${path}.${key}`);
    }
  }
}

if (violations.length > 0) {
  console.error('Public redline check failed. Clean visitor-facing copy before build/deploy.');
  console.error('');
  console.error(violations.join('\n'));
  process.exit(1);
}

console.log('Public redline check passed.');
