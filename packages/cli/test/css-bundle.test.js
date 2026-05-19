import { describe, it, expect } from 'vitest';
import {
  upsertSection,
  removeSection,
  listSections,
  stripStylesImport,
  isStyleFile,
  isTsxFile,
  hasCrossComponentImport,
  rewriteCrossComponentImports,
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

describe('hasCrossComponentImport', () => {
  it.each([
    ['import { Popover } from "../popover";', true],
    ['import { Popover } from "../popover/index.tsx";', true],
    ['import type { T } from "../form/types";', true],
    ['} from "../select";', true],
    ['export { X } from "../code-panel";', true],
    ['import { cn } from "@SH_UI_UTILS@";', false],
    ['import "./styles.css";', false],
    ['import { Field } from "./field";', false],
    ['import * as React from "react";', false],
    ['import x from "../../escape";', false],
  ])('%s → %s', (src, expected) => {
    expect(hasCrossComponentImport(src)).toBe(expected);
  });
});

describe('rewriteCrossComponentImports', () => {
  const ALIAS = '@workspace/ui-core/components';

  it('확장자 없는 형제 import → alias', () => {
    expect(
      rewriteCrossComponentImports(
        'import { Popover, PopoverContent } from "../popover";',
        ALIAS,
      ),
    ).toBe('import { Popover, PopoverContent } from "@workspace/ui-core/components/popover";');
  });

  it('레거시 명시적 /index.tsx 확장자 → alias (확장자 제거, NodeNext TS5097 회피)', () => {
    expect(
      rewriteCrossComponentImports(
        'import { Popover } from "../popover/index.tsx";',
        ALIAS,
      ),
    ).toBe('import { Popover } from "@workspace/ui-core/components/popover";');
  });

  it('subpath 보존 (../form/types → alias/form/types)', () => {
    expect(
      rewriteCrossComponentImports('import type { T } from "../form/types";', ALIAS),
    ).toBe('import type { T } from "@workspace/ui-core/components/form/types";');
  });

  it('멀티라인 named import 의 닫는 줄 `} from "../select"` 도 재작성', () => {
    const src = 'import {\n  Select,\n  SelectItem,\n} from "../select";';
    expect(rewriteCrossComponentImports(src, ALIAS)).toBe(
      'import {\n  Select,\n  SelectItem,\n} from "@workspace/ui-core/components/select";',
    );
  });

  it('re-export 도 재작성', () => {
    expect(
      rewriteCrossComponentImports('export { CodeEditor } from "../code-editor";', ALIAS),
    ).toBe('export { CodeEditor } from "@workspace/ui-core/components/code-editor";');
  });

  it('같은 디렉터리/패키지 import 는 불변', () => {
    const src =
      'import { cn } from "@SH_UI_UTILS@";\nimport "./styles.css";\nimport { Field } from "./field";\nimport * as React from "react";';
    expect(rewriteCrossComponentImports(src, ALIAS)).toBe(src);
  });

  it('alias 미설정(falsy)이면 그대로 반환 (remove.mjs best-effort replay 대칭)', () => {
    const src = 'import { Popover } from "../popover";';
    expect(rewriteCrossComponentImports(src, undefined)).toBe(src);
    expect(rewriteCrossComponentImports(src, '')).toBe(src);
  });

  it('add→remove 대칭: 같은 alias 로 재작성하면 결과가 안정 (idempotent)', () => {
    const once = rewriteCrossComponentImports(
      'import { Popover } from "../popover";',
      ALIAS,
    );
    expect(rewriteCrossComponentImports(once, ALIAS)).toBe(once);
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
