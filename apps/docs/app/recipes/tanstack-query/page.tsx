export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function TanstackQueryRecipe() {
  return (
    <main className="container">
      <h1>TanStack Query 셋업</h1>
      <p className="muted">
        Provider 위치, Devtools, Suspense 모드, hydration, mutation 패턴.
        템플릿에는 이미 박혀 있는 내용을 정리.
      </p>

      <h2>Provider 위치</h2>
      <p>
        템플릿의 <code>GlobalProvider</code>가 이미{" "}
        <code>QueryClientProvider</code>와{" "}
        <code>TanstackDevtoolsProvider</code>를 끼워 둔다. 위치는{" "}
        <code>ThemeProviders</code> 안, <code>Toaster</code>를 감싸는 형태.
      </p>
      <CodePanel
        language="tsx"
        filename="src/app/providers/GlobalProvider/index.tsx"
        code={`<ThemeProviders>
  <QueryClientProvider>
    <TanstackDevtoolsProvider>
      <Toaster />
      {children}
    </TanstackDevtoolsProvider>
  </QueryClientProvider>
</ThemeProviders>`}
      />

      <h2>QueryClient 기본 옵션</h2>
      <CodePanel
        language="tsx"
        filename="src/app/providers/tanstack/QueryClientProvider.tsx"
        code={`'use client';
import {
  QueryClient,
  QueryClientProvider as TanstackQueryClientProvider,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}`}
      />
      <p>
        <strong><code>useState</code>로 한 번만 생성</strong>하는 게 핵심 —{" "}
        모듈 스코프에 두면 다중 사용자 환경(서버 컴포넌트 SSR)에서 캐시가
        공유되어 보안 사고가 난다.
      </p>

      <h2>Devtools</h2>
      <CodePanel
        language="tsx"
        filename="src/app/providers/tanstack/TanstackDevtoolsProvider.tsx"
        code={`'use client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

export function TanstackDevtoolsProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}`}
      />
      <p className="muted">
        Devtools 는 <code>devDependencies</code>에 있고 프로덕션 빌드에서
        자동으로 제거된다. 별도 환경 분기 불필요.
      </p>

      <h2>queryOptions 패턴</h2>
      <p>
        조회 함수 단위가 아니라 <strong>queryOptions 단위</strong>로 export 한다.
        같은 데이터를 여러 컴포넌트가 쓸 때 캐시 공유를 위해.
      </p>
      <CodePanel
        language="ts"
        filename="entities/order/model/queryOptions.ts"
        code={`import { getOrdersApi } from '../api/getOrdersApi';

export const ORDERS_QUERY_KEY = () => ['ORDERS'] as const;

export const ordersQueryOptions = () => ({
  queryKey: ORDERS_QUERY_KEY(),
  queryFn: getOrdersApi,
});

// 파라미터가 있는 경우
export const ORDER_BY_ID_QUERY_KEY = (id: number) =>
  ['ORDER_BY_ID', id] as const;

export const orderByIdQueryOptions = (id: number) => ({
  queryKey: ORDER_BY_ID_QUERY_KEY(id),
  queryFn: () => getOrderByIdApi(id),
});`}
      />
      <p>
        <code>queryKey</code>를 별도 함수로 분리하는 이유:{" "}
        <code>invalidateQueries</code>나 <code>removeQueries</code>에서
        독립적으로 쓸 수 있어야 하기 때문.
      </p>

      <h2>Suspense 모드 + AsyncBoundary</h2>
      <p>
        로딩/에러는 수동 분기 대신 <code>useSuspenseQuery</code> +{" "}
        <a href="/recipes/async-boundary">
          <code>AsyncBoundary</code>
        </a>{" "}
        로 처리한다.
      </p>
      <CodePanel
        language="tsx"
        filename="views/orders/OrderList/index.tsx"
        code={`'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { AsyncBoundary } from '@/shared/ui/AsyncBoundary';
import { ordersQueryOptions } from '@/entities/order/model/queryOptions';
import { OrderListSkeleton } from './Skeleton/OrderListSkeleton';
import { OrderListError } from './Error/OrderListError';

function OrderListContent() {
  const { data: orders } = useSuspenseQuery(ordersQueryOptions());
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

      <h2>props 대신 캐시 공유</h2>
      <p>
        부모에서 가져온 데이터를 props 로 자식에게 내려주지 않는다. 자식이
        같은 <code>queryOptions</code>를 호출하면 캐시 히트로 즉시 반환.
      </p>
      <CodePanel
        language="tsx"
        code={`// ❌ props 로 데이터를 내려주는 패턴
function Parent() {
  const { data } = useSuspenseQuery(ordersQueryOptions());
  return <Child orders={data} />;
}

// ✅ 자식이 캐시에서 직접 가져오는 패턴
function Parent() {
  useSuspenseQuery(ordersQueryOptions()); // prefetch 역할
  return <Child />;
}

function Child() {
  const { data } = useSuspenseQuery(ordersQueryOptions()); // 캐시 히트
  return <div>{/* ... */}</div>;
}`}
      />

      <h2>서버 prefetch + 클라 hydration</h2>
      <p>
        서버 컴포넌트에서 prefetch 해두면 클라이언트 초기 렌더에서{" "}
        loading state 없이 즉시 데이터가 보인다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/shared/ui/ServerFetchBoundary/index.tsx"
        code={`import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';

type FetchOptions = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
};

export async function ServerFetchBoundary({
  fetchOptions,
  children,
}: {
  fetchOptions: FetchOptions | FetchOptions[];
  children: ReactNode;
}) {
  const queryClient = new QueryClient();
  const options = Array.isArray(fetchOptions) ? fetchOptions : [fetchOptions];

  await Promise.all(
    options.map((opts) => queryClient.prefetchQuery(opts)),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}`}
      />
      <CodePanel
        language="tsx"
        filename="app/[locale]/orders/page.tsx"
        code={`import { ServerFetchBoundary } from '@/shared/ui/ServerFetchBoundary';
import { ordersQueryOptions } from '@/entities/order/model/queryOptions';
import { OrderList } from '@/views/orders/OrderList';

export default function OrdersPage() {
  return (
    <ServerFetchBoundary fetchOptions={ordersQueryOptions()}>
      <OrderList />
    </ServerFetchBoundary>
  );
}`}
      />

      <h2>Mutation</h2>
      <CodePanel
        language="ts"
        filename="features/order/model/useCreateOrder.ts"
        code={`import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postOrderApi } from '@/entities/order/api/postOrderApi';
import { ORDERS_QUERY_KEY } from '@/entities/order/model/queryOptions';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY() });
    },
  });
};`}
      />
      <p>
        검증·변환은 <code>mutationFn</code>에 넣지 말고 순수 함수로 분리한다 —
        훅은 제출만 담당.
      </p>

      <h2>queryOptions 전략 분기</h2>
      <p>
        같은 도메인 데이터를 다른 소스(API · localStorage · 메모리)에서 가져와야
        하는 경우, <code>queryKey</code>는 동일하게 유지하고{" "}
        <code>queryFn</code>만 컨텍스트에 따라 교체한다.
      </p>
      <CodePanel
        language="ts"
        code={`export const CART_QUERY_KEY = () => ['CART'] as const;

const getGuestCart = async (): Promise<Cart> => {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : { items: [] };
};

export const cartQueryOptions = (isAuthenticated: boolean) => ({
  queryKey: CART_QUERY_KEY(),
  queryFn: isAuthenticated ? getCartApi : getGuestCart,
});

// 컨텍스트 전환(로그인/로그아웃)시 캐시 무효화
queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY() });`}
      />
    </main>
  );
}
