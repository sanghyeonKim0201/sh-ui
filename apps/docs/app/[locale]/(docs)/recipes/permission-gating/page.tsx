export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function PermissionGatingRecipe() {
  return (
    <main className="container">
      <h1>권한별 비활성화 (Permission Gating)</h1>
      <p className="muted">
        <code>Button</code> 같은 공용 컴포넌트를 사용자 권한에 따라 비활성화하되,
        권한 규칙(RBAC)은 컴포넌트 밖에 두는 패턴. 디자인 시스템 컴포넌트는 그대로
        공유하고, &quot;이 액션을 할 수 있는가&quot;만 앱이 주입한다.
      </p>

      <h2>두 관심사를 분리한다</h2>
      <p>
        &quot;버튼을 권한별로 막아야 한다&quot;는 요구는 서로 다른 두 가지가 한
        덩어리로 묶여 있다. 이걸 떼어내는 게 핵심이다.
      </p>
      <ul>
        <li>
          <strong>누가 할 수 있나 (정책 / RBAC)</strong> — 앱·도메인 책임.
          프로젝트마다 다르므로 디자인 시스템이 알면 안 된다.
        </li>
        <li>
          <strong>할 수 없는 액션을 어떻게 보이나 (어포던스)</strong> — 디자인
          시스템 책임. <code>disabled</code> 스타일, 사유 표시 등.
        </li>
      </ul>
      <p>
        sh-ui <code>Button</code>은 이미 <code>disabled</code>를 받는 dumb
        컴포넌트다. 권한을 컴포넌트에 넣지 말고, <code>disabled</code> 값만 한 층
        위에서 계산한다. 그러면 <strong>버튼은 모든 앱에서 그대로 공용</strong>이고,
        앱마다 달라지는 건 권한 함수뿐이다.
      </p>

      <h2>안티패턴 — 컴포넌트에 권한을 넣지 않는다</h2>
      <CodePanel
        language="tsx"
        showLineNumbers={false}
        code={`// 디자인 시스템이 RBAC에 결합됨 — role 이름·권한 키를 알게 된다
<Button requires="post:delete" role={user.role} />`}
      />
      <p>
        role 이름이나 권한 키를 컴포넌트가 알게 되는 순간, 디자인 시스템이 특정
        권한 모델을 강제하게 된다. 프로젝트마다 권한 모델이 달라 충돌한다.
      </p>

      <h2>can 함수 — 앱이 정의한다</h2>
      <p>
        &quot;이 액션 할 수 있어?&quot;에 답하는 함수 하나만 앱이 만든다. 규칙이
        무엇이든 시그니처는 <code>(action, resource) =&gt; boolean</code> 으로
        동일하게 유지한다. 권한 모델이 복잡해져도 그 복잡함은 전부 이 함수 안에
        숨는다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/shared/auth/can.ts"
        code={`// role × resource × action — 앱의 권한 모델 (디자인 시스템은 이걸 모른다)
const matrix: Record<string, Record<string, string[]>> = {
  admin:   { order: ['view', 'edit', 'delete'], employee: ['view', 'edit', 'delete'] },
  manager: { order: ['view', 'edit', 'delete'], employee: ['view'] },
  orderer: { order: ['view', 'edit'],           employee: [] },
  hr:      { order: ['view'],                    employee: ['view', 'edit', 'delete'] },
};

export function can(role: string, action: string, resource: string): boolean {
  return matrix[role]?.[resource]?.includes(action) ?? false;
}`}
      />

      <h2>사용 — 같은 버튼, 페이지(resource)만 다름</h2>
      <CodePanel
        language="tsx"
        code={`// 주문 페이지
<Button disabled={!can(user.role, 'delete', 'order')}>주문 삭제</Button>

// 직원 페이지
<Button disabled={!can(user.role, 'delete', 'employee')}>직원 삭제</Button>`}
      />
      <p>
        <code>manager</code> 로 로그인하면 주문 페이지의 삭제는 활성, 직원 페이지의
        삭제는 자동 비활성. <strong>같은 버튼이 페이지마다 알아서 달라진다.</strong>{" "}
        role 이 admin·orderer·hr 로 나뉘어도 매트릭스 한 줄씩 추가하면 끝.
      </p>

      <h2>Provider — prop drilling 줄이기</h2>
      <p>
        <code>user.role</code> 을 매번 넘기기 싫으면 <code>can</code> 을 context
        로 주입한다. 권한 규칙은 0개 들어있는 &quot;배달부&quot;다 — 앱마다 다른
        규칙을 꽂아도 컴포넌트는 그대로 공유된다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/shared/auth/PermissionProvider.tsx"
        code={`'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Can = (action: string, resource: string) => boolean;

const PermissionContext = createContext<Can>(() => false);

export function PermissionProvider({
  can,
  children,
}: {
  can: Can;
  children: ReactNode;
}) {
  return (
    <PermissionContext.Provider value={can}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermission = () => useContext(PermissionContext);`}
      />
      <CodePanel
        language="tsx"
        filename="app entry"
        code={`// 앱마다 자기 규칙을 주입 — 공통 auth 한 소스든, 앱별 제각각이든 can 뒤로 숨는다
<PermissionProvider can={(action, resource) => can(user.role, action, resource)}>
  <App />
</PermissionProvider>`}
      />
      <CodePanel
        language="tsx"
        code={`function DeleteButton({ resource }: { resource: string }) {
  const can = usePermission();
  return <Button disabled={!can('delete', resource)}>삭제</Button>;
}`}
      />

      <h2>(선택) Can 래퍼</h2>
      <p>
        <code>disabled</code> 계산 반복이 잦으면 얇은 래퍼로 정리한다. 비활성 대신
        아예 숨기는 모드도 함께 둘 수 있다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/shared/auth/Can.tsx"
        code={`'use client';

import { cloneElement, type ReactElement } from 'react';
import { usePermission } from './PermissionProvider';

type CanProps = {
  action: string;
  resource: string;
  mode?: 'disable' | 'hide';
  children: ReactElement<{ disabled?: boolean }>;
};

export function Can({ action, resource, mode = 'disable', children }: CanProps) {
  const can = usePermission();
  const allowed = can(action, resource);

  if (mode === 'hide') return allowed ? children : null;
  return cloneElement(children, { disabled: !allowed });
}`}
      />
      <CodePanel
        language="tsx"
        code={`<Can action="delete" resource="order">
  <Button>주문 삭제</Button>
</Can>`}
      />

      <h2>소유권 기반 — &quot;내 글만 삭제&quot;</h2>
      <p>
        데이터 단위로 갈리는 경우(작성자만 삭제 가능 등)도 이음새는 동일하다.
        <code>can</code> 에 대상 객체를 인자로 하나 더 넘긴다.
      </p>
      <CodePanel
        language="tsx"
        code={`function can(role: string, action: string, resource: string, item?: { authorId: string }) {
  if (!matrix[role]?.[resource]?.includes(action)) return false;
  if (action === 'delete' && resource === 'post') {
    return item?.authorId === currentUser.id;
  }
  return true;
}

<Button disabled={!can(user.role, 'delete', 'post', post)}>내 글 삭제</Button>`}
      />

      <h2>접근성 — disabled 의 함정</h2>
      <p>
        진짜 <code>disabled</code> 속성은 버튼을 <strong>포커스·탭 순서에서
        제거</strong>하고 pointer 이벤트도 막아, 스크린리더 사용자는 &quot;왜 못
        누르는지&quot;는커녕 버튼 존재조차 놓칠 수 있다. 권한 차단처럼 사유를
        알려줘야 하는 비활성은 <code>aria-disabled</code> + 사유 표시가 낫다 — 단
        요소가 여전히 클릭 가능하므로 핸들러에서 실제 동작을 막아야 한다.
      </p>
      <CodePanel
        language="tsx"
        code={`// disabled 대신 aria-disabled + 사유 — 포커스 유지, 스크린리더가 사유를 읽는다
<Button
  aria-disabled={!allowed}
  title={!allowed ? '삭제 권한이 없습니다' : undefined}
  onClick={(e) => {
    if (!allowed) {
      e.preventDefault();
      return;
    }
    onDelete();
  }}
>
  주문 삭제
</Button>`}
      />

      <h2>경계선</h2>
      <p>
        권한 매트릭스를 설계하는 일 자체는 디자인 시스템이 대신 해줄 수 없는, 앱의
        고유 업무다. role 을 어떻게 나눌지, resource 를 어떻게 쪼갤지는 프로젝트마다
        다르다. 디자인 시스템이 보는 것은 <code>disabled</code> boolean 하나뿐이고,
        그 뒤에 매트릭스가 있든 role 이 50개든 전혀 모른다 — 그래서 어떤 권한 모델이
        와도 같은 <code>Button</code> 을 공용으로 쓸 수 있다.
      </p>
    </main>
  );
}
