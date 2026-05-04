import { describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * 각 템플릿에서 tokens 파일과 해당 파일이 가져야 하는 마커 섹션을 나열.
 * 새 템플릿이 생기면 여기에 엔트리 추가.
 */
const TOKEN_FILES = [
  {
    // FSD overlay — Layer 3 부터 _arch/fsd/ 아래로 이동.
    path: 'nextjs-standalone/_arch/fsd/src/shared/styles/tokens.css',
    commentPair: ['/*', '*/'],
  },
  {
    // flat overlay — Layer 3 신규.
    path: 'nextjs-standalone/_arch/flat/lib/styles/tokens.css',
    commentPair: ['/*', '*/'],
  },
  {
    path: 'ui-app-template/src/styles/tokens.css',
    commentPair: ['/*', '*/'],
  },
  {
    path: 'flutter-standalone/lib/sh_ui/foundation/sh_ui_tokens.dart',
    commentPair: ['//', ''],
  },
];

const REQUIRED_SECTIONS = ['theme-colors', 'theme-radius'];

const makeMarker = (commentPair, label) => {
  const [open, close] = commentPair;
  return close
    ? `${open} sh-ui:${label} ${close}`
    : `${open} sh-ui:${label}`;
};

describe('템플릿 theme 마커', () => {
  for (const file of TOKEN_FILES) {
    for (const section of REQUIRED_SECTIONS) {
      const startMarker = makeMarker(file.commentPair, `${section}-start`);
      const endMarker = makeMarker(file.commentPair, `${section}-end`);

      it(`${file.path} 에 ${section} 마커 쌍이 있어야 함`, async () => {
        const abs = path.join(TEMPLATES_DIR, file.path);
        const content = await fs.readFile(abs, 'utf-8');
        expect(content).toContain(startMarker);
        expect(content).toContain(endMarker);
        expect(content.indexOf(startMarker)).toBeLessThan(content.indexOf(endMarker));
      });
    }
  }
});
