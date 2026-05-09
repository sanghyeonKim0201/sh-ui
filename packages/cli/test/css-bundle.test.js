import { describe, it, expect } from 'vitest';
import {
  upsertSection,
  removeSection,
  listSections,
  stripStylesImport,
  isStyleFile,
  isTsxFile,
} from '../src/css-bundle.mjs';

describe('upsertSection', () => {
  it('빈 번들에 첫 섹션 append', () => {
    const out = upsertSection('', 'button', '.sh-ui-button { color: red; }');
    expect(out).toContain('/* sh-ui:component:button-start */');
    expect(out).toContain('/* sh-ui:component:button-end */');
    expect(out).toContain('.sh-ui-button { color: red; }');
  });

  it('기존 섹션 있으면 안 내용만 교체 (마커 보존)', () => {
    let bundle = upsertSection('', 'button', '.sh-ui-button { color: red; }');
    bundle = upsertSection(bundle, 'button', '.sh-ui-button { color: blue; }');
    expect(bundle).toContain('color: blue');
    expect(bundle).not.toContain('color: red');
    // 마커는 한 쌍만 있어야 함
    const startCount = (bundle.match(/sh-ui:component:button-start/g) || []).length;
    expect(startCount).toBe(1);
  });

  it('다른 컴포넌트 섹션은 보존', () => {
    let bundle = upsertSection('', 'button', '.sh-ui-button {}');
    bundle = upsertSection(bundle, 'card', '.sh-ui-card {}');
    bundle = upsertSection(bundle, 'button', '.sh-ui-button { padding: 1rem; }');
    expect(bundle).toContain('.sh-ui-card');
    expect(bundle).toContain('padding: 1rem');
  });

  it('마커 밖의 사용자 custom CSS 보존', () => {
    const userCustom = '/* my brand override */\n.brand-banner { background: gold; }\n';
    const bundle = upsertSection(userCustom, 'button', '.sh-ui-button {}');
    expect(bundle).toContain('.brand-banner');
    expect(bundle).toContain('.sh-ui-button');
  });
});

describe('removeSection', () => {
  it('해당 컴포넌트 섹션만 제거', () => {
    let bundle = upsertSection('', 'button', '.sh-ui-button {}');
    bundle = upsertSection(bundle, 'card', '.sh-ui-card {}');
    const out = removeSection(bundle, 'button');
    expect(out).not.toContain('sh-ui:component:button');
    expect(out).toContain('sh-ui:component:card');
  });

  it('없는 섹션은 noop', () => {
    const bundle = upsertSection('', 'button', '.x {}');
    expect(removeSection(bundle, 'card')).toBe(bundle);
  });
});

describe('listSections', () => {
  it('등록된 컴포넌트 이름 추출', () => {
    let bundle = upsertSection('', 'button', '.x {}');
    bundle = upsertSection(bundle, 'card', '.y {}');
    bundle = upsertSection(bundle, 'dropdown-menu', '.z {}');
    expect(listSections(bundle).sort()).toEqual(['button', 'card', 'dropdown-menu']);
  });
});

describe('stripStylesImport', () => {
  it('relative styles.css import 제거', () => {
    const before = `import * as React from "react";
import "./styles.css";
export const X = 1;`;
    const after = stripStylesImport(before);
    expect(after).not.toContain('./styles.css');
    expect(after).toContain('export const X = 1;');
  });

  it('module / quote 변종도 제거', () => {
    const before = `import './styles.module.css';
import "./styles.css";`;
    expect(stripStylesImport(before).trim()).toBe('');
  });

  it('다른 import 는 보존', () => {
    const before = `import "./styles.css";
import { foo } from "@/lib/x";`;
    const after = stripStylesImport(before);
    expect(after).toContain('@/lib/x');
    expect(after).not.toContain('./styles.css');
  });
});

describe('isStyleFile / isTsxFile', () => {
  it.each([
    ['components/button/styles.css', true, false],
    ['components/button/styles.module.css', true, false],
    ['components/button/styles.css.ts', true, false],
    ['components/button/index.tsx', false, true],
    ['components/button/index.tailwind.tsx', false, true],
  ])('%s — style=%s tsx=%s', (src, expectStyle, expectTsx) => {
    expect(isStyleFile({ src })).toBe(expectStyle);
    expect(isTsxFile({ src })).toBe(expectTsx);
  });
});
