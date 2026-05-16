export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function TanstackQueryRecipe() {
  return (
    <main className="container">
      <h1>TanStack Query 셋업</h1>
      <p className="muted">
        Provider 위치, Devtools, queryOptions 컨벤션, mutation 패턴.
        prefetch + hydration 풀 패턴은{" "}
        <a href="/recipes/data-fetching">데이터 페칭 레시피</a> 참고.
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

      <h2>QueryClient — cache() 패턴</h2>
      <p>
        베이스의 <code>queryClient.ts</code> 가 RSC 와 클라이언트의 QueryClient
        생성을 책임진다. 서버는 React <code>cache()</code> 로 요청 스코프, 클라는
        싱글톤.
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/api/queryClient.ts"
        code={`import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      dehydrate: {
        // pending 상태도 dehydrate — RSC prefetch 가 끝나지 않았어도
        // 클라이언트가 이어 받을 수 있다
        shouldDehydrateQuery: (q) =>
          defaultShouldDehydrateQuery(q) || q.state.status === 'pending',
      },
    },
  });
}

// RSC: 같은 요청 안에서 같은 QC, 요청 종료 시 폐기 — 요청 간 누수 방지
export const getServerQueryClient = cache(makeQueryClient);

// Client: 한 브라우저 세션에 한 QC (싱글톤)
let browserQueryClient: QueryClient | undefined;

export function getBrowserQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}`}
      />
      <CodePanel
        language="tsx"
        filename="src/app/providers/tanstack/QueryClientProvider.tsx"
        code={`'use client';

import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getBrowserQueryClient } from '@/src/shared/api/queryClient';

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanstackQueryClientProvider client={getBrowserQueryClient()}>
      {children}
    </TanstackQueryClientProvider>
  );
}`}
      />
      <p className="muted">
        모듈 스코프의 싱글톤 변수는 SSR 에서 위험하지만,{" "}
        <code>isServer</code> 가드가 있어 서버에서는 매번 새 인스턴스를 만든다 —
        다중 사용자 캐시 공유 문제 없음.
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
        조회 함수 단위가 아니라 <strong><code>queryOptions</code> 단위</strong>{" "}
        로 export 한다. 키와 fn 이 한 객체에 묶이므로 키 어긋남 사고가 봉쇄되고,
        RSC prefetch 와 클라이언트 useQuery 가 같은 객체를 공유한다.
      </p>
      <CodePanel
        language="ts"
        filename="src/entities/order/api/orderQueries.ts"
        code={`import { queryOptions } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';
import type { Order } from '../model/types';

export const orderQueries = {
  list: () =>
    queryOptions({
      queryKey: ['orders'],
      queryFn: () => http<Order[]>('/v1/orders'),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ['order', id],
      queryFn: () => http<Order>(\`/v1/orders/\${id}\`),
    }),
};`}
      />
      <p>
        <code>queryKey</code>를 별도로 분리해 export 할 필요 없음 —{" "}
        <code>orderQueries.list().queryKey</code> 로 접근 가능. invalidate /
        remove 시에도 같은 객체 사용.
      </p>

      <h2>Suspense 모드</h2>
      <p>
        로딩/에러는 수동 분기 대신 <code>useSuspenseQuery</code> + 부모의{" "}
        <a href="/recipes/async-boundary">AsyncBoundary</a> (Suspense +
        ErrorBoundary 묶음) 으로 처리한다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderList.tsx"
        code={`'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

export function OrderList() {
  const { data: orders } = useSuspenseQuery(orderQueries.list());
  return <OrderListView orders={orders} />;
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
  const { data } = useSuspenseQuery(orderQueries.list());
  return <Child orders={data} />;
}

// ✅ 자식이 캐시에서 직접 가져오는 패턴
function Parent() {
  useSuspenseQuery(orderQueries.list()); // prefetch 역할
  return <Child />;
}

function Child() {
  const { data } = useSuspenseQuery(orderQueries.list()); // 캐시 히트
  return <div>{/* ... */}</div>;
}`}
      />

      <h2>RSC Prefetch + Hydration</h2>
      <p>
        풀 패턴은 <a href="/recipes/data-fetching">데이터 페칭 레시피</a> 참고.
        한 줄 요약:
      </p>
      <CodePanel
        language="tsx"
        filename="app/orders/page.tsx (RSC)"
        code={`import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getServerQueryClient } from '@/src/shared/api/queryClient';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

export default async function Page() {
  const qc = getServerQueryClient();
  await qc.prefetchQuery(orderQueries.list());

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <OrderList />
    </HydrationBoundary>
  );
}`}
      />
      <p className="muted">
        <code>getServerQueryClient()</code> 는 <code>cache()</code> 로 감싸져
        있어 같은 요청 안에서 같은 QC, 요청 종료 시 폐기. 요청 간 누수 없음.
      </p>

      <h2>Mutation</h2>
      <CodePanel
        language="ts"
        filename="src/features/order/model/useCreateOrder.ts"
        code={`import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';

type NewOrder = { /* ... */ };
type Order = { /* ... */ };

export const useCreateOrder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: NewOrder) =>
      http<Order>('/v1/orders', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};`}
      />
      <p>
        검증·변환은 <code>mutationFn</code>에 넣지 말고 순수 함수로 분리한다 —
        훅은 제출만 담당.
      </p>
      <p className="muted">
        쿠키 set · <code>revalidateTag</code> 등이 필요한 케이스는{" "}
        <code>mutationFn</code> 대신 Server Action 으로 처리한다.
      </p>

      <h2>queryOptions 전략 분기</h2>
      <p>
        같은 도메인 데이터를 다른 소스(API · localStorage · 메모리)에서 가져와야
        하는 경우, <code>queryKey</code>는 동일하게 유지하고{" "}
        <code>queryFn</code>만 컨텍스트에 따라 교체한다.
      </p>
      <CodePanel
        language="ts"
        code={`import { queryOptions } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';

const getGuestCart = async (): Promise<Cart> => {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : { items: [] };
};

export const cartQueries = {
  current: (isAuthenticated: boolean) =>
    queryOptions({
      queryKey: ['cart'],
      queryFn: isAuthenticated ? () => http<Cart>('/v1/cart') : getGuestCart,
    }),
};

// 컨텍스트 전환(로그인/로그아웃)시 캐시 무효화
queryClient.invalidateQueries({ queryKey: ['cart'] });`}
      />
    </main>
  );
}
