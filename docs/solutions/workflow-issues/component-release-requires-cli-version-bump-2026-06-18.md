---
title: 컴포넌트만 추가한 릴리즈도 cli version bump가 필수다 (registry가 npm 번들)
date: 2026-06-18
category: workflow-issues
module: packages/cli
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "새 컴포넌트/위젯을 추가하고 vX.Y.Z 태그로 릴리즈할 때"
  - "릴리즈 변경이 packages/cli 코드를 직접 건드리지 않을 때 (registry/docs/tokens 만 변경)"
tags: [release, npm-publish, cli-version, registry-bundle, tag-mismatch]
---

# 컴포넌트만 추가한 릴리즈도 cli version bump가 필수다 (registry가 npm 번들)

## Context

Tree 컴포넌트(v0.117.0)를 릴리즈하면서 "React Tree 는 CLI 코드를 안 건드리니 `packages/cli/package.json`
version 은 bump 하지 않는다"고 판단했다. 결과: `live` 태그 `v0.117.0` push 후 **npm publish 가 실패**했고
(GitHub Release 는 생성됨), npm 최신은 0.116.0 에 머물러 사용자가 `npx sh-ui-cli add tree` 를 하면
not-found 가 나는 상태가 됐다.

## Guidance

**sh-ui 의 모든 `vX.Y.Z` 릴리즈는 `packages/cli/package.json` version 을 태그와 동일하게 bump 해야 한다 —
컴포넌트/registry/토큰만 변경한 릴리즈라도 예외 없이.**

이유는 registry 가 별도 배포 채널이 아니라 **`sh-ui-cli` npm 패키지에 번들**되기 때문이다:

- `packages/cli/src/paths.mjs` — 출고 모드(`npx sh-ui-cli`)에서 컴포넌트 소스를 `<cli>/data/registry` 에서
  읽는다. `prepublishOnly` 가 모노레포의 `packages/registry` 를 `data/` 로 복사해 번들한다.
- 즉 새 컴포넌트가 사용자에게 닿으려면 **새 registry 를 포함한 cli 를 npm 에 republish** 해야 한다.
- `publish.yml` 의 첫 단계 "Verify tag matches package version" 이 `태그 v$TAG ≠ cli/package.json version`
  이면 `exit 1` 로 **publish 를 차단**한다(0.116.0 재발행이 아니라, 시작 전에 막힘).

따라서 릴리즈 커밋에 반드시 포함:
1. 실제 변경(컴포넌트 소스, registry.json, docs)
2. `packages/changelog/versions.json` 엔트리 prepend
3. **`packages/cli/package.json` version = 태그 버전** ← 이게 컴포넌트-only 릴리즈에서 빠지기 쉽다

## Why This Matters

- cli version 을 안 올리면 `publish.yml` 이 차단 → npm 미배포 → 사용자가 새 컴포넌트를 `add` 로 못 받는다.
- GitHub Release 와 versions.json(changelog)은 태그만으로 생성되므로 "릴리즈한 것처럼" 보이지만,
  정작 배포 채널인 npm 에는 안 올라가 **조용한 반쪽 릴리즈**가 된다.
- 복구하려면 cli bump PR → 머지 → 태그 재지정(force) → publish 재발동이라 비용이 크다.

## When to Apply

- 새 컴포넌트(React/Flutter)·새 registry 엔트리·토큰 변경 등 **cli 코드를 안 건드리는 릴리즈**를 찍을 때.
- 릴리즈 체크리스트에서 "이번엔 CLI 변경이 없으니 package.json 은 그대로" 라는 생각이 들면 — **틀렸다.**
  registry 번들 구조상 cli version 은 항상 태그와 같이 올린다.

## Examples

틀린 판단(이번 사고):

```
T8 릴리즈 plan: "React Tree 는 CLI 를 안 건드리니 packages/cli/package.json version 은 bump 안 함."
→ 태그 v0.117.0, cli 0.116.0 → publish.yml verify 차단 → npm 미배포.
```

올바른 릴리즈 커밋(예: v0.117.0 복구):

```diff
# packages/cli/package.json
-  "version": "0.116.0",
+  "version": "0.117.0",
```

복구 절차(이미 태그를 잘못 찍었을 때):
1. `packages/cli/package.json` version 을 태그와 일치하게 bump (dev → live PR, repo 정책상 live 는 PR 게이트)
2. 머지 후 `git tag -f vX.Y.Z <new-commit>` + `git push -f origin vX.Y.Z`
3. publish.yml 재발동 → `npm view sh-ui-cli version` 으로 확인

## Related

- `packages/cli/src/paths.mjs` — 번들/출고 모드 registry 경로 해석
- `.github/workflows/publish.yml` — "Verify tag matches package version" 단계
- `CLAUDE.md` "변경 내역(패치노트) 자동 반영" — 릴리즈 시 versions.json + cli package.json 동기화 규칙
