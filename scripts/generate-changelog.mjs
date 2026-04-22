#!/usr/bin/env node
// versions.json → CHANGELOG.md 생성
// 사용: node scripts/generate-changelog.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const data = JSON.parse(
  await fs.readFile(path.join(ROOT, 'packages/changelog/versions.json'), 'utf-8'),
);

const sections = data.versions.map((v) => {
  const lines = [];
  lines.push(`## [v${v.version}](${v.url}) — ${v.title}`);
  lines.push('');
  lines.push(`_${v.date} · ${v.type}_`);
  lines.push('');
  if (v.highlights?.length) {
    for (const h of v.highlights) lines.push(`- ${h}`);
    lines.push('');
  }
  return lines.join('\n');
});

const content = [
  '# Changelog',
  '',
  '이 파일은 `packages/changelog/versions.json` 으로부터 자동 생성된다.',
  '편집하지 말 것 — `pnpm gen:changelog` 로 재생성.',
  '',
  sections.join('\n'),
].join('\n');

await fs.writeFile(path.join(ROOT, 'CHANGELOG.md'), content);
console.log(`CHANGELOG.md 갱신 완료 (${data.versions.length} 개 엔트리)`);
