#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { normalizeTarget } from './audit-helpers.mjs';

const target = normalizeTarget();
const scripts = [
  'canonical-hreflang-sitemap-audit.mjs',
  'crawler-access-audit.mjs',
  'rendered-html-audit.mjs',
];

for (const script of scripts) {
  const scriptPath = path.join('scripts', 'seo', script);
  console.log(`\n> node ${scriptPath} ${target}`);
  const result = spawnSync(process.execPath, [scriptPath, target], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log(`\nTechnical SEO audit suite passed at ${target}.`);

