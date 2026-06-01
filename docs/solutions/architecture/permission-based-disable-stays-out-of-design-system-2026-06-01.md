---
module: architecture/permission-affordance
date: 2026-06-01
problem_type: architecture
component: registry/react/button
related_components:
  - registry/flutter/widgets/button
  - apps/docs/components/ui/button
applies_when:
  - "공용 디자인 시스템 컴포넌트(Button 등)를 여러 앱이 공유하는데, 액션을 권한별로 막아야 할 때"
  - "같은 액션(삭제 등)이 어느 페이지에선 허용, 어느 페이지에선 금지로 갈릴 때"
  - "프로젝트마다 권한 모델이 다름 — 어떤 건 앱별로 제각각, 어떤 건 공통 auth 한 소스"
  - "권한 prop을 컴포넌트에 직접 넣고 싶은 유혹이 들 때"
root_cause: scope_boundary
resolution_type: design_pattern
tags:
  - permissions
  - rbac
  - authorization
  - design-system-boundary
  - composition
  - accessibility
  - aria-disabled
  - separation-of-concerns
---

# 권한별 버튼 비활성화는 디자인 시스템 밖에 둔다 — Button은 dumb하게, `can`만 앱이 주입

## Context

모노레포에서 `Button`을 공용 패키지에 빼두고 여러 앱이 공유하는데, "이 유저가 이
액션을 할 수 있나"에 따라 버튼을 비활성화할 일이 생긴다. 그러면 "권한이 앱마다
다른데 버튼을 공용으로 쓸 수 있나"라는 의문이 든다.

이 의문은 **서로 다른 두 관심사가 한 덩어리로 묶여서** 생긴다.

| 질문 | 누구 책임 | 디자인 시스템이 알아야 하나 |
|---|---|---|
| **"이 유저가 이 액션을 할 수 있나"** (정책 / RBAC) | 앱·도메인 | ❌ 절대 모름 |
| **"할 수 없는 액션을 어떻게 보여줄까"** (어포던스) | 디자인 시스템 | ✅ 의견 가져도 됨 |

"권한이 앱마다 다르다"는 건 **위쪽 줄**이다. 그건 디자인 시스템이 맞출 수 없고,
맞추려 들면 안 된다. sh-ui의 `Button`은 이미 `React.ButtonHTMLAttributes`를
펼치므로 `disabled`를 받는다 — 즉 컴포넌트는 권한을 영원히 몰라도 된다.

## Guidance

**Button은 손대지 않는다.** 권한이라는 단어를 컴포넌트가 알게 되는 순간, 디자인
시스템이 특정 권한 모델을 강제하게 된다. 다음은 안티패턴:

```tsx
// ❌ 디자인 시스템이 RBAC에 결합됨 — role 이름·권한 키·auth 소스를 알게 됨
<Button requires="post:delete" role={user.role} />
```

대신 **"이 액션 할 수 있어?"에 답하는 함수 하나(`can`)** 만 앱이 정의한다. 권한
규칙이 무엇이든 시그니처는 동일하게 유지한다. sh-ui가 의지하는 유일한 약속은 이
함수의 **결과가 boolean**이라는 것뿐이다.

```tsx
// 앱이 소유 — sh-ui는 이 안을 영원히 모름
const can = (action, resource) => /* 앱의 권한 규칙 */;

// 같은 Button, 모든 앱·모든 페이지에서 글자 하나 안 바꿈
<Button disabled={!can('delete', 'order')}>주문 삭제</Button>
```

**경계선 판단 기준 (한 줄):**

> 이걸 만들려면 role 이름(admin, manager…)을 알아야 하나?
> - 알아야 하면 → **앱 영역** (디자인 시스템에 넣지 마)
> - "보이는 방식"만 알면 되면 → **디자인 시스템 후보**

이 기준으로 조각을 나누면:

| 조각 | 어디에 | 이유 |
|---|---|---|
| `matrix` · role · resource · `can` 규칙 | **앱, 항상** | role 이름을 알아야 함 |
| 주입 이음새 (`PermissionProvider` / `usePermission`) | **앱 (이 레시피)** | role은 모르지만 *앱 아키텍처* 모양이지 *디자인* 모양이 아님 |
| "불가 액션을 어떻게 보이나" (disabled + 사유, a11y) | **sh-ui 후보** | role 몰라도 됨 — 유일하게 디자인 시스템 모양 |

## Why This Matters

권한 Provider/matrix를 디자인 시스템에 넣지 않는 이유는 단순한 "결합 회피"가
아니라 구체적 비용 때문이다.

1. **카테고리 에러** — Provider가 정책을 0개 담아도, 디자인 시스템이 "권한 주입은
   이렇게 하라"는 *아키텍처 의견*을 갖게 된다. sh-ui는 디자인 시스템 도구일 뿐이다.
   shadcn 계열도 authz는 건드리지 않는다.
2. **유지보수 폭증** — sh-ui는 컴포넌트마다 듀얼 카피(`packages/registry/react` ↔
   `apps/docs/components/ui`) + Flutter 패리티 + showcase + 문서 페이지 +
   `versions.json`을 따라가야 한다. 15줄짜리 React context 하나에 이 비용 전부를
   무는 건 손해다. 게다가 Flutter엔 React Context가 없어 패리티가 안 맞는다
   (InheritedWidget/Provider로 다시 설계해야 함).
3. **버전 결합** — 소비 프로젝트마다 authz가 제각각인데, 공용 Provider를 sh-ui가
   버전업하면 무관한 앱들이 영향받는다.

## When to Apply

- 공용 Button(또는 임의의 액션 컴포넌트)을 권한별로 막아야 할 때 → **항상 이 패턴**.
  컴포넌트엔 `disabled` boolean만, 그 boolean을 계산하는 authz는 앱에.
- 권한 모델이 단순(action만)에서 복잡(role × resource × ownership)으로 커져도
  **이음새는 그대로** — `can`의 인자만 늘어난다.
- `disabledReason` 같은 a11y 어포던스를 sh-ui로 승격하는 건 **"3번 법칙" 통과 후**:
  여러 프로젝트에서 같은 "disabled + 사유" UX를 복붙하게 되어, 공용으로 빠질 게
  정말 "보이는 방식"뿐임이 확인됐을 때만.

## Examples

### 1. 권한 매트릭스 — role × resource × action (앱 코드, sh-ui 아님)

```tsx
// 앱의 authz 모듈 — role을 알아야 하므로 100% 앱 영역
const matrix = {
  admin:   { order: ['view', 'edit', 'delete'], employee: ['view', 'edit', 'delete'] },
  manager: { order: ['view', 'edit', 'delete'], employee: ['view'] },
  orderer: { order: ['view', 'edit'],           employee: [] },
  hr:      { order: ['view'],                    employee: ['view', 'edit', 'delete'] },
};

function can(action, resource) {
  return matrix[user.role]?.[resource]?.includes(action) ?? false;
}
```

같은 "삭제" 버튼이 페이지(resource)마다 자동으로 갈린다 — `manager`는 주문은 삭제
가능, 직원은 view만:

```tsx
<Button disabled={!can('delete', 'order')}>주문 삭제</Button>     {/* manager → 활성 */}
<Button disabled={!can('delete', 'employee')}>직원 삭제</Button>  {/* manager → 자동 비활성 */}
```

### 2. 주입 이음새 — `PermissionProvider` + `usePermission` (앱 코드)

권한 규칙은 0개 들어있는 "배달부". 앱별로 다른 `can`을 꽂는다 — 앱마다 권한이 완전
다르면 앱별로 다른 provider, 공통 auth 한 소스면 하나만.

```tsx
const PermissionContext = React.createContext((..._args) => true);

export function PermissionProvider({ can, children }) {
  return <PermissionContext.Provider value={can}>{children}</PermissionContext.Provider>;
}
export function usePermission() {
  return React.useContext(PermissionContext);
}
```

```tsx
// 앱 A — role 기반
<PermissionProvider can={(a, r) => matrix[user.role]?.[r]?.includes(a) ?? false}>
  <App />
</PermissionProvider>

// 앱 B — 공통 auth 서버가 내려준 권한 목록 기반. 같은 컴포넌트, can만 다름.
<PermissionProvider can={(a, r) => user.permissions.includes(`${r}:${a}`)}>
  <App />
</PermissionProvider>
```

소비처는 어느 앱이든 동일:

```tsx
function DeleteButton({ resource }) {
  const can = usePermission();
  return <Button disabled={!can('delete', resource)}>삭제</Button>;
}
```

### 3. (선택) `<Can>` 래퍼 — `disabled={!can(...)}` 반복 줄이기 (앱 코드)

```tsx
function Can({ action, resource, children, mode = 'disable' }) {
  const can = usePermission();
  const allowed = can(action, resource);
  if (mode === 'hide') return allowed ? children : null;
  return React.cloneElement(children, { disabled: !allowed });
}

// 사용
<Can action="delete" resource="order">
  <Button>주문 삭제</Button>
</Can>
```

### 4. 소유권 기반까지 — "내가 쓴 글만 삭제" (인자 하나 더)

데이터 단위로 갈리는 케이스도 이음새는 동일하다. `can`에 대상 객체를 넘긴다:

```tsx
function can(action, resource, item) {
  if (!matrix[user.role]?.[resource]?.includes(action)) return false;
  if (action === 'delete' && resource === 'post') return item?.authorId === user.id;
  return true;
}

<Button disabled={!can('delete', 'post', post)}>내 글 삭제</Button>
```

### 5. a11y 주의 — `disabled`의 함정

진짜 `disabled` 속성은 버튼을 **포커스/탭 순서에서 제거**하고 pointer 이벤트도 안
잡혀, 스크린리더 사용자는 "왜 못 누르는지"는커녕 버튼 존재조차 놓칠 수 있고
hover 툴팁도 직접 안 붙는다. 권한 차단처럼 "이유를 알려줘야 하는" 비활성은
`aria-disabled="true"` + 사유 안내(툴팁 / `sr-only`)가 더 낫다 — 단 이 경우
요소는 여전히 클릭 가능하므로 핸들러에서 실제 동작을 막아야 한다.

이 "불가 어포던스"가 **유일하게 sh-ui로 승격을 고려할 만한 부분**이다 (role을
모르므로 판단 기준 통과). 다만 YAGNI — 반복이 확인되기 전엔 앱에 둔다. 승격 시
형태(권한이 아니라 표현):

```tsx
// 미래의 sh-ui Button — disabledReason은 role도 권한도 모름. "비활성 사유" 문자열일 뿐.
<Button disabled={!can('delete', 'order')} disabledReason="삭제 권한이 없습니다">
  주문 삭제
</Button>
```

## Reference

- `packages/registry/react/components/button/` — `Button`은 이미 `disabled`를 받는
  dumb 컴포넌트. 권한 prop 추가 금지.
- 판단 기준: "role 이름을 알아야 하면 앱, 보이는 방식만 알면 sh-ui 후보."
- 승격 규칙: "3번 법칙" — 여러 프로젝트가 같은 표현을 복붙할 때 그 *순수 표현*만
  Button MINOR로 승격.
