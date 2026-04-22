# `@sh-ui/create` 스모크 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@sh-ui/create` CLI의 `createProject`(standalone·monorepo·플러그인 포함) 및 `addApp` 흐름을 vitest 기반 모듈 모킹으로 빠르게 회귀 감지한다.

**Architecture:** `packages/create/test/smoke.test.js` 단일 파일에 4개 시나리오. `vi.mock('@inquirer/prompts')`로 대화형 입력을 순차 주입, `os.tmpdir()` 밑 UUID 디렉토리 + `vi.spyOn(process, 'cwd')` 로 작업 공간 격리. 생성된 파일을 `fs` 로 검증.

**Tech Stack:** Node 20+, vitest, `@inquirer/prompts`(스텁), fs-extra.

---

## File Structure

- Modify: `packages/create/package.json` — `vitest` devDep 추가, `scripts.test` 추가
- Create: `packages/create/test/smoke.test.js` — 4개 시나리오 테스트 파일
- 레포 루트 스크립트 및 turbo pipeline 연결은 이번 스코프 밖. 실행은 `pnpm --filter @sh-ui/create test`.

---

## Task 1: 테스트 인프라 설정

**Files:**
- Modify: `packages/create/package.json`
- Create: `packages/create/test/smoke.test.js`

- [ ] **Step 1: `vitest` devDep 추가**

`packages/create/` 디렉토리에서 실행:

```bash
pnpm --filter @sh-ui/create add -D vitest@^3.0.0
```

Expected: `packages/create/package.json` 의 `devDependencies` 에 `"vitest": "^3.x.x"` 가 추가되고 `pnpm-lock.yaml` 이 갱신됨.

- [ ] **Step 2: `package.json` 에 `test` 스크립트 추가**

`packages/create/package.json` 의 `scripts` 섹션을 다음으로 교체:

```json
  "scripts": {
    "create": "node bin/create.js",
    "add-app": "node bin/create.js add-app",
    "test": "vitest run"
  }
```

- [ ] **Step 3: 테스트 파일 스켈레톤 작성 (mocks + fixture)**

`packages/create/test/smoke.test.js` 생성:

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

// @inquirer/prompts 전체 모듈 모킹 — 각 테스트에서 mockResolvedValueOnce 큐 주입
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

// 모킹된 함수를 가져와 각 테스트에서 답변 큐를 세팅
const prompts = await import('@inquirer/prompts');
const { createProject, addApp } = await import('../src/generator.js');

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-create-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  // 모든 prompt 모의 초기화
  prompts.input.mockReset();
  prompts.select.mockReset();
  prompts.checkbox.mockReset();
  prompts.confirm.mockReset();
  await fs.remove(tmpDir);
});

describe('@sh-ui/create smoke tests', () => {
  // 테스트 케이스는 이후 태스크에서 추가
  it.todo('scenario 1 — standalone, no plugins');
  it.todo('scenario 2 — monorepo, no plugins');
  it.todo('scenario 3 — standalone + sentry + next-intl');
  it.todo('scenario 4 — addApp in monorepo');
});
```

- [ ] **Step 4: `todo` 상태로 테스트 실행 확인**

`packages/create/` 에서:

```bash
pnpm test
```

Expected: `4 todo` 출력, 실패 없음, 종료 코드 0.

- [ ] **Step 5: Commit**

```bash
git add packages/create/package.json packages/create/test/smoke.test.js pnpm-lock.yaml
git commit -m "test(create): @sh-ui/create 스모크 테스트 infra 추가 (vitest)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 시나리오 1 — standalone, 플러그인 없음

**Files:**
- Modify: `packages/create/test/smoke.test.js`

**핵심 사실:** `createProject()` 는 standalone 모드에서 `input → select → checkbox` 3개 프롬프트만 호출. `tmpDir` 가 비어있어 `confirm` 은 발동하지 않는다.

- [ ] **Step 1: `it.todo` 를 실제 테스트로 교체**

`smoke.test.js` 의 `it.todo('scenario 1 — standalone, no plugins')` 를 다음으로 교체:

```js
  it('scenario 1 — standalone, no plugins', async () => {
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select.mockResolvedValueOnce('standalone');
    prompts.checkbox.mockResolvedValueOnce([]);

    await createProject();

    const projectDir = path.join(tmpDir, 'my-app');
    expect(await fs.pathExists(projectDir)).toBe(true);

    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.name).toBe('my-app');

    expect(await fs.pathExists(path.join(projectDir, 'pnpm-workspace.yaml'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'next.config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'app'))).toBe(true);
  });
```

- [ ] **Step 2: 테스트 실행 — pass 확인**

```bash
pnpm test
```

Expected: `scenario 1` PASS. 나머지 3개는 여전히 `todo`.

- [ ] **Step 3: Commit**

```bash
git add packages/create/test/smoke.test.js
git commit -m "test(create): 시나리오 1 (standalone, no plugins)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 시나리오 2 — monorepo, 플러그인 없음

**Files:**
- Modify: `packages/create/test/smoke.test.js`

**핵심 사실:** `createProject()` 가 monorepo 모드에서는 `generateMonorepo` 내부에서 추가로 `input(appName)` + `input(port)` 를 호출한다. 따라서 총 프롬프트 순서는: `input(projectName) → select(type) → checkbox(plugins) → input(appName) → input(port)`.

- [ ] **Step 1: 테스트 케이스 교체**

`it.todo('scenario 2 — monorepo, no plugins')` 를 교체:

```js
  it('scenario 2 — monorepo, no plugins', async () => {
    prompts.input
      .mockResolvedValueOnce('my-mono')   // 프로젝트 이름
      .mockResolvedValueOnce('web')        // 첫 번째 앱 이름
      .mockResolvedValueOnce('3000');      // 포트
    prompts.select.mockResolvedValueOnce('monorepo');
    prompts.checkbox.mockResolvedValueOnce([]);

    await createProject();

    const monoDir = path.join(tmpDir, 'my-mono');
    expect(await fs.pathExists(path.join(monoDir, 'pnpm-workspace.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'turbo.json'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'apps', 'web', 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(monoDir, 'packages', 'ui', 'ui-apps', 'ui-web'))).toBe(true);

    const rootPkg = await fs.readJson(path.join(monoDir, 'package.json'));
    expect(rootPkg.name).toBe('my-mono');

    const appPkg = await fs.readJson(path.join(monoDir, 'apps', 'web', 'package.json'));
    expect(appPkg.name).toBe('web');
    expect(appPkg.scripts.dev).toContain('-p 3000');
  });
```

- [ ] **Step 2: 테스트 실행 — pass 확인**

```bash
pnpm test
```

Expected: `scenario 1`, `scenario 2` 둘 다 PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/create/test/smoke.test.js
git commit -m "test(create): 시나리오 2 (monorepo, no plugins)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 시나리오 3 — standalone + sentry + next-intl

**Files:**
- Modify: `packages/create/test/smoke.test.js`

**핵심 사실:**
- `sentryPlugin.dependencies` 에 `@sentry/nextjs` 추가됨
- `nextIntlPlugin.dependencies` 에 `next-intl` 추가됨
- `sentryPlugin.envVars` 가 `.env.example` 에 append 됨 (예: `SENTRY_ORG=`)
- `sentryPlugin.wrapExport` / `nextIntlPlugin.wrapExport` 가 `next.config.ts` 내용에 반영됨
- `nextIntlPlugin.transforms` 가 `app/page.tsx` 를 `app/[locale]/page.tsx` 로 이동시킴

- [ ] **Step 1: 테스트 케이스 교체**

`it.todo('scenario 3 — standalone + sentry + next-intl')` 를 교체:

```js
  it('scenario 3 — standalone + sentry + next-intl', async () => {
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select.mockResolvedValueOnce('standalone');
    prompts.checkbox.mockResolvedValueOnce(['sentry', 'next-intl']);

    await createProject();

    const projectDir = path.join(tmpDir, 'my-app');

    // dependencies 패치 확인
    const pkg = await fs.readJson(path.join(projectDir, 'package.json'));
    expect(pkg.dependencies['@sentry/nextjs']).toBeDefined();
    expect(pkg.dependencies['next-intl']).toBeDefined();

    // .env.example 에 Sentry 키 추가 확인
    const envExample = await fs.readFile(path.join(projectDir, '.env.example'), 'utf-8');
    expect(envExample).toContain('SENTRY_ORG=');

    // next.config.ts 에 플러그인 반영 확인
    const nextConfig = await fs.readFile(path.join(projectDir, 'next.config.ts'), 'utf-8');
    expect(nextConfig).toContain('withSentryConfig');
    expect(nextConfig).toContain('createNextIntlPlugin');

    // next-intl transforms: app/page.tsx → app/[locale]/page.tsx
    expect(await fs.pathExists(path.join(projectDir, 'app', 'page.tsx'))).toBe(false);
    expect(await fs.pathExists(path.join(projectDir, 'app', '[locale]', 'page.tsx'))).toBe(true);
  });
```

- [ ] **Step 2: 테스트 실행 — pass 확인**

```bash
pnpm test
```

Expected: 3개 PASS, 1개 todo.

- [ ] **Step 3: Commit**

```bash
git add packages/create/test/smoke.test.js
git commit -m "test(create): 시나리오 3 (standalone + sentry + next-intl)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 시나리오 4 — `addApp` in monorepo

**Files:**
- Modify: `packages/create/test/smoke.test.js`

**핵심 사실:**
- `addApp()` 는 cwd 에 `pnpm-workspace.yaml` 이 존재해야 진행. 없으면 early return.
- `addApp()` 프롬프트: `input(appName) → input(port) → checkbox(plugins)` 3개.
- `generateApp()` 은 `targetDir/../..` 경로의 `packages/ui/ui-apps/ui-{appName}/` 에 `ui-app-template` 복사.
- 따라서 fixture 로 tmpDir 에 `pnpm-workspace.yaml` 하나만 만들어주면 충분.

- [ ] **Step 1: 테스트 케이스 교체**

`it.todo('scenario 4 — addApp in monorepo')` 를 교체:

```js
  it('scenario 4 — addApp in monorepo', async () => {
    // minimal monorepo fixture: pnpm-workspace.yaml 만 필요
    await fs.writeFile(
      path.join(tmpDir, 'pnpm-workspace.yaml'),
      "packages:\n  - 'apps/*'\n  - 'packages/*'\n",
    );

    prompts.input
      .mockResolvedValueOnce('admin')   // 앱 이름
      .mockResolvedValueOnce('3001');    // 포트
    prompts.checkbox.mockResolvedValueOnce([]);

    await addApp();

    const appDir = path.join(tmpDir, 'apps', 'admin');
    expect(await fs.pathExists(path.join(appDir, 'package.json'))).toBe(true);

    const appPkg = await fs.readJson(path.join(appDir, 'package.json'));
    expect(appPkg.name).toBe('admin');
    expect(appPkg.scripts.dev).toContain('-p 3001');

    // ui-app-template 이 ui-admin 으로 복사됐는지
    expect(
      await fs.pathExists(path.join(tmpDir, 'packages', 'ui', 'ui-apps', 'ui-admin')),
    ).toBe(true);
  });
```

- [ ] **Step 2: 테스트 실행 — 전체 4개 PASS 확인**

```bash
pnpm test
```

Expected: `4 passed`, todo 없음, 전체 실행시간 3초 이내.

- [ ] **Step 3: tmp 잔여 정리 확인**

다음 명령으로 tmp 잔여물 없는지 확인:

```bash
ls $(node -e 'console.log(require("node:os").tmpdir())') | grep 'sh-ui-create-' || echo "no leftover"
```

Expected: `no leftover` 출력.

- [ ] **Step 4: Commit**

```bash
git add packages/create/test/smoke.test.js
git commit -m "test(create): 시나리오 4 (addApp in monorepo)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 최종 검증

**Files:**
- 없음 (검증만)

- [ ] **Step 1: 전체 테스트 재실행**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Test Files  1 passed (1)`, `Tests  4 passed (4)`.

- [ ] **Step 2: 타입 체크에 지장 없는지 확인**

```bash
pnpm typecheck
```

Expected: 기존 대비 새 에러 없음. (테스트 파일은 `.js` 라 영향 없어야 함.)

- [ ] **Step 3: 이 변경이 릴리즈 엔트리를 필요로 하는지 판단**

CLAUDE.md 규정상 `test:` 커밋만 있으면 버전 범프 없음 → `versions.json` 엔트리 추가하지 않는다. 이번 작업은 엔트리 제외 대상임을 확인.

- [ ] **Step 4: PR 또는 push**

`dev` 브랜치에서 작업 중이므로 직접 push:

```bash
git push origin dev
```

---

## Self-Review 결과

**Spec coverage:**
- 시나리오 1 → Task 2 ✓
- 시나리오 2 → Task 3 ✓
- 시나리오 3 → Task 4 ✓
- 시나리오 4 → Task 5 ✓
- Fixture·cleanup (spec §Fixture·cleanup) → Task 1 Step 3 ✓
- vitest 선정 (spec §아키텍처 결정) → Task 1 Step 1 ✓
- 모듈 모킹 방식 (spec §대화형 입력 주입) → Task 1 Step 3 ✓

**Placeholder scan:** 없음. 모든 step 에 실제 코드·명령·기대 출력 포함.

**Type consistency:** mock 주입 함수명 (`prompts.input.mockResolvedValueOnce` 등), `addApp`/`createProject` 의 프롬프트 순서, 템플릿 구조(`packages/ui/ui-apps/ui-*`) 가 Task 전반에서 일관됨. `generator.js:223-231` 이 monorepo 경로에서 `input(appName)` + `input(port)` 를 추가 호출하는 점을 Task 3 에서 명시적으로 반영.

**갭 없음.** 진행 가능.
