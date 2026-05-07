# Contributing to sh-ui

기여 환영합니다. 이 문서는 이 레포에만 적용되는 관용을 정리한 것이고,
공통 규칙은 [`.ai/rules/`](./.ai/rules/) 서브모듈을 따릅니다.

## 시작하기

```bash
git clone --recurse-submodules https://github.com/sanghyeonKim0201/sh-ui.git
cd sh-ui
pnpm install
pnpm dev          # apps/docs (localhost:3000)
```

서브모듈을 깜빡했다면:

```bash
git submodule update --init --recursive
```

## 브랜치 정책

- **`dev`** — 작업 브랜치. 직접 push OK.
- **`live`** — 릴리즈 게이트. PR 경유로만 머지하고, 태그(`vX.Y.Z`)는 항상 `live` 에서 찍습니다.

태그 푸시가 npm publish + GitHub Release 자동 생성을 트리거하므로
**dev 에서 직접 태그 찍는 것은 금지**입니다.

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 를 따릅니다.

| Prefix | 의미 | 버전 범프 |
|---|---|---|
| `feat:` | 신규 기능 / 새 컴포넌트 | MINOR |
| `fix:` | 버그 수정 | PATCH |
| `feat!:` / `BREAKING CHANGE:` | breaking | MAJOR |
| `docs:` / `chore:` / `style:` / `refactor:` / `test:` | — | 없음 |

## 컴포넌트 추가 시 체크리스트

sh-ui 의 컴포넌트 소스는 두 곳에 존재합니다:

- `packages/registry/react/components/<name>/` — 레지스트리 원본 (CLI 가 복사)
- `apps/docs/components/ui/<name>/` — docs 앱이 import 하는 복사본

**둘을 항상 동기화**하세요. Flutter 도 동일
(`packages/registry/flutter/widgets/` ↔ `apps/showcase/lib/widgets/`).

또한:

1. `apps/docs/app/components/<name>/page.tsx` 에 문서 페이지 추가 (React + Flutter 탭)
2. `pnpm tsc --noEmit` 통과
3. 릴리즈 대상이면 `packages/changelog/versions.json` 에 엔트리 prepend

## 릴리즈 흐름

릴리즈 가능한 변경(`feat` / `fix` / `feat!`)이라면:

1. `versions.json` 에 새 엔트리를 **배열 맨 앞**에 추가
2. (CLI 변경이면) `packages/cli/package.json` 의 `version` 동기화
3. 소스 + versions.json + package.json 을 **한 커밋**으로
4. `git push origin dev`
5. `gh pr create --base live --head dev --title "release: vX.Y.Z — {title}"`
6. CI 그린 → 머지
7. `git checkout live && git pull && git tag vX.Y.Z && git push origin vX.Y.Z`

태그 push 가 publish.yml(npm) + release.yml(GH Release) 을 동시에 발동시킵니다.

## PR 가이드

- PR 은 항상 `dev` 또는 `live` 를 base 로
- `pnpm tsc --noEmit` / 관련 테스트 통과 확인
- 스크린샷이 의미 있는 변경이면 PR 본문에 첨부
- 컴포넌트 추가/변경이면 docs 페이지 동시 업데이트

## 질문 / 제보

- 버그 / 기능 제안: [GitHub Issues](https://github.com/sanghyeonKim0201/sh-ui/issues)
- 보안 이슈: [SECURITY.md](./SECURITY.md) 참고
