---
title: sh-ui CLI 컴포넌트 추가는 add.mjs 단일 지점으로 위임된다 (monorepo 라우터는 조회하지 않음)
date: 2026-06-17
category: architecture-patterns
module: packages/cli
problem_type: architecture_pattern
component: tooling
severity: low
applies_when:
  - "컴포넌트 not-found 처리·검증·에러 메시지 등 컴포넌트 단위 로직을 add/remove 경로에 추가할 때"
  - "standalone 과 monorepo 양 경로에 같은 변경이 필요하다고 가정하기 전"
tags: [cli, add-component, monorepo, delegation, dry, did-you-mean]
---

# sh-ui CLI 컴포넌트 추가는 add.mjs 단일 지점으로 위임된다 (monorepo 라우터는 조회하지 않음)

## Context

`sh-ui add <component>` 의 발견성 개선(컴포넌트 오타 시 did-you-mean 추천)을 구현하면서,
구현 계획은 "standalone 경로(`src/add.mjs`)와 monorepo 경로(`src/create/generator.js` 의 `addComponent`)
**두 곳**에 같은 not-found 추천을 넣어야 한다"고 전제했다. 실제 코드를 추적해 보니 이 전제가 틀렸다 —
monorepo 경로에 같은 수정을 넣으려 하면 registry 로딩·조회 로직을 중복 구현하게 되어 DRY 를 위반한다.

## Guidance

**컴포넌트 단위 로직(레지스트리 조회, not-found 처리, CSS 변수 검증, 에러 메시지)은 `src/add.mjs` 내부의
`addComponent` 한 곳에만 둔다.** `src/create/generator.js` 의 `addComponent` 는 **디렉토리 라우터**일 뿐이다 —
컴포넌트별 레지스트리 조회를 직접 하지 않고, 모든 분기에서 `src/add.mjs` 의 `add()` 로 이름 배열을 그대로 위임한다.

검증된 호출 체인:

```
bin/sh-ui.mjs (add case)
  ├─ ctx.kind === "config"  (standalone) ─→ add()         from add.mjs
  └─ else                   (monorepo)   ─→ addComponent() from generator.js
                                              └─ tokens → ui-app, 그 외 → ui-core 디렉토리만 라우팅
                                              └─ 모든 분기가 add() 로 위임 → addOne() → addComponent(add.mjs)
                                                   └─ registry.components?.[name] 조회 + not-found throw
```

따라서 `add.mjs` 의 not-found 지점(`buildNotFoundMessage`)을 고치면 standalone·monorepo **양 경로가 자동으로**
같은 메시지를 쓴다. generator.js 에는 손댈 것이 없다(문서화 주석 외).

```js
// src/add.mjs — 단일 출처. 양 경로가 여기로 수렴한다.
export function buildNotFoundMessage(name, platform, candidates) {
  const hits = suggest(name, candidates);
  const hint = hits.length ? ` 혹시 ${hits.join(", ")}?` : "";
  return `'${name}' 컴포넌트를 ${platform} 레지스트리에서 찾을 수 없습니다.${hint} 전체 목록: sh-ui list --all`;
}
```

## Why This Matters

위임 구조를 모르고 "두 경로에 같은 수정"을 넣으면:

- generator.js 에 registry 로딩·조회를 중복 구현 → 두 곳이 시간이 지나며 어긋난다(drift).
- 같은 메시지 로직이 두 벌이 되어 한쪽만 고치는 버그가 생긴다.

반대로 위임을 활용하면 **한 곳(add.mjs)만 고쳐 양 경로를 커버**하고, 테스트도 단일 함수 단위로 끝난다.
이번 작업에서 monorepo 쪽 "중복 추천 테스트"는 add.mjs 단위 테스트가 이미 커버하므로 제거했다.

## When to Apply

- `sh-ui add` / `sh-ui remove` 의 컴포넌트 처리(조회·검증·메시지·추천)를 바꿀 때 — add.mjs 한 곳만 본다.
- 구현 계획에서 "standalone 과 monorepo 두 경로에 같은 변경"이라는 문장을 쓰기 전에, generator.js 의
  `addComponent` 가 라우터인지 자체 처리인지 **코드로 먼저 확인**한다.

## Examples

플랜이 전제한 것(틀림):

```
# generator.js 의 addComponent 에 registry 조회 + not-found 분기를 추가
const entry = registry.components?.[name];
if (!entry) throw new Error(buildNotFoundMessage(...));
```

→ generator.js 에는 `registry` 변수도, 조회 지점도 없어 추가 불가. registry 로딩을 새로 구현해야 하는데 그건 DRY 위반.

실제로 한 일(맞음):

- `add.mjs` 의 not-found 지점에만 `buildNotFoundMessage` 적용 → 위임 덕에 monorepo 도 자동 적용.
- `generator.js` 에는 위임 구조를 설명하는 주석만 추가.

## Related

- 설계: `docs/superpowers/specs/2026-06-17-sh-ui-dx-discoverability-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-17-sh-ui-dx-discoverability.md`
