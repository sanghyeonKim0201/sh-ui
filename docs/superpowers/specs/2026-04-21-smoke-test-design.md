# `@sh-ui/create` 스모크 테스트 설계

- 날짜: 2026-04-21
- 대상 패키지: `packages/create` (`@sh-ui/create`)
- 목표: CLI 3개 진입점(`createProject`, `addApp`, `addComponent` 중 상위 2개)과 플러그인 적용 경로가 **사용자 대화형 입력 → 템플릿 복사 → 플러그인 패치** 흐름에서 끊기지 않고 동작하는지 빠르게 감지한다.

## 배경

현재 레포에는 테스트 인프라가 전혀 없다 (루트 `package.json`에 `test` 스크립트 없음, `packages/create`에도 테스트 없음). CLI는 `@inquirer/prompts` 기반 대화형이고 `fs-extra`로 `templates/*` 를 대상 디렉토리에 복사한다. 템플릿 구조 변경·플러그인 로직 변경 시 **현재는 수동 테스트 외에 회귀를 잡을 방법이 없다**.

후속 작업(Flutter 템플릿 추가, npm publish)에서 CLI를 건드리므로, 그 전에 현재 동작을 테스트로 고정해 둔다.

## 비범위 (out of scope)

- `pnpm install` / `pnpm build` 실제 실행 — 스모크 범위를 넘어섬
- 전체 디렉토리 트리 스냅샷 비교 — 유지비 과다
- `addComponent` 단독 테스트 — 상위 시나리오 회귀로 파생 감지 가능
- 에러 경로(덮어쓰기 거부, 비-모노레포에서 addApp 차단 등) — 단순 guard라 초기 스모크에서 과함
- turbo pipeline 통합 — 이번 스펙에선 `pnpm --filter` 직접 호출만

## 아키텍처 결정

### 테스트 러너: **vitest**

- `packages/create`에 `vitest`를 devDependency로 추가
- 레포의 Next.js 템플릿이 이미 vitest를 사용해 생태계 일관성
- `vi.mock`의 ESM 모듈 모킹이 이 시나리오에 최적 (node:test의 실험적 모킹보다 성숙)

### 대화형 입력 주입: **모듈 모킹**

`@inquirer/testing`의 `render()`는 **단일 프롬프트 인스턴스**만 받는 유틸이므로, 내부에서 `input → select → checkbox → confirm` 을 순차 호출하는 `createProject()` 같은 함수를 드라이브할 수 없다. 대신 `@inquirer/prompts` 전체 모듈을 `vi.mock` 으로 스텁하고 `mockResolvedValueOnce` 큐로 답변을 순서대로 주입한다.

```js
vi.mock('@inquirer/prompts', () => ({
  input:    vi.fn(),
  select:   vi.fn(),
  checkbox: vi.fn(),
  confirm:  vi.fn(),
}));
```

각 테스트에서 시나리오에 맞는 답변 큐를 `mockResolvedValueOnce` 체인으로 세팅한다.

### 작업 디렉토리 격리: **`process.cwd()` spyOn + OS tmp**

- `generator.js` 내부는 `path.resolve(process.cwd(), projectName)`로 타겟 디렉토리를 결정
- 테스트마다 `os.tmpdir()` 밑에 `sh-ui-create-<uuid>/` 생성하고 `vi.spyOn(process, 'cwd')`로 반환
- 실제 `process.chdir()`는 전역 부작용이 커서 피함
- `afterEach`에서 tmp dir 삭제 + `vi.restoreAllMocks()`

## 파일 배치

```
packages/create/
├── package.json              # devDep: vitest 추가, scripts.test 추가
├── test/
│   └── smoke.test.js         # 단일 파일, 4개 테스트
├── src/
└── templates/
```

- 루트 스크립트 연결은 본 스펙에선 생략. 실행은 `pnpm --filter @sh-ui/create test`.

## 테스트 시나리오 (4개)

### 시나리오 1 — standalone, 플러그인 없음

**주입:** `input('my-app') → select('standalone') → checkbox([])`
- (덮어쓰기 `confirm` 은 tmp dir이 비어있어 발동되지 않으므로 큐에 넣지 않음)

**Assertion:**
- `<tmp>/my-app/package.json` 존재
- `package.json.name === 'my-app'`
- `<tmp>/my-app/pnpm-workspace.yaml` **없음** (standalone 확인)
- `<tmp>/my-app/next.config.ts` 존재
- `<tmp>/my-app/app/` 디렉토리 존재

### 시나리오 2 — monorepo, 플러그인 없음

**주입:** `input('my-mono') → select('monorepo') → checkbox([])`

**Assertion:**
- `<tmp>/my-mono/pnpm-workspace.yaml` 존재
- `<tmp>/my-mono/turbo.json` 존재
- `<tmp>/my-mono/apps/web/package.json` 존재
- `<tmp>/my-mono/packages/` 디렉토리 존재

### 시나리오 3 — standalone + `sentry` + `next-intl`

**주입:** `input('my-app') → select('standalone') → checkbox(['sentry','next-intl'])`

**Assertion:**
- 시나리오 1의 기본 검증
- 플러그인 아티팩트 파일 존재 (정확한 파일명은 구현 단계에서 `src/plugins/sentry.js` 및 `nextIntl.js` 를 읽고 확정)
- `package.json.dependencies`에 `@sentry/nextjs`, `next-intl` 포함 여부 (플러그인이 package.json을 패치하는지에 따라)

### 시나리오 4 — `addApp` on monorepo

**전제:** 시나리오 2와 동일한 구조를 먼저 `createProject(monorepo)`로 생성 (또는 minimal monorepo fixture 복사)

**주입:** `input('admin') → input('3001')`

**Assertion:**
- `<tmp>/<mono>/apps/admin/package.json` 존재
- `package.json`이 port `3001`을 반영 (dev 스크립트 또는 별도 설정 파일)

## Fixture·cleanup

```js
import { beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-create-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
  vi.spyOn(console, 'log').mockImplementation(() => {});  // 테스트 출력 오염 방지
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.remove(tmpDir);
});
```

## 관찰 가능한 사이드이펙트 처리

구현 단계에서 확정할 항목:
- `generator.js`가 `execSync`/`spawn` 으로 외부 프로세스(git init 등)를 부르는지 확인. 있으면 `vi.mock('node:child_process')` 추가.
- 플러그인 로직이 대상 `package.json` 을 읽고 쓰는 방식 확인 — 현재 테스트 assertion이 이를 검증 가능한지 맞춤.

## 성공 기준

- `pnpm --filter @sh-ui/create test` 가 4개 테스트 모두 통과
- 전체 실행시간 3초 이내
- 테스트가 실행된 자리에 잔여 tmp dir 남지 않음
- 추후 템플릿/플러그인 구조 변경 시 해당 시나리오가 **의미 있는 실패 메시지**(파일 경로 + 비교값)를 낸다

## 후속 연결

이 스펙 완료 후 순서:
1. **B (Flutter 스타터 템플릿)** — 시나리오 추가 여지를 남겨둠 (예: 시나리오 5 — Flutter 선택 경로)
2. **C (npm publish 흐름)** — 이 테스트가 publish 전 CI gate로 동작하도록 통합
