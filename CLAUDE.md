# sh-ui 작업 규칙

공통 규칙은 `.ai/rules/` 서브모듈(v1.6.0+)을 따른다. 이 파일은
**이 레포에만 적용되는 관용과 오버라이드**만 기록한다.

## 적용 규칙

서브모듈에 체크아웃된 규칙 파일 링크. 본문은 복사하지 않고, 변경은 원본 저장소(`.ai/rules`)에서 수정한다.

- [공통 규칙](.ai/rules/common/common.md)
- [gstack 사용 규칙](.ai/rules/gstack/gstack.md)
- [Next.js 네이밍](.ai/rules/nextjs/naming.md)
- [Next.js 설계 원칙](.ai/rules/nextjs/design-principles.md)
- [Next.js 관심사 분리](.ai/rules/nextjs/separation-of-concerns.md)
- [Next.js 데이터 페칭](.ai/rules/nextjs/data-fetching.md) — 템플릿 전용
- [Next.js FSD 통합](.ai/rules/nextjs/fsd-integration.md) — 템플릿 전용
- [FSD 아키텍처](.ai/rules/fsd/fsd-architecture.md) — 템플릿 전용
- [FSD 관심사 분리](.ai/rules/fsd/separation-of-concerns.md) — 템플릿 전용
- [UI 접근성](.ai/rules/ui/accessibility.md)
- [UI 컴포넌트 API](.ai/rules/ui/component-api.md)
- [UI 컴포지션](.ai/rules/ui/composition.md)
- [UI 디자인 토큰](.ai/rules/ui/design-tokens.md)
- [UI 상태](.ai/rules/ui/ui-states.md)

## 외부 규칙 적용 범위

각 폴더가 이 레포에서 의미하는 범위:

| 폴더 | 적용 범위 |
|---|---|
| `common/` | 전체 — Git·커밋·버전 컨벤션, 설계 원칙, 네이밍 |
| `gstack/` | 전체 — 슬래시 커맨드 워크플로우(신호 기반 호출 트리거) |
| `ui/` | 전체 — sh-ui 컴포넌트(React + Flutter) 설계 기준 |
| `nextjs/design-principles.md`, `naming.md`, `separation-of-concerns.md` | 부분 — `apps/docs` 및 sh-ui 컴포넌트 TS 코드 |
| `nextjs/data-fetching.md`, `nextjs/fsd-integration.md`, `fsd/*` | **템플릿 전용** — `packages/create/templates/` 가 생성하는 **사용자 프로젝트** 설계 기준. sh-ui 코어(apps/docs, packages/*)에는 직접 적용하지 않음 |
| `templates/` | 미사용 — 신규 프로젝트 엔트리포인트(`AGENTS.md`/`CLAUDE.md` 등) 시작용 템플릿. 이 레포는 자체 `CLAUDE.md`를 유지하므로 직접 적용하지 않음 |

## sh-ui 특화 오버라이드

외부 규칙과 이 레포 관행이 충돌하는 지점. 아래는 외부 규칙보다 **이 항목이 우선**.

### 1. "shadcn/ui 우선 사용"은 역전된다

`nextjs/design-principles.md` 의 "UI 설계" 섹션은 shadcn/ui 를 쓰라고 하지만,
**sh-ui 자체가 shadcn 계열 대체재**이므로 이 레포에서는:

- `apps/docs`, `apps/showcase` 및 `packages/create/templates/` 의 생성물은 **sh-ui 컴포넌트 우선** 사용
- 위 섹션의 "Base UI 기반 (`@base-ui-components/react`)" 원칙은 그대로 유효 — sh-ui 컴포넌트가 실제로 Base UI 위에 빌드됨
- 네이티브 HTML 요소(select, input, dialog 등) 직접 구현 금지 원칙도 그대로

### 2. "px 등 고정 단위 사용 금지"의 해석

`nextjs/design-principles.md` 는 `px` 같은 절대 단위 직접 사용을 금지한다. sh-ui에서는:

- **토큰 정의부(`packages/tokens/`, 템플릿의 `tokens.css`)** 는 `--space-1: 4px` 처럼 px 원시값 사용 허용 — 이게 토큰의 본질
- **컴포넌트 스타일(`packages/registry/*/components/*/styles.css`)** 및 **사용자 코드**는 항상 토큰 변수(`var(--space-3)`) 경유. 매직 px 하드코딩 금지
- 불가피한 단위는 `rem`/`em`/`%`/`vw`/`vh` 우선 — 이 원칙은 그대로

### 3. 브랜치 정책

`common/common.md` 은 "`live` 직접 push 금지, PR 경유"를 정책으로 제시하지만,
이 레포는 현재 **`dev` 브랜치를 작업 브랜치로 두고 직접 push**하며, `live` 머지
시점에만 PR을 쓴다. `dev` 는 느슨하게, `live` 는 엄격히 — 이 차등을 유지.

## 변경 내역(패치노트) 자동 반영

sh-ui는 `packages/changelog/versions.json`을 단일 소스로 두고 docs(React)와
showcase(Flutter)가 그 파일을 읽어 "변경 내역" 페이지를 렌더한다.

**원칙: 새 릴리즈를 찍을 때마다 versions.json에 엔트리를 추가한다.**

### 트리거 — 언제 엔트리를 추가하는가

공통 규칙(`.ai/rules/common/common.md`)의 버전 범프 기준과 동일:

| 변경 성격 | 버전 | versions.json |
|---|---|---|
| 신규 컴포넌트·새 공개 prop·새 공개 API 추가 | MINOR | ✅ 추가 |
| 버그 수정만(fix만) | PATCH | ✅ 추가 |
| breaking change | MAJOR | ✅ 추가 |
| `docs` / `style` / `chore` / `refactor` / `test` 만 | — (범프 없음) | ❌ 추가 안 함 |

즉 **태그(`vX.Y.Z`)를 찍는 릴리즈는 반드시 versions.json에도 같이 반영**하고,
태그 없는 docs/chore 커밋은 versions.json을 건드리지 않는다.

### 엔트리 포맷

```json
{
  "version": "0.12.0",
  "date": "2026-04-20",
  "title": "CLI --diff 플래그 — 업데이트 미리보기",
  "type": "minor",
  "highlights": [
    "sh-ui add <name> --diff — 파일을 쓰지 않고 변경 내역(unified diff)만 출력",
    "신규/변경/동일 파일을 분류해 요약, 수정해둔 파일이 있는지 사전 확인 가능",
    "의존성 없는 LCS 기반 line-diff 내장 (packages/cli/src/diff.mjs)"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.12.0"
}
```

필드 규칙:
- **`version`** — `"X.Y.Z"` (v 접두사 없음)
- **`date`** — `"YYYY-MM-DD"` 형식. 태그 찍는 날짜 기준
- **`title`** — GitHub Release 제목에서 `"vX.Y.Z — "` 접두사를 뺀 부분 그대로
- **`type`** — `"major"` / `"minor"` / `"patch"` 중 하나 (소문자). 버전 범프 단계와 일치
- **`highlights`** — **3~4줄**로 요약. 풀 본문은 GH Release에 위임. 각 줄은
  "무엇을 / 어떻게" 한 줄로 완결. 커밋 메시지 복붙 대신 사용자 관점 언어
- **`url`** — `https://github.com/sanghyeonKim0201/sh-ui/releases/tag/vX.Y.Z`

**엔트리는 반드시 `versions` 배열 맨 앞에 추가한다** (최신이 위).

### 자동화된 워크플로

릴리즈 커밋을 만들 때 다음 파일들이 **한 커밋에 함께** 들어가야 한다:

1. 실제 변경된 소스/문서
2. `packages/changelog/versions.json` — 새 엔트리 prepend
3. (CLI 변경이면) `packages/cli/package.json` version 필드도 동기화

이후 순서:
1. `git commit` → dev 푸시
2. `git tag vX.Y.Z` → 태그 푸시
3. `gh release create vX.Y.Z ...` — 본문은 versions.json의 `highlights`보다
   풍부하게. 제목은 `"vX.Y.Z — {title}"` 형식

### Claude가 이 규칙을 적용할 때

사용자가 "새 컴포넌트 추가" / "기능 확장" / "버그 수정"류 작업을 의뢰하면:

- 구현 → 테스트 → `pnpm tsc --noEmit` 통과 확인
- `versions.json`에 엔트리를 **prepend**
- 커밋을 **한 번에** 만들고 (소스 + versions.json + 필요 시 CLI package.json)
- 태그 + 릴리즈 생성까지 한 세션 내에 마친다

사용자가 "그냥 저장만" / "커밋하지 마" 같이 명시적으로 멈추라고 하면 물론 중단.

### 예외 — 엔트리를 추가하지 않는 경우

- `docs:` 커밋 (문서만 추가/수정). 예: CLAUDE.md 자체, 새 페이지, API 섹션 보완
- `chore:` / `style:` / `refactor:` / `test:` 커밋
- 사용자가 명시적으로 "이번엔 릴리즈 안 한다"고 한 경우

## 기타 이 레포 고유 관용

### 듀얼 카피본 유지

컴포넌트 소스는 두 곳에 동일하게 존재:
- `packages/registry/react/components/<name>/` — 레지스트리 원본 (CLI가 복사)
- `apps/docs/components/ui/<name>/` — docs 앱이 실제 import하는 복사본

둘을 항상 동기화한다. 원본을 고치면 docs 복사본도 함께 고쳐야 한다. Flutter도 마찬가지
(`packages/registry/flutter/widgets/` ↔ `apps/showcase/lib/widgets/`).

### 듀얼 플랫폼 문서

`apps/docs/app/components/<name>/page.tsx`의 `<CodeTabs>`는 가능하면 React 탭과
Flutter 탭을 모두 제공한다. Flutter 위젯이 없는 컴포넌트(CodePanel 등)는 React만.

### 변경 내역 심볼릭 링크

`apps/showcase/assets/versions.json`은 `packages/changelog/versions.json`의
심볼릭 링크(mode 120000)다. versions.json만 수정하면 양쪽 앱에 자동 반영.
