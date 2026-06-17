# sh-ui DX 발견성 quick wins — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sh-ui CLI에 서브명령별 `--help`와 오타 추천(did-you-mean)을 추가해 명령·플래그·컴포넌트 발견성을 높인다.

**Architecture:** 의존성 없는 순수 유틸(`levenshtein.mjs`)을 먼저 만들고, 컴포넌트/명령 not-found 지점에 추천을 결합한다. 각 명령 모듈은 `create`의 관행대로 `export const HELP_TEXT`를 갖고, 얇은 라우터 `bin/sh-ui.mjs`가 `--help`를 가로채 출력한다.

**Tech Stack:** Node.js ESM(`.mjs`), vitest(`test/*.test.js`), 외부 의존성 추가 없음.

**작업 디렉토리:** 모든 경로는 `packages/cli/` 기준. 테스트 실행은 `packages/cli`에서 `pnpm test` (= `vitest run`). 단일 파일은 `pnpm vitest run test/<name>.test.js`.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/levenshtein.mjs` (신규) | 순수 함수. `levenshtein(a,b)` 편집거리 + `suggest(input, candidates, opts)` 후보 제안. CLI/registry를 모름. |
| `test/levenshtein.test.js` (신규) | 유틸 단위 테스트. |
| `src/add.mjs` (수정) | standalone 경로 컴포넌트 not-found 에러에 추천 결합. |
| `src/create/generator.js` (수정) | monorepo `addComponent` not-found에 추천 결합. |
| `src/remove.mjs` (수정) | 설치/레지스트리 not-found 보고에 추천 결합. |
| `test/did-you-mean.test.js` (신규) | not-found 메시지에 추천이 포함되는지 검증. |
| `src/init.mjs` 외 10개 명령 모듈 (수정) | `export const HELP_TEXT` 추가. |
| `bin/sh-ui.mjs` (수정) | 각 `case`에 `--help` 가드, `default`에 명령 추천. |
| `test/help-text.test.js` (신규) | 각 명령 `HELP_TEXT` 상수에 핵심 플래그 포함 검증. |
| `packages/changelog/versions.json` (수정) | 릴리즈 엔트리 prepend. |
| `packages/cli/package.json` (수정) | version 동기화. |

---

## Task 1: Levenshtein 유틸 (순수 함수)

**Files:**
- Create: `packages/cli/src/levenshtein.mjs`
- Test: `packages/cli/test/levenshtein.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`packages/cli/test/levenshtein.test.js`:

```js
import { describe, it, expect } from 'vitest';

const { levenshtein, suggest } = await import('../src/levenshtein.mjs');

describe('levenshtein', () => {
  it('동일 문자열은 0', () => {
    expect(levenshtein('button', 'button')).toBe(0);
  });
  it('한 글자 삭제는 1', () => {
    expect(levenshtein('buton', 'button')).toBe(1);
  });
  it('치환 거리', () => {
    expect(levenshtein('cat', 'cot')).toBe(1);
  });
  it('빈 문자열은 상대 길이', () => {
    expect(levenshtein('', 'abc')).toBe(3);
  });
});

describe('suggest', () => {
  const components = ['button', 'badge', 'card', 'checkbox', 'select'];

  it('가까운 오타에 후보 1개', () => {
    expect(suggest('buton', components)).toEqual(['button']);
  });
  it('거리 초과면 빈 배열', () => {
    expect(suggest('zzzzzz', components)).toEqual([]);
  });
  it('여러 근접 후보는 거리 오름차순, 최대 max개', () => {
    // 'chekbox'(→checkbox 거리1). 'card','badge'는 거리>2라 제외.
    expect(suggest('chekbox', components, { max: 3 })).toEqual(['checkbox']);
  });
  it('정확히 일치하면 그 자신 (거리 0)', () => {
    expect(suggest('card', components)).toEqual(['card']);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/cli && pnpm vitest run test/levenshtein.test.js`
Expected: FAIL — `Cannot find module '../src/levenshtein.mjs'`

- [ ] **Step 3: 최소 구현 작성**

`packages/cli/src/levenshtein.mjs`:

```js
// 의존성 없는 편집거리 + 후보 제안. diff.mjs 가 LCS 를 자체 구현한 관행을 따른다.

/** 두 문자열의 Levenshtein 편집거리 (삽입/삭제/치환 비용 1). */
export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * input 과 가까운 candidates 를 거리 오름차순으로 반환.
 * @param {string} input
 * @param {string[]} candidates
 * @param {{max?: number, maxDistance?: number}} [opts]
 * @returns {string[]} 거리 <= maxDistance 인 후보 상위 max 개 (없으면 빈 배열)
 */
export function suggest(input, candidates, { max = 3, maxDistance = 2 } = {}) {
  return candidates
    .map((name) => ({ name, dist: levenshtein(input, name) }))
    .filter((c) => c.dist <= maxDistance)
    .sort((a, b) => a.dist - b.dist || a.name.localeCompare(b.name))
    .slice(0, max)
    .map((c) => c.name);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/cli && pnpm vitest run test/levenshtein.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/cli/src/levenshtein.mjs packages/cli/test/levenshtein.test.js
git commit -m "feat(cli): 의존성 없는 levenshtein/suggest 유틸 추가"
```

---

## Task 2: add 컴포넌트 not-found 추천 (standalone 경로)

**Files:**
- Modify: `packages/cli/src/add.mjs:344-349` (내부 `addComponent` 함수)
- Test: `packages/cli/test/did-you-mean.test.js`

**배경:** `src/add.mjs`의 내부 함수 `addComponent`(339행)는 not-found 시
`throw new Error("'${name}' 컴포넌트를 ${config.platform} 레지스트리에서 찾을 수 없습니다.")`만 던진다(344-349행).
여기에 registry 키 대상 `suggest`를 결합한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`packages/cli/test/did-you-mean.test.js` (신규 — 이후 Task 3·4에서 case 추가):

```js
import { describe, it, expect } from 'vitest';

const { buildNotFoundMessage } = await import('../src/add.mjs');

describe('buildNotFoundMessage (add)', () => {
  const names = ['button', 'badge', 'card', 'select'];

  it('가까운 오타면 추천 포함', () => {
    const msg = buildNotFoundMessage('buton', 'react', names);
    expect(msg).toContain("'buton'");
    expect(msg).toContain('button');
    expect(msg).toContain('sh-ui list --all');
  });

  it('후보 없으면 목록 안내만', () => {
    const msg = buildNotFoundMessage('zzzz', 'react', names);
    expect(msg).toContain("'zzzz'");
    expect(msg).not.toMatch(/혹시/);
    expect(msg).toContain('sh-ui list --all');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/cli && pnpm vitest run test/did-you-mean.test.js`
Expected: FAIL — `buildNotFoundMessage` is not a function (export 없음)

- [ ] **Step 3: 최소 구현 — `add.mjs`에 헬퍼 추가 후 not-found에서 사용**

`src/add.mjs` 상단 import 부근에 추가:

```js
import { suggest } from "./levenshtein.mjs";
```

`src/add.mjs`에 export 헬퍼 추가(파일 어디든 최상위, 예: `addComponent` 함수 정의 직전):

```js
/** 컴포넌트 not-found 에러 메시지. 가까운 후보가 있으면 "혹시 …?" 를 덧붙인다. */
export function buildNotFoundMessage(name, platform, candidates) {
  const hits = suggest(name, candidates);
  const hint = hits.length ? ` 혹시 ${hits.join(", ")}?` : "";
  return (
    `'${name}' 컴포넌트를 ${platform} 레지스트리에서 찾을 수 없습니다.${hint}` +
    ` 전체 목록: sh-ui list --all`
  );
}
```

`src/add.mjs:344-349`의 not-found 블록을 교체:

```js
  const entry = registry.components?.[name];
  if (!entry) {
    throw new Error(
      buildNotFoundMessage(name, config.platform, Object.keys(registry.components ?? {})),
    );
  }
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/cli && pnpm vitest run test/did-you-mean.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add packages/cli/src/add.mjs packages/cli/test/did-you-mean.test.js
git commit -m "feat(cli): add 컴포넌트 not-found 시 did-you-mean 추천"
```

---

## Task 3: monorepo addComponent not-found 추천

**Files:**
- Modify: `packages/cli/src/create/generator.js` (`addComponent`, 680행~)
- Test: `packages/cli/test/did-you-mean.test.js` (case 추가)

**배경:** monorepo 경로는 `bin/sh-ui.mjs:96-105`가 `generator.js`의 `addComponent`를 호출한다.
이 함수의 컴포넌트 not-found 처리를 Task 2의 `buildNotFoundMessage`와 동일 메시지로 통일한다.

- [ ] **Step 1: generator.js의 not-found 지점 확인**

Run: `cd packages/cli && grep -n "components?\.\[\|컴포넌트\|찾을 수 없\|registry.components" src/create/generator.js`
Expected: `addComponent`(680행 이후) 내부에서 registry 엔트리를 조회하는 줄을 찾는다. not-found 분기가 없으면(엔트리 undefined를 그냥 진행) Step 3에서 명시적 분기를 추가한다.

- [ ] **Step 2: 실패하는 테스트 작성** — `test/did-you-mean.test.js`에 case 추가

```js
describe('buildNotFoundMessage 공유 (monorepo)', () => {
  it('add.mjs 헬퍼를 generator 도 재사용한다', async () => {
    const { buildNotFoundMessage } = await import('../src/add.mjs');
    const msg = buildNotFoundMessage('seelct', 'react', ['select', 'button']);
    expect(msg).toContain('select');
  });
});
```

> 참고: 이 테스트는 Task 2의 export를 재확인하는 가드다. generator.js가 같은 헬퍼를 import해 쓰는지는 Step 3 구현에서 보장한다.

- [ ] **Step 3: 구현 — generator.js가 동일 헬퍼 사용**

`src/create/generator.js` 상단 import에 추가:

```js
import { buildNotFoundMessage } from '../add.mjs';
```

Step 1에서 찾은 `addComponent` 내부 registry 조회 직후에 not-found 분기를 추가(이미 있으면 메시지만 교체):

```js
    const entry = registry.components?.[name];
    if (!entry) {
      throw new Error(
        buildNotFoundMessage(name, config.platform, Object.keys(registry.components ?? {})),
      );
    }
```

> `config.platform`/`registry` 변수명은 generator.js의 `addComponent` 내 실제 식별자에 맞춘다(Step 1에서 확인). 레지스트리 로드 변수가 다른 이름이면 그 이름을 쓴다.

- [ ] **Step 4: 테스트 + 회귀 확인**

Run: `cd packages/cli && pnpm vitest run test/did-you-mean.test.js`
Expected: PASS

Run: `cd packages/cli && pnpm test`
Expected: 전체 PASS (기존 테스트 회귀 없음)

- [ ] **Step 5: 커밋**

```bash
git add packages/cli/src/create/generator.js packages/cli/test/did-you-mean.test.js
git commit -m "feat(cli): monorepo addComponent not-found 추천 통일"
```

---

## Task 4: 알 수 없는 최상위 명령 추천

**Files:**
- Modify: `packages/cli/bin/sh-ui.mjs:283-286` (`default` 분기)
- Test: `packages/cli/test/did-you-mean.test.js` (case 추가)

**배경:** `sh-ui ad` 같은 오타 명령은 현재 "알 수 없는 명령" + 전역 usage만 출력한다(284행).
명령 목록 대상 추천을 추가한다. 명령 목록은 bin과 테스트가 공유하도록 별도 export 한다.

- [ ] **Step 1: 실패하는 테스트 작성** — `test/did-you-mean.test.js`에 추가

```js
describe('명령 추천', () => {
  it('KNOWN_COMMANDS 가 노출되고 add 를 포함', async () => {
    const { KNOWN_COMMANDS } = await import('../src/commands.mjs');
    expect(KNOWN_COMMANDS).toContain('add');
    expect(KNOWN_COMMANDS).toContain('create');
  });

  it('오타 명령에 가까운 후보를 제안', async () => {
    const { suggest } = await import('../src/levenshtein.mjs');
    const { KNOWN_COMMANDS } = await import('../src/commands.mjs');
    expect(suggest('ad', KNOWN_COMMANDS)).toContain('add');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/cli && pnpm vitest run test/did-you-mean.test.js`
Expected: FAIL — `Cannot find module '../src/commands.mjs'`

- [ ] **Step 3: 구현 — 명령 목록 모듈 + bin default 추천**

`packages/cli/src/commands.mjs` (신규):

```js
// CLI 최상위 명령 목록 — bin 라우터와 did-you-mean 추천이 공유.
export const KNOWN_COMMANDS = [
  "create", "init", "add", "list", "doctor", "upgrade-cli",
  "theme", "tokens", "mcp", "rename-app", "migrate", "migrate-v065",
  "remove", "rm",
];
```

`bin/sh-ui.mjs`의 import에 추가:

```js
import { suggest } from "../src/levenshtein.mjs";
import { KNOWN_COMMANDS } from "../src/commands.mjs";
```

`bin/sh-ui.mjs:283-286`의 `default` 분기를 교체:

```js
    default: {
      const hits = suggest(cmd, KNOWN_COMMANDS);
      console.error(`알 수 없는 명령: ${cmd}` + (hits.length ? ` — 혹시 ${hits.join(", ")}?` : "") + "\n");
      console.error(usage);
      process.exit(1);
    }
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/cli && pnpm vitest run test/did-you-mean.test.js`
Expected: PASS

수동 확인: `cd packages/cli && node bin/sh-ui.mjs ad`
Expected: `알 수 없는 명령: ad — 혹시 add?` 출력 후 usage.

- [ ] **Step 5: 커밋**

```bash
git add packages/cli/src/commands.mjs packages/cli/bin/sh-ui.mjs packages/cli/test/did-you-mean.test.js
git commit -m "feat(cli): 알 수 없는 명령에 did-you-mean 추천"
```

---

## Task 5: HELP_TEXT 패턴 확립 — init + bin 가드

**Files:**
- Modify: `packages/cli/src/init.mjs` (`HELP_TEXT` export 추가)
- Modify: `packages/cli/bin/sh-ui.mjs` (`init` case에 `--help` 가드)
- Test: `packages/cli/test/help-text.test.js` (신규)

**배경:** `init`을 대표로 패턴을 확립한다 — 모듈이 `export const HELP_TEXT`, bin이 `--help`면 출력 후 break. 이후 Task 6에서 나머지 명령에 같은 패턴을 반복한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`packages/cli/test/help-text.test.js` (신규):

```js
import { describe, it, expect } from 'vitest';

describe('HELP_TEXT — init', () => {
  it('핵심 플래그를 포함', async () => {
    const { HELP_TEXT } = await import('../src/init.mjs');
    expect(HELP_TEXT).toContain('sh-ui init');
    for (const flag of ['--platform', '--base', '--radius', '--mode', '--cssFramework', '--force', '--yes']) {
      expect(HELP_TEXT).toContain(flag);
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/cli && pnpm vitest run test/help-text.test.js`
Expected: FAIL — `HELP_TEXT` is undefined

- [ ] **Step 3: 구현 — init.mjs에 HELP_TEXT, bin에 가드**

`src/init.mjs`에 export 추가(파일 상단, `init` 함수 전):

```js
export const HELP_TEXT = `sh-ui init — sh-ui.config.json 생성 (기존 프로젝트에 sh-ui 얹기)

사용법:
  sh-ui init [options]

옵션:
  --platform <react|flutter>   타겟 플랫폼
  --base <neutral|zinc|...>    색 베이스
  --radius <none|sm|md|lg|xl|full>  모서리 반경
  --mode <light|dark|light-dark>    색 모드
  --cssFramework <plain|tailwind|css-modules|vanilla-extract>  CSS 전략
  --force                      기존 sh-ui.config.json 덮어쓰기
  --yes                        대화형 프롬프트 생략 (기본값 채택)

예:
  sh-ui init
  sh-ui init --platform react --base neutral --mode light-dark --yes
`;
```

`bin/sh-ui.mjs`의 `case "init":` 를 교체:

```js
    case "init":
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/init.mjs");
        console.log(HELP_TEXT);
        break;
      }
      await init({ cwd: process.cwd(), args: rest });
      break;
```

- [ ] **Step 4: 테스트 통과 + 수동 확인**

Run: `cd packages/cli && pnpm vitest run test/help-text.test.js`
Expected: PASS

수동: `cd packages/cli && node bin/sh-ui.mjs init --help`
Expected: init HELP_TEXT 출력, 프롬프트 시작 안 함.

- [ ] **Step 5: 커밋**

```bash
git add packages/cli/src/init.mjs packages/cli/bin/sh-ui.mjs packages/cli/test/help-text.test.js
git commit -m "feat(cli): init --help + HELP_TEXT 패턴 확립"
```

---

## Task 6: 나머지 명령 HELP_TEXT + bin 가드

**Files:**
- Modify: `packages/cli/src/{add,list,remove,doctor,tokens-cmd,theme-extract,migrate-v065,migrate-bundled,rename-app,upgrade-cli}.mjs` + `src/mcp.mjs`
- Modify: `packages/cli/bin/sh-ui.mjs` (각 case에 `--help` 가드)
- Test: `packages/cli/test/help-text.test.js` (case 추가)

**배경:** Task 5의 패턴을 나머지 명령에 반복한다. 각 `HELP_TEXT`는 아래 표의 플래그/설명을 담는다(플래그 출처: [bin/sh-ui.mjs:10-50] 통합 usage). 그룹 명령(`tokens`/`theme`/`migrate`)은 서브명령을 설명한다.

각 명령의 HELP_TEXT가 반드시 포함해야 할 핵심 토큰:

| 명령 | 모듈 | HELP_TEXT 필수 포함 토큰 |
|---|---|---|
| add | `src/add.mjs` | `sh-ui add`, `--skip-install`, `--diff`, `--force`, `--keep`, `--app`, `tokens` |
| list | `src/list.mjs` | `sh-ui list`, `--all` |
| remove | `src/remove.mjs` | `sh-ui remove`, `--force`, `--dry-run` |
| doctor | `src/doctor.mjs` | `sh-ui doctor`, `config`, `tokens` |
| tokens | `src/tokens-cmd.mjs` | `sh-ui tokens`, `diff`, `upgrade`, `--apply`, `--replace` |
| theme | `src/theme-extract.mjs` | `sh-ui theme`, `extract`, `--out` |
| migrate-v065 | `src/migrate-v065.mjs` | `sh-ui migrate-v065`, `--apply`, `--dry-run` |
| migrate | `src/migrate-bundled.mjs` | `sh-ui migrate bundled`, `--apply`, `--bundle` |
| rename-app | `src/rename-app.mjs` | `sh-ui rename-app`, `<old>`, `<new>`, `--yes`, `--dry-run`, `--skip-install` |
| upgrade-cli | `src/upgrade-cli.mjs` | `sh-ui upgrade-cli`, `--apply` |
| mcp | `src/mcp.mjs` | `sh-ui mcp`, `init`, `--client` |

- [ ] **Step 1: 실패하는 테스트 작성** — `test/help-text.test.js`에 표 전체를 데이터 주도 검증으로 추가

```js
describe('HELP_TEXT — 전체 명령', () => {
  const cases = [
    ['../src/add.mjs', ['sh-ui add', '--skip-install', '--diff', '--force', '--keep', '--app', 'tokens']],
    ['../src/list.mjs', ['sh-ui list', '--all']],
    ['../src/remove.mjs', ['sh-ui remove', '--force', '--dry-run']],
    ['../src/doctor.mjs', ['sh-ui doctor', 'config', 'tokens']],
    ['../src/tokens-cmd.mjs', ['sh-ui tokens', 'diff', 'upgrade', '--apply', '--replace']],
    ['../src/theme-extract.mjs', ['sh-ui theme', 'extract', '--out']],
    ['../src/migrate-v065.mjs', ['sh-ui migrate-v065', '--apply', '--dry-run']],
    ['../src/migrate-bundled.mjs', ['sh-ui migrate bundled', '--apply', '--bundle']],
    ['../src/rename-app.mjs', ['sh-ui rename-app', '<old>', '<new>', '--yes', '--dry-run', '--skip-install']],
    ['../src/upgrade-cli.mjs', ['sh-ui upgrade-cli', '--apply']],
    ['../src/mcp.mjs', ['sh-ui mcp', 'init', '--client']],
  ];

  it.each(cases)('%s 의 HELP_TEXT 가 핵심 토큰을 포함', async (mod, tokens) => {
    const { HELP_TEXT } = await import(mod);
    expect(HELP_TEXT, `${mod} 에 HELP_TEXT export 필요`).toBeTypeOf('string');
    for (const t of tokens) expect(HELP_TEXT).toContain(t);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/cli && pnpm vitest run test/help-text.test.js`
Expected: FAIL — 각 모듈 `HELP_TEXT` undefined

- [ ] **Step 3: 구현 — 각 모듈에 HELP_TEXT 추가**

각 모듈 상단(주 export 함수 위)에 `export const HELP_TEXT = \`...\`` 를 추가한다. 본문은 다음 형식을 따른다 — 한 줄 설명 / 사용법 / 옵션 / 예시. 아래는 대표 2개의 전문이며, 나머지는 위 표의 필수 토큰을 같은 형식으로 담는다.

`src/add.mjs`:

```js
export const HELP_TEXT = `sh-ui add — 컴포넌트 소스를 프로젝트로 복사 + 필요한 패키지 자동 설치

사용법:
  sh-ui add <component...>
  sh-ui add tokens          설정 기반 토큰 파일 생성 (특수값)

옵션:
  --skip-install   외부 패키지 자동 설치 생략
  --diff           파일을 쓰지 않고 변경 내역(unified diff)만 출력
  --force          기존 파일을 모두 덮어쓰기 (prompt 없음)
  --keep           기존 파일을 모두 유지 (prompt 없음)
  --app <name>     monorepo 라우팅 시 대상 ui-{name} 명시

예:
  sh-ui add button
  sh-ui add button card --diff
  sh-ui add tokens
`;
```

`src/tokens-cmd.mjs`:

```js
export const HELP_TEXT = `sh-ui tokens — tokens.css 비교/업그레이드

사용법:
  sh-ui tokens diff                    tokens.css 와 buildTokens 결과 비교
  sh-ui tokens upgrade --apply         추가된 변수만 적용 (사용자 편집 보존)
  sh-ui tokens upgrade --replace       buildTokens 결과로 통째 덮어쓰기

예:
  sh-ui tokens diff
  sh-ui tokens upgrade --apply
`;
```

나머지 모듈(`list`, `remove`, `doctor`, `theme-extract`, `migrate-v065`, `migrate-bundled`, `rename-app`, `upgrade-cli`, `mcp`)도 동일 형식으로 작성하되, 위 표의 필수 토큰을 반드시 포함한다. 문구는 [bin/sh-ui.mjs:10-50]의 해당 항목 설명을 사용자 친화적으로 다듬어 쓴다.

- [ ] **Step 4: bin/sh-ui.mjs 각 case에 `--help` 가드 추가**

`add`, `list`, `remove`/`rm`, `doctor`, `upgrade-cli`, `theme`, `tokens`, `mcp`, `rename-app`, `migrate`, `migrate-v065` 각 `case` 진입부 첫 줄에 가드를 넣는다. 모듈에서 `HELP_TEXT`를 import(동적 import 유지)해 출력 후 `break`. 예(`add`):

```js
    case "add": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/add.mjs");
        console.log(HELP_TEXT);
        break;
      }
      // ... 기존 로직
    }
```

> 주의: `tokens`/`theme`/`migrate`는 `HELP_TEXT`가 각각 `tokens-cmd.mjs`/`theme-extract.mjs`/`migrate-bundled.mjs`에 있다. `case "theme"`에서 서브명령이 없거나 `--help`면 `theme-extract.mjs`의 HELP_TEXT를 출력한다. `remove`와 `rm`은 같은 case이므로 한 번만 가드.

- [ ] **Step 5: 테스트 + 전체 회귀 + 수동 확인**

Run: `cd packages/cli && pnpm vitest run test/help-text.test.js`
Expected: PASS (11 cases + Task 5의 init)

Run: `cd packages/cli && pnpm test`
Expected: 전체 PASS

수동: `node bin/sh-ui.mjs add --help` / `node bin/sh-ui.mjs tokens --help`
Expected: 각 명령 전용 help 출력.

- [ ] **Step 6: 커밋**

```bash
git add packages/cli/src/ packages/cli/bin/sh-ui.mjs packages/cli/test/help-text.test.js
git commit -m "feat(cli): 전 서브명령 --help + HELP_TEXT"
```

---

## Task 7: 통합 usage 정리 + 릴리즈 반영

**Files:**
- Modify: `packages/cli/bin/sh-ui.mjs:10-50` (`usage` 상단에 `<command> --help` 안내)
- Modify: `packages/changelog/versions.json` (엔트리 prepend)
- Modify: `packages/cli/package.json` (version)

- [ ] **Step 1: 통합 usage에 help 안내 한 줄 추가**

`bin/sh-ui.mjs`의 `usage` 문자열 끝부분(옵션 블록 위)에 추가:

```
  각 명령의 상세 옵션은 `sh-ui <command> --help` 로 확인.
```

- [ ] **Step 2: 현재 CLI 버전 확인**

Run: `node -e "console.log(require('./packages/cli/package.json').version)"`
Expected: 현재 버전 출력(예: `0.115.0`). 새 버전은 MINOR 증가(예: `0.116.0`).

- [ ] **Step 3: package.json version 범프**

`packages/cli/package.json`의 `version`을 MINOR 증가시킨다(Step 2에서 확인한 값 +0.1.0, patch는 0).

- [ ] **Step 4: versions.json 엔트리 prepend**

`packages/changelog/versions.json`의 `versions` 배열 **맨 앞**에 추가(날짜 2026-06-17, 버전은 Step 3과 일치):

```json
{
  "version": "0.116.0",
  "date": "2026-06-17",
  "title": "CLI 발견성 — 서브명령 --help + 오타 추천",
  "type": "minor",
  "highlights": [
    "모든 서브명령에 --help — init·add·remove·doctor·tokens·theme·migrate·rename-app·upgrade-cli·mcp 전용 도움말",
    "did-you-mean — 없는 컴포넌트/명령 입력 시 가까운 후보를 '혹시 …?' 로 제안",
    "의존성 없는 levenshtein 유틸 내장 (packages/cli/src/levenshtein.mjs)"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.116.0"
}
```

> 버전 번호는 Step 2/3에서 확정한 값으로 세 곳(package.json·version·url)을 일치시킨다.

- [ ] **Step 5: 전체 검증**

Run: `cd packages/cli && pnpm test`
Expected: 전체 PASS

Run: `node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json','utf8')); console.log('versions.json OK')"`
Expected: `versions.json OK` (파싱 성공)

- [ ] **Step 6: 커밋**

```bash
git add packages/cli/bin/sh-ui.mjs packages/cli/package.json packages/changelog/versions.json
git commit -m "feat(cli): 발견성 quick wins 릴리즈 (--help + did-you-mean)"
```

---

## 릴리즈 절차 (구현 완료 후, 사용자 확인 하에)

레포 정책(`CLAUDE.md`): dev 작업 → live PR → **태그는 live에서**. 현재 워크트리 브랜치에서 작업 후:

1. 사용자에게 PR 생성 여부 확인 (outward-facing — 자동 진행 금지).
2. 승인 시 dev push → `gh pr create --base live` → CI 그린 → 머지 → live에서 `v0.116.0` 태그.
3. 태그 푸시가 publish.yml(npm) + release.yml(GH Release)을 발동.

## 자기 점검 메모

- did-you-mean 메시지 헬퍼는 `add.mjs`에 단일 정의(`buildNotFoundMessage`)하고 generator가 재사용 → DRY.
- `KNOWN_COMMANDS`는 `commands.mjs` 단일 소스 → bin/테스트 공유.
- `suggest` 시그니처(`(input, candidates, {max, maxDistance})`)는 Task 1에서 고정, 이후 전 Task 동일 사용.
- HELP_TEXT 테스트는 데이터 주도(`it.each`)라 명령 누락 시 즉시 실패.
