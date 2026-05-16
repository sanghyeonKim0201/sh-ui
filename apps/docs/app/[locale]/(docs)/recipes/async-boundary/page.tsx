export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function AsyncBoundaryRecipe() {
  return (
    <main className="container">
      <h1>AsyncBoundary 패턴</h1>
      <p className="muted">
        Suspense + ErrorBoundary 를 한 번에 묶고, Skeleton · Error fallback 을
        해당 UI 폴더 안에 동거시키는 컨벤션. 베이스에 직접 만들어 쓴다.
      </p>

      <h2>왜 묶나</h2>
      <ul>
        <li>
          Suspense 와 ErrorBoundary 를 따로 쓰면 항상 같은 위치에 두 번 감싸야
          한다 — 추상화로 정리.
        </li>
        <li>
          한 컴포넌트의 로딩 fallback 과 에러 fallback 은 같은 영역에 그려져야
          UI 가 깨지지 않는다 — 둘을 묶어 한 경계로 다룬다.
        </li>
        <li>
          수동 <code>isLoading</code>/<code>isError</code> 분기를 컴포넌트
          내부에서 안 쓰게 됨 — 컴포넌트는 데이터가 있는 경우만 그린다.
        </li>
      </ul>

      <h2>설치</h2>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add react-error-boundary`}
      />

      <h2>구현</h2>
      <CodePanel
        language="tsx"
        filename="src/shared/ui/AsyncBoundary/index.tsx"
        code={`'use client';

import { Suspense, type ComponentType, type ReactNode } from 'react';
import {
  ErrorBoundary,
  type FallbackProps,
} from 'react-error-boundary';

type AsyncBoundaryProps = {
  children: ReactNode;
  suspenseFallback: ReactNode;
  errorFallback: ComponentType<FallbackProps>;
};

export function AsyncBoundary({
  children,
  suspenseFallback,
  errorFallback,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}`}
      />

      <h2>폴더 컨벤션</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`src/widgets/order/OrderList/
├── index.tsx                    # AsyncBoundary 래핑 + Content 정의
├── Skeleton/
│   └── OrderListSkeleton.tsx
└── Error/
    └── OrderListError.tsx`}
      />
      <p>
        Skeleton 과 Error fallback 은 <strong>해당 컴포넌트 폴더 안</strong>에 둔다.
        외부 공통 폴더에 모으면 어느 컴포넌트의 fallback 인지 추적하기 어려워진다.
      </p>

      <h2>사용 패턴 — Content/Wrapper 분리</h2>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderList/index.tsx"
        code={`'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { AsyncBoundary } from '@/src/shared/ui/AsyncBoundary';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

import { OrderListSkeleton } from './Skeleton/OrderListSkeleton';
import { OrderListError } from './Error/OrderListError';

function OrderListContent() {
  const { data: orders } = useSuspenseQuery(orderQueries.list());
  return <OrderListView orders={orders} />;
}

export function OrderList() {
  return (
    <AsyncBoundary
      suspenseFallback={<OrderListSkeleton />}
      errorFallback={OrderListError}
    >
      <OrderListContent />
    </AsyncBoundary>
  );
}`}
      />
      <p>
        <strong>Content 와 Wrapper 분리</strong>가 핵심:{" "}
        <code>useSuspenseQuery</code>는 <code>Suspense</code> 내부에서만
        suspend 되어야 하므로, <code>AsyncBoundary</code>를 사용하는 컴포넌트
        자신이 query 를 호출하면 suspend 가 자기 fallback 을 트리거하지 못한다.
      </p>

      <h2>Skeleton 작성</h2>
      <p>
        실제 컴포넌트의 <strong>레이아웃 박스를 그대로 그린다</strong>. 공간이
        다르면 데이터 도착 시 점프가 발생.
      </p>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderList/Skeleton/OrderListSkeleton.tsx"
        code={`import { Skeleton } from '@/components/ui/skeleton';

export function OrderListSkeleton() {
  return (
    <div className="sh-ui-stack">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}`}
      />
      <p className="muted">
        모노레포 템플릿에서는{" "}
        <code>@workspace/ui/components/skeleton</code> 으로 import.
      </p>

      <h2>Error fallback + 재시도</h2>
      <p>
        <code>react-error-boundary</code>의 <code>FallbackProps</code>는{" "}
        <code>resetErrorBoundary</code> 콜백을 준다 — 호출하면 ErrorBoundary 를
        리셋하고 자식을 다시 렌더한다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderList/Error/OrderListError.tsx"
        code={`import type { FallbackProps } from 'react-error-boundary';

import { Button } from '@/components/ui/button';
import { ApiError } from '@/src/shared/api/error';

export function OrderListError({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const message =
    error instanceof ApiError
      ? error.data?.message ?? '주문 목록을 불러오지 못했습니다.'
      : '예기치 않은 오류가 발생했습니다.';

  return (
    <div role="alert" className="sh-ui-stack">
      <p>{message}</p>
      <Button onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
}`}
      />

      <h2>Query 재시도 — TanStack Query 와의 관계</h2>
      <p>
        <code>resetErrorBoundary</code>는 React 트리만 리셋한다. 같은 query 가
        실패한 채로 캐시에 남아 있으면 재시도해도 같은 에러가 다시 throw 된다.
        해결책 두 가지:
      </p>
      <ul>
        <li>
          <strong>QueryErrorResetBoundary 와 결합</strong> — TanStack Query
          전용 helper 가 ErrorBoundary 리셋 시 query 를 함께 리셋한다.
        </li>
        <li>
          <strong>retry 옵션 활용</strong> —{" "}
          <code>QueryClient defaultOptions</code>에 <code>retry: 1</code> 같은
          기본값을 둬서 일시적 실패를 자동 회복 (베이스 기본값).
        </li>
      </ul>
      <CodePanel
        language="tsx"
        filename="QueryErrorResetBoundary 통합 (선택)"
        code={`import { QueryErrorResetBoundary } from '@tanstack/react-query';

export function ResettableAsyncBoundary({
  children,
  suspenseFallback,
  errorFallback: ErrorFallback,
}: AsyncBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
        >
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}`}
      />
      <p className="muted">
        대부분의 케이스는 단순 <code>AsyncBoundary</code>로 충분. 일시적
        실패가 잦은 화면만 위 <code>QueryErrorResetBoundary</code> 통합을 쓴다.
      </p>

      <h2>중첩 AsyncBoundary</h2>
      <p>
        한 페이지에 여러 독립 데이터 영역이 있으면 각 영역을 별도{" "}
        <code>AsyncBoundary</code>로 감싼다. 한 영역이 실패해도 다른 영역은
        영향 없음.
      </p>
      <CodePanel
        language="tsx"
        code={`<div>
  <AsyncBoundary suspenseFallback={<HeaderSkeleton />} errorFallback={HeaderError}>
    <UserHeader />
  </AsyncBoundary>

  <AsyncBoundary suspenseFallback={<OrderListSkeleton />} errorFallback={OrderListError}>
    <OrderList />
  </AsyncBoundary>
</div>`}
      />
    </main>
  );
}
