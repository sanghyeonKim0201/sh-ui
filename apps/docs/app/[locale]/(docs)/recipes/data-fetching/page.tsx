export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function DataFetchingRecipe() {
  return (
    <main className="container">
      <h1>데이터 페칭 — RSC Prefetch + Hydration</h1>
      <p className="muted">
        TanStack Query 의 prefetch + hydration 패턴으로 RSC 가 미리 채운
        데이터를 클라이언트가 즉시 받는다. <code>queryOptions</code> 와{" "}
        <code>queryClient</code> (cache 패턴) 로 키/타입/스코프 안전.
      </p>

      <h2>왜 이 패턴인가</h2>
      <ul>
        <li>
          <strong>FCP 빠름</strong> — RSC 가 데이터까지 박은 HTML 을 보내고,
          클라이언트는 마운트 즉시 hydrated 캐시를 사용 → 추가 네트워크 0회
        </li>
        <li>
          <strong>같은 코드 양쪽</strong> — RSC 와 Client 가 같은{" "}
          <code>queryOptions</code> 객체를 쓴다. 키 어긋남 사고 봉쇄
        </li>
        <li>
          <strong>요청 스코프 안전</strong> — 서버 QueryClient 는{" "}
          <code>cache()</code> 로 요청별 격리. 요청 간 캐시가 새는 일 없음
        </li>
        <li>
          <strong>에러 자동 복구</strong> — RSC 가 401 등으로 prefetch 실패해도
          클라 refetch 가 BFF 경유로 자연 복구
        </li>
      </ul>

      <h2>1. queryOptions 정의 — 한 번만 작성</h2>
      <p>
        키와 fn 을 한 객체로 묶는다. RSC 와 Client 가 이 객체를 공유한다.
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
      <p className="muted">
        <code>http()</code> 는 환경을 보고 transport 를 자동 분기한다 — RSC 는
        백엔드 직통, 브라우저는 <code>/api/proxy</code> 경유. 자세한 건{" "}
        <a href="/recipes/api-layer">API 레이어</a>.
      </p>

      <h2>2. RSC — prefetchQuery + dehydrate</h2>
      <CodePanel
        language="tsx"
        filename="app/orders/page.tsx (RSC)"
        code={`import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getServerQueryClient } from '@/src/shared/api/queryClient';
import { orderQueries } from '@/src/entities/order/api/orderQueries';
import { OrderList } from '@/src/widgets/order/OrderList';

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
      <p>
        <code>getServerQueryClient()</code> 는 React <code>cache()</code> 로
        감싸져 있어 같은 요청 안에서 같은 QC, 요청 종료 시 폐기. 요청 간 캐시
        누수 없음.
      </p>

      <h2>3. Client — useQuery / useSuspenseQuery</h2>
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderList.tsx (Client)"
        code={`'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

export function OrderList() {
  const { data: orders } = useSuspenseQuery(orderQueries.list());
  return <OrderListView orders={orders} />;
}`}
      />
      <p className="muted">
        Hydrated 캐시가 즉시 매치되므로 마운트 시 네트워크 호출 0 회.{" "}
        <code>staleTime</code> 지나면 그때만 백그라운드 refetch.
      </p>

      <h2>4. 병렬 prefetch — 여러 쿼리를 한 페이지에서</h2>
      <CodePanel
        language="tsx"
        filename="app/orders/[id]/page.tsx"
        code={`export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qc = getServerQueryClient();

  await Promise.all([
    qc.prefetchQuery(orderQueries.detail(Number(id))),
    qc.prefetchQuery(orderQueries.list()),
    qc.prefetchQuery(userQueries.me()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <OrderDetail id={Number(id)} />
      <RelatedOrders />
      <UserBadge />
    </HydrationBoundary>
  );
}`}
      />

      <h2>5. AsyncBoundary 와 조합</h2>
      <p>
        Suspense + ErrorBoundary 묶음.{" "}
        <a href="/recipes/async-boundary">AsyncBoundary 레시피</a> 참고.
      </p>
      <CodePanel
        language="tsx"
        code={`<FallbackBoundary
  suspenseFallback={<OrderListSkeleton />}
  errorFallback={OrderListError}
>
  <OrderList />
</FallbackBoundary>`}
      />

      <h2>6. Mutation — invalidate 패턴</h2>
      <CodePanel
        language="tsx"
        code={`'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';

export function CreateOrderButton() {
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: NewOrder) =>
      http<Order>('/v1/orders', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // ...
}`}
      />
      <p className="muted">
        쿠키 set · <code>revalidateTag</code> 등이 필요한 로그인/로그아웃류
        변경은 <code>mutationFn</code> 대신 Server Action 으로 처리한다.
      </p>

      <h2>7. queryClient 기본 옵션</h2>
      <CodePanel
        language="ts"
        filename="src/shared/api/queryClient.ts (기본값)"
        code={`function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      dehydrate: {
        // pending 상태도 dehydrate — RSC 가 prefetch 중인 쿼리를
        // 클라가 이어서 처리할 수 있게
        shouldDehydrateQuery: (q) =>
          defaultShouldDehydrateQuery(q) || q.state.status === 'pending',
      },
    },
  });
}`}
      />
      <p>
        프로젝트 요구에 맞게 staleTime / retry / refetchOnWindowFocus 등 조정.
      </p>

      <h2>queryFn 에 무엇을 넣어야 하나</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`├─ http() 호출            → ✅ 기본. RSC/Client 자동 분기
├─ Server Action 호출
│   ├─ revalidateTag 등 필요 → OK. 단 Action 안에서
│   │                          serverFetch (+ withAuthRetry) 사용
│   └─ 그냥 멋있어 보여서 → ❌ 직렬화·POST 비용
└─ 일반 서버 전용 함수    → ❌ 클라 refetch 시 폭발`}
      />
    </main>
  );
}
