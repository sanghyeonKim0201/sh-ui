# sh-ui 작업 규칙

공통 규칙은 `.claude/rules/` 서브모듈을 따른다(common/nextjs/ui 등). 이 파일은
**이 레포에만 적용되는 관용**만 기록한다.

## 변경 내역(패치노트) 자동 반영

sh-ui는 `packages/changelog/versions.json`을 단일 소스로 두고 docs(React)와
showcase(Flutter)가 그 파일을 읽어 "변경 내역" 페이지를 렌더한다.

**원칙: 새 릴리즈를 찍을 때마다 versions.json에 엔트리를 추가한다.**

### 트리거 — 언제 엔트리를 추가하는가

공통 규칙(`.claude/rules/common/common.md`)의 버전 범프 기준과 동일:

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
