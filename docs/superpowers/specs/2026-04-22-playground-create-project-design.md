# Playground → Create Project 통합 설계

작성일: 2026-04-22
상태: 설계 승인 대기

## 요약

`apps/docs`의 플레이그라운드에서 편집한 디자인 토큰을 **그대로 담은 한 줄 CLI 명령어**를 만들어 새 프로젝트를 스캐폴드한다. 사용자는 색·radius를 시각적으로 조정한 뒤 `프로젝트 만들기` FAB를 눌러 다이얼로그에서 이름·플랫폼·구조·플러그인을 고르고 명령어를 복사한다. 명령어는 테마를 base64로 실어 `@sh-ui/create`에 전달하며, CLI는 템플릿의 `tokens.css` / `sh_ui_tokens.dart` 안 마커 블록을 그 값으로 치환한다.

## 배경

- 현재 `@sh-ui/create`는 inquirer 대화형 프롬프트만 지원한다 (`name`, `platform`, `structure`, `plugins`).
- 플레이그라운드(`apps/docs/app/playground/page.tsx`)는 색 토큰과 radius를 편집·저장·export 하지만, 결과물을 **수동으로 붙여넣어야** 반영된다.
- shadcn/ui는 "Create Project" 다이얼로그에서 옵션을 고르고 프리셋 ID가 박힌 명령어를 제공한다 — 동일한 UX를 **플레이그라운드 기반**으로 적용하면 sh-ui 고유의 "편집한 그대로 실어서 프로젝트 생성" 플로우가 된다.

## 목표

- 플레이그라운드에서 편집한 테마가 **복사-붙여넣기 한 번**으로 새 프로젝트에 반영된다.
- `@sh-ui/create` CLI는 기존 대화형 흐름을 유지하면서 **플래그를 통해 비대화형 실행**도 가능하다.
- 서버 의존성을 추가하지 않는다 (docs는 정적 호스팅 유지).

## 비목표 (Out of Scope)

- 프리셋 갤러리 / 공유 링크 서비스 (기한 없는 재현성·오프라인 동작이 더 중요 — 필요 시 `--theme-id` 별도 추가)
- `base`(neutral/zinc/slate), `mode`(light/dark) 선택 옵션 — 플레이그라운드에서 색을 직접 편집하므로 중복
- RTL·프리셋 구성 (AHA — 실 수요 확인되면 별개 이터)
- 로컬 테마 파일(`--theme-file ./sh-ui-theme.json`) 지원
- `spacing` / `typography` 토큰 편집 — 플레이그라운드가 아직 노출하지 않음
- 테마 스키마 `version` 필드 — 키·타입 검증만으로 충분. 스키마 진화 시 추가.

## 사용자 흐름

```
1) /playground 접속
2) 좌측 편집 패널에서 색·radius 조정 (기존 기능)
3) 우하단 FAB `＋ 프로젝트 만들기` 클릭
4) 다이얼로그에서 프로젝트 이름·플랫폼·구조·플러그인·패키지 매니저 선택
5) 테마 요약 배지로 현재 색·radius 확인 (필요 시 `수정 →` 클릭해 편집으로 복귀)
6) `명령어 복사` 클릭
7) 터미널에 붙여넣고 Enter → 편집한 디자인이 박힌 프로젝트 생성 완료
```

## 아키텍처

두 레이어가 base64 문자열 하나로 연결된다.

### (A) docs 앱 — 플레이그라운드 확장

**상태**: playground 페이지가 이미 보유한 `light` / `dark` / `radius`를 Dialog에 prop으로 내려 재사용.

**파일 구조**
```
apps/docs/
├── app/playground/page.tsx                  # FAB + Dialog 호출만 추가
└── components/playground/                   # 신규 폴더
    ├── CreateProjectFab.tsx                 # 우하단 고정 버튼
    ├── CreateProjectDialog.tsx              # 다이얼로그 본체 (UI)
    ├── useCommandComposer.ts                # 옵션 → 명령어 문자열 (파생)
    └── encodeTheme.ts                       # 순수 함수 — 상태 → base64
```

**책임 분리**
- `page.tsx` — 상태 보유 + 컴포넌트 장착만. 비즈니스 로직 없음.
- `CreateProjectFab.tsx` — `position: fixed` 우하단. 클릭 시 `onOpen` 콜백.
- `CreateProjectDialog.tsx` — 기존 `@/components/ui/dialog` 위에 폼을 얹음. 입력은 모두 로컬 useState.
- `useCommandComposer.ts` — 폼 값 + base64 → `pnpm dlx @sh-ui/create ...` 문자열. 순수 계산(useMemo).
- `encodeTheme.ts` — `{ light, dark, radius } → base64`. 순수.

**Dialog 로컬 상태**
```ts
projectName: string                                            // 기본 "my-app"
platform: "next" | "flutter"                                   // 기본 "next"
structure: "standalone" | "monorepo"                           // next일 때만 활성
plugins: Set<"sentry" | "next-intl">                           // next일 때만 활성
packageManager: "pnpm" | "npm" | "yarn" | "bun"                // 기본 "pnpm"
```

**Dialog props** (playground → Dialog로 내려주는 값)
```ts
open: boolean
onClose: () => void
light: Record<TokenKey, string>
dark:  Record<TokenKey, string>
radius: number
mode:  "light" | "dark"                                        // 배지 스와치가 어느 모드를 보여줄지
```

**조건부 UI**
- `platform === "flutter"` → 구조·플러그인 섹션 DOM에서 제거
- 플러그인 토글은 기존 `@/components/ui/toggle` 재사용

**테마 요약 배지**
- 색 4개 스와치: `background`, `foreground`, `primary`, `danger` (현재 모드 기준)
- `radius` 값 표시
- `수정 →` 클릭 시 `onClose()` + 편집 패널로 스크롤

**명령어 프리뷰**
- 폼 값·테마가 바뀌면 즉시 갱신 (useMemo)
- 패키지 매니저 탭 전환 시 `pnpm dlx` / `npx` / `yarn dlx` / `bunx` 프리픽스만 치환
- 복사 버튼: `navigator.clipboard.writeText` + `role="status"` 알림

**접근성**
- FAB — `aria-label="프로젝트 만들기"`
- Dialog — 기존 컴포넌트가 포커스 트랩·Esc 제공
- 복사 성공 피드백 — `aria-live` 영역에 `"복사되었습니다"` 3초 표시

### (B) `@sh-ui/create` CLI — 비대화형 플래그 지원

**파일 구조**
```
packages/create/
├── bin/create.js                             # argv 파싱 → generator(flags)
└── src/
    ├── generator.js                          # 기존 함수 시그니처 확장
    ├── cli-args.js                           # 신규 — argv → flags 객체 + 검증
    └── theme/
        ├── decode.js                         # 신규 — base64 → JSON 검증
        └── inject.js                         # 신규 — 템플릿 마커 블록 치환
```

**플래그**
```
pnpm dlx @sh-ui/create [name]
  --platform <next|flutter>
  --structure <standalone|monorepo>   # next 전용
  --plugins <sentry,next-intl>        # next 전용, 콤마 분리
  --theme <base64>                    # 없으면 템플릿 기본 테마
  --yes                               # 덮어쓰기 등 확인 프롬프트 스킵
```

**부분 플래그 지원**
- 플래그로 들어온 항목은 inquirer 프롬프트를 **스킵**.
- 빠진 항목은 기존처럼 대화형으로 물음.
- 즉 `pnpm dlx @sh-ui/create`(플래그 없음) = 기존 동작. 하위 호환 보장.
- 다이얼로그가 생성하는 명령어는 **항상 풀스펙**(모든 플래그 + `--yes`) → 사용자는 그냥 붙여넣고 Enter.

### 데이터 흐름

```
Playground state (light, dark, radius)
  │
  ▼ encodeTheme()           JSON.stringify + btoa
base64 theme string
  │
  ▼ useCommandComposer      옵션 + theme → 한 줄 명령어
"pnpm dlx @sh-ui/create my-app --platform next --structure standalone \
  --plugins sentry --theme 'eyJsaWdodCI6...' --yes"
  │
  ▼ (user copies & runs in terminal)
@sh-ui/create CLI
  │
  ▼ cli-args                argv → flags 객체
  ▼ generator               남은 항목만 inquirer
  ▼ theme/decode            base64 → JSON + 스키마 검증
  ▼ 템플릿 복사
  ▼ theme/inject            tokens.css / sh_ui_tokens.dart 마커 블록 치환
  ▼ 완료
```

## 인코딩 상세

**JSON 스키마** (`theme/decode.js`가 검증)
```ts
{
  light: Record<TokenKey, string>,   // hex 12개
  dark:  Record<TokenKey, string>,   // hex 12개
  radius: number                     // 0 ~ 1.5
}

// TokenKey — playground와 동일 12개
type TokenKey =
  | "background" | "background-subtle" | "background-muted"
  | "foreground" | "foreground-muted"
  | "border" | "border-strong"
  | "primary" | "primary-foreground" | "primary-hover"
  | "danger" | "danger-foreground";
```

**크기 추정**
- JSON 원문: 약 400~500 바이트
- base64: 약 530~670 자
- 최종 명령어(모든 플래그 포함·쿼트 포함): **약 650자 내외**
- shell argv 한계(~128KB)에 비해 무시 가능. Copy 버튼이 있어 시각적 길이는 UX 이슈 아님.

**쿼팅**
- 다이얼로그는 `--theme 'eyJsaWdod...'` 처럼 **싱글쿼트**로 감쌈.
- base64 알파벳(`A-Z a-z 0-9 + / =`)은 싱글쿼트 안에서 shell 이스케이프 불필요.
- URL-safe 변형 안 함(URL 아님).

## 주입 상세

**마커 주석**을 템플릿에 삽입하고, CLI가 그 사이만 치환한다.

**tokens.css (모든 React 기반 템플릿)**
```css
/* sh-ui:theme-start */
:root {
  --background: #FFFFFF;
  --background-subtle: #FAFAFA;
  /* ...12개 light 토큰 */
  --radius: 0.5rem;
}
.dark {
  --background: #0A0A0A;
  /* ...12개 dark 토큰 */
}
/* sh-ui:theme-end */
```

**sh_ui_tokens.dart (모든 Flutter 기반 템플릿)**
```dart
// sh-ui:theme-start
static const light = ShUiColorTokens(
  background: Color(0xFFFFFFFF),
  // ...
);
static const dark = ShUiColorTokens(
  background: Color(0xFF0A0A0A),
  // ...
);
static const radiusTokens = ShUiRadiusTokens(defaultRadius: 8.0);
// sh-ui:theme-end
```

- `inject.js`는 마커 쌍 사이 전체를 교체. 바깥 토큰(spacing·text 등)은 건드리지 않음.
- **주입 로직은 파일 전체를 문자열로 읽어 정규식으로 마커 블록을 탐색** — 들여쓰기·빈 줄 보존.
- `--theme` 미제공 시 마커 블록은 템플릿의 기본값 그대로 유지됨.

## 에러 케이스

| 케이스 | 동작 |
|---|---|
| `--theme` base64 디코드 실패 | `theme 디코드 실패: <원인>` + exit 1 |
| `--theme` JSON 스키마 불일치 (키 누락·타입 오류) | `theme 스키마 오류: <어떤 키가 왜>` + exit 1 |
| `--platform flutter` + `--structure` / `--plugins` 동시 지정 | 경고 출력 + 해당 플래그 무시 + 계속 진행 |
| 디렉토리 이미 존재 + `--yes` 없음 | 기존처럼 덮어쓰기 확인 프롬프트 |
| 디렉토리 이미 존재 + `--yes` 있음 | 바로 덮어씀 |
| 템플릿 파일에 마커가 없음 | 빌드 타임 테스트가 실패 (CI가 걸러줌) |
| `navigator.clipboard` 사용 불가 환경 | 명령어를 선택 가능한 `<pre>`에 그대로 노출 + 안내 문구 |

## 테스팅

| 레이어 | 종류 | 구현 |
|---|---|---|
| `encodeTheme` | 단위 | docs 앱 vitest — round-trip encode → decode = identity |
| `useCommandComposer` | 단위 | 옵션 조합 → 기대 문자열 정확 매칭 |
| Dialog 상호작용 | 수동 | `pnpm dev`로 실제 브라우저 확인 |
| `cli-args.js` | 단위 | argv 배열 → flags 객체, 정상·에러 케이스 |
| `theme/decode.js` | 단위 | 정상 JSON·누락 키·타입 오류 각각 |
| `theme/inject.js` | 단위 | 마커 있는 입력 → 치환 결과 snapshot |
| 템플릿 마커 존재 여부 | 단위 | 모든 템플릿 `tokens.css` / `sh_ui_tokens.dart` scan, 마커 쌍 assert |
| E2E | 통합 | 임시 디렉토리에 `createProject(flags)` 실제 실행 → 생성된 `tokens.css`·`sh_ui_tokens.dart` 내용 검증 |

`packages/create`는 이미 vitest 셋업(`test/`). 동일 프레임워크 재사용.

## 출시 순서

각 단계는 독립 PR. E2E 의존성 때문에 반드시 이 순서.

1. **템플릿에 마커 삽입**
   - 모든 템플릿 `tokens.css` / `sh_ui_tokens.dart`에 마커 쌍 추가
   - 테마 값 변경 없음. `chore:` 커밋. 버전 범프 없음.
2. **CLI 플래그 지원 + theme 주입**
   - `cli-args.js`, `theme/decode.js`, `theme/inject.js` 추가
   - `generator.js`가 flags 객체를 받도록 수정
   - 하위 호환 확인: 플래그 없이 실행 시 기존 UX 그대로
   - `@sh-ui/create` MINOR 범프. `versions.json` prepend.
3. **Playground FAB + Dialog**
   - `components/playground/` 폴더 추가
   - `page.tsx`에 FAB·Dialog 장착
   - docs 앱 변경만. sh-ui 자체 버전 범프 없음.

## 보안·운영 관점

- **서버 없음**: base64는 전부 클라이언트에서 생성·전송·디코드됨. docs는 정적 호스팅 유지.
- **개인 정보 아님**: 색 hex와 radius 숫자만. base64 노출돼도 누출 리스크 없음.
- **shell injection 방지**: `--theme` 값은 base64 알파벳으로 제한(`[A-Za-z0-9+/=]`). CLI가 디코드 전에 정규식 검증. 이를 벗어난 입력은 에러.
- **CLI 퍼미션**: 기존 `@sh-ui/create`와 동일. 새 파일 작성·디렉토리 생성 이상의 권한 요구 없음.

## 열린 질문

- **옵션 UX — 단독 선택을 라디오로 할지 토글로 할지**: 플랫폼·구조는 2지선다라 토글 UI(기존 `@/components/ui/toggle`)로 충분. 구현 단계에서 실 컴포넌트로 시도해보고 결정.
- **다이얼로그 폭·모바일 레이아웃**: 기존 Dialog의 기본 max-width 사용. 모바일에서 명령어 프리뷰 `<pre>`가 가로 스크롤 필요 — 구현 중 확인.
- **Flutter 마커 주입 정밀도**: dart 문법상 trailing comma·줄바꿈에 민감. 정규식 vs AST 파싱 중 정규식으로 시작하되 테스트가 flaky해지면 `recast` 같은 파서 고려 (현 단계엔 단순 정규식).

---

## 체크리스트

- [x] 전체 아키텍처
- [x] Playground 사이드
- [x] CLI 사이드
- [x] 인코딩·주입 세부
- [x] 테스팅·출시 순서
- [x] Out of Scope 명시
- [x] 에러 케이스
