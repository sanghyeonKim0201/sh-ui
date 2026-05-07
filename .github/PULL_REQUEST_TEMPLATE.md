<!-- 제목은 Conventional Commits 형식으로: feat: …, fix: …, docs: … -->

## 요약

<!-- 무엇을 / 왜 바꿨는지 1-3 문장 -->

## 변경 종류

- [ ] feat — 신규 컴포넌트 / 기능
- [ ] fix — 버그 수정
- [ ] docs — 문서만
- [ ] chore / refactor / style / test
- [ ] breaking change

## 체크리스트

- [ ] base 브랜치가 맞다 (`dev` 작업 / `live` 는 릴리즈 PR)
- [ ] `pnpm tsc --noEmit` 통과
- [ ] (컴포넌트 변경) 레지스트리 원본 ↔ docs 복사본 동기화
  - `packages/registry/react/components/<name>/` ↔ `apps/docs/components/ui/<name>/`
  - `packages/registry/flutter/widgets/` ↔ `apps/showcase/lib/widgets/`
- [ ] (릴리즈 대상) `packages/changelog/versions.json` 엔트리 prepend
- [ ] (CLI 변경) `packages/cli/package.json` version 동기화

## 스크린샷 / GIF

<!-- UI 변경이면 before / after -->

## 관련 이슈

<!-- closes #123 -->
