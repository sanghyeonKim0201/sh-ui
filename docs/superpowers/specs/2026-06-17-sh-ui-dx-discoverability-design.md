# sh-ui DX 개선 — 1순위: 발견성(discoverability) quick wins

- 작성일: 2026-06-17
- 대상 레포: sh-ui (`packages/cli`)
- 상태: 설계 승인 대기

## 배경

sh-ui 전반의 개발자 경험(DX)을 4개 영역(온보딩·CLI / 문서 / 유지보수·모노레포·MCP / IDE·자동완성)으로
진단한 결과, 가로지르는 4대 구조적 테마가 도출되었다.

1. **라이프사이클(버전 추적)** — 설치된 컴포넌트에 버전 마커가 없어 "최신인지 / 업데이트에 무엇이 바뀌었는지" 알 수 없음.
2. **codegen으로 drift 제거** — props 표·사이드바 배열·Flutter 탭·커스텀 토큰 자동완성이 모두 손으로 동기화돼 drift 발생.
3. **발견성 quick wins** — 서브명령별 `--help` 부재, 오타 시 추천 부재.
4. **MCP 커버리지** — `doctor`·`tokens diff/upgrade`·설치 목록이 MCP 미노출.

사용자가 정한 진행 순서는 **3 → 2 → 4 → 1**. 각 테마는 독립 spec → plan → 구현으로 분리한다.
이 문서는 **1순위 테마 3(발견성 quick wins)**만 다룬다. 나머지는 마지막 "백로그" 절에 요약한다.

## 문제

현재 CLI([packages/cli/bin/sh-ui.mjs](../../../packages/cli/bin/sh-ui.mjs))의 발견성 갭:

- 최상위 `--help` / `-h`만 통합 usage를 출력한다(280–282행). **서브명령별 전용 help가 없다.**
  - `create`만 예외로 자체 `HELP_TEXT`를 갖고 `flags.help`로 출력한다([create/index.mjs:17,70](../../../packages/cli/src/create/index.mjs)).
  - `sh-ui add --help` / `remove --help`는 인자가 비어 *우연히* 전역 usage가 뜨고, `init`·`doctor --help`는 `--help`를 무시한 채 본 동작이 시작된다.
  - 결과적으로 `--diff`, `--keep`, `--app`, `--dry-run` 등 명령별 플래그의 존재 자체를 알기 어렵다.
- 컴포넌트명 오타 시 추천이 없다. `add`는 not-found를 그대로 던진다([add.mjs:346](../../../packages/cli/src/add.mjs)).

## 범위 (이번 spec)

### 1. 서브명령별 `--help`

`create`가 이미 쓰는 패턴 — *명령 모듈이 `export const HELP_TEXT`를 두고, `--help`면 출력 후 조기 반환* — 을
나머지 명령에 확장한다.

대상 명령: `init`, `add`, `list`, `remove`, `doctor`, `tokens`, `theme`, `migrate-v065`, `migrate`, `rename-app`, `upgrade-cli`, `mcp`.

- 각 명령 모듈(`src/<cmd>.mjs`)에 `export const HELP_TEXT` 추가.
- [bin/sh-ui.mjs](../../../packages/cli/bin/sh-ui.mjs)의 각 `case` 진입부에서
  `if (rest.includes("--help") || rest.includes("-h")) { console.log(HELP_TEXT); break; }` 가드.
- 서브명령을 가진 그룹(`tokens`, `theme`, `migrate`)은 그룹 help + 알 수 없는 서브명령 시 그룹 help 안내.
- help 본문에는 (a) 한 줄 설명, (b) 사용법, (c) 해당 명령의 플래그 목록, (d) 예시 1–2개를 포함한다.

### 2. did-you-mean (오타 추천)

존재하지 않는 컴포넌트/명령 입력 시 가장 가까운 후보를 제안한다.

- 의존성 없는 Levenshtein 유틸을 신규 추가: `packages/cli/src/levenshtein.mjs`
  (의존성 없이 자체 구현하는 관행 — `diff.mjs`가 LCS를 자체 구현한 전례를 따른다).
- 적용 지점:
  - 컴포넌트 not-found — [add.mjs:346](../../../packages/cli/src/add.mjs) (standalone 경로) +
    `generator.js`의 `addComponent`(monorepo 경로) + `remove` 경로.
  - 알 수 없는 최상위 명령 — [bin/sh-ui.mjs:284 default](../../../packages/cli/bin/sh-ui.mjs).
- 추천 규칙: registry의 컴포넌트 키(또는 명령 목록)에 대해 거리 계산, 거리 ≤ 2 이거나 최소 거리 후보 상위 3개를 제안.
  후보가 없으면 추천 문구를 생략하고 "전체 목록: `sh-ui list --all`"만 안내.
- 메시지 형식(예):
  `✗ 'buton' 컴포넌트를 react 레지스트리에서 찾을 수 없습니다. 혹시 button? 전체 목록: sh-ui list --all`

## 비범위 (이번 spec 제외)

- **`create --yes` 안전 경고** — `--yes`는 "디렉토리 덮어쓰기 동의"로 이미 문서화돼 있고
  비파괴 `--in-place` 옵션도 존재([create/index.mjs:34-35](../../../packages/cli/src/create/index.mjs)). 의도된 동작이라 제외.
- 테마 1·2·4(라이프사이클 / codegen / MCP) — 별도 spec.

## 상세 설계

### 파일 변경

| 파일 | 변경 |
|---|---|
| `packages/cli/src/levenshtein.mjs` | 신규. `levenshtein(a, b)` + `suggest(input, candidates, {max, maxDistance})`. 의존성 없음. |
| `packages/cli/src/init.mjs` 외 11개 명령 모듈 | `export const HELP_TEXT` 추가. |
| `packages/cli/bin/sh-ui.mjs` | 각 `case`에 `--help` 가드, `default`에 명령 did-you-mean. |
| `packages/cli/src/add.mjs` | not-found 에러에 컴포넌트 추천 결합. |
| `packages/cli/src/create/generator.js` | monorepo `addComponent` not-found에 추천 결합. |
| `packages/cli/src/remove.mjs` | not-found 시 추천(해당 시). |

### 경계와 책임

- `levenshtein.mjs` — 순수 함수. 문자열 거리와 후보 제안만. CLI/registry를 모름.
- 각 명령 모듈의 `HELP_TEXT` — 그 명령의 플래그와 동일 파일에 위치(자기 플래그를 가장 잘 아는 곳).
- `bin/sh-ui.mjs` — 라우팅 + help 가드 + 명령 추천만. 비즈니스 로직 없음(현 구조 유지).

## 테스트

- 각 대상 명령에 대해 `--help` 출력이 핵심 플래그 문자열을 포함하는지 단언(예: `add --help`에 `--diff`, `--app`, `--keep` 포함).
- `suggest('buton', ['button','badge','base'])` → `['button']` 류 단위 테스트.
- `add buton` 실행 시 에러 메시지에 `button` 포함 단언(standalone + monorepo 경로 각각).
- 알 수 없는 명령 `sh-ui ad` → `add` 추천 포함.

## 릴리즈

- 새 공개 동작(`--help`, 추천)이므로 **MINOR**.
- `packages/changelog/versions.json`에 엔트리 prepend (CLI 변경이므로 `packages/cli/package.json` version 동기화).
- dev → live PR → live 태그 순서(레포 정책)는 사용자 확인 후 진행.

## 백로그 (다음 spec 순서대로)

### 2순위 — codegen으로 drift 제거
단일 소스(registry + config + JSDoc)에서 생성: props 표(JSDoc→PropsTable), 사이드바 컴포넌트 배열,
Flutter 문서 탭 커버리지, **커스텀 토큰 자동완성**(React: `tokens.d.ts` + Tailwind `@theme`, Flutter: Dart 상수).
실행: `sh-ui sync`(가칭) — 수동 + `add`/`init`/`create` 후 자동 + 모노레포 전 ui-app 순회.
플랫폼 네이티브 위임 방식(별도 IDE 확장 없이 각 플랫폼이 이미 이해하는 형식으로 emit).

### 3순위 — MCP 커버리지
`sh_ui_doctor`, `sh_ui_tokens_diff` / `sh_ui_tokens_upgrade`, `sh_ui_list_installed`(+ outdated) 등을
MCP 툴로 노출해 AI 에이전트가 진단·업데이트를 자동 수행.

### 4순위 — 라이프사이클(버전 추적)
설치 컴포넌트에 버전 기록(`.sh-ui-manifest.json` 또는 파일 헤더 마커) → `list`·`doctor`가 "업데이트 가능" 표시.
업데이트 흐름(`add --diff`, 충돌 보존)과 결합.
