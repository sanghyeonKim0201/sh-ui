export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function ApiLayerRecipe() {
  return (
    <main className="container">
      <h1>API 레이어</h1>
      <p className="muted">
        템플릿이 제공하는 isomorphic <code>http()</code> + 환경별 transport
        (<code>serverFetch</code> / <code>clientFetch</code>) 와 TanStack Query
        연동.
      </p>

      <h2>구조</h2>
      <p>
        API 함수는 <strong>한 번만 작성</strong>한다. <code>http()</code> 가
        실행 환경을 보고 transport 를 자동 분기한다 — RSC 는 백엔드로 직통,
        브라우저는 <code>/api/proxy</code> 경유.
      </p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`[RSC]            ──► serverFetch ──► API_URL  (백엔드 직통)
                                            (cookies()로 AT 주입)

[Client 컴포넌트] ──► clientFetch ──► /api/proxy/[...path] ──► API_URL
                                          · 쿠키 → Authorization 주입
                                          · 401 → refreshSession 후 재시도
                                          · 응답 그대로 반환`}
      />
      <p>
        분리된 transport 두 갈래는 <code>http.ts</code> 한 줄짜리 진입점이
        가린다. 사용자 코드는 환경을 모른다.
      </p>

      <h2>파일</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`src/shared/api/
├── http.ts            # isomorphic 진입점 (typeof window 분기)
├── serverFetch.ts     # RSC transport (cookies()로 AT 주입, 백엔드 직통)
├── clientFetch.ts     # 브라우저 transport (/api/proxy 경유, 401 → /sign-in)
├── observability.ts   # 캡처/로그 훅 (Sentry 플러그인이 덮어씀)
├── queryClient.ts     # cache() 기반 RSC 스코프 + 브라우저 싱글톤
├── apiTypes.ts        # ApiResponse, PaginatedData
└── error.ts           # ApiError

app/api/proxy/[...path]/
└── route.ts           # BFF — 베이스는 단순 패스스루.
                         auth-jwt 플러그인이 refresh-aware 버전으로 덮어씀`}
      />

      <h2>API 함수 작성</h2>
      <p>
        <code>http()</code> 호출 한 줄. 응답 envelope (
        <code>{`{ result, data, error }`}</code>) 은 transport 가 자동으로 벗기고{" "}
        <code>data</code> 만 반환한다.
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

      <h2>RSC Prefetch + Hydration</h2>
      <p>
        서버에서 미리 채워두면 클라이언트는 즉시 hydrate. 추가 네트워크 0회.
      </p>
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

      <h2>응답 envelope</h2>
      <p>
        백엔드가 다음 envelope 으로 응답한다고 가정한다. transport 가{" "}
        <code>data</code> 만 반환하고, <code>result === 'ERROR'</code> 면{" "}
        <code>ApiError</code> 를 throw 한다.
      </p>
      <CodePanel
        language="ts"
        code={`type ApiResponse<T> = {
  result: 'SUCCESS' | 'ERROR';
  data: T;
  error: { code: string; message: string } | null;
};`}
      />
      <p>
        envelope 이 다르면 <code>serverFetch.ts</code> /{" "}
        <code>clientFetch.ts</code> 의 응답 처리 부분만 갈아끼우면 된다.
      </p>

      <h2>에러 처리</h2>
      <p>
        모든 에러는 <code>ApiError</code> 로 통일된다.{" "}
        <code>queryFn</code> 밖에서는 ErrorBoundary 로 잡고, 안에서는 다음
        형태로 분기.
      </p>
      <CodePanel
        language="ts"
        code={`import { ApiError } from '@/src/shared/api/error';
import { http } from '@/src/shared/api/http';

try {
  await http('/v1/orders', { method: 'POST', body: JSON.stringify(payload) });
} catch (error) {
  if (error instanceof ApiError && error.code === 'INVALID_PRICE') {
    // 비즈니스 에러별 분기
  }
  throw error;
}`}
      />

      <h2>의도적으로 제외된 것</h2>
      <ul>
        <li>
          <strong>토큰 refresh 로직</strong> — 401 자동 재발급은{" "}
          <a href="/recipes/auth">auth-jwt 플러그인</a> 영역. 베이스 BFF 는
          단순 패스스루다.
        </li>
        <li>
          <strong>로그인/로그아웃 쿠키 특례 처리</strong> — Server Action
          으로 처리한다 (auth-jwt 레시피 참조).
        </li>
        <li>
          <strong>Sentry 캡처</strong> — Sentry 플러그인이{" "}
          <code>observability.ts</code> 를 덮어쓰면 자동 활성화.
        </li>
      </ul>

      <h2>트레이드오프 — 두 transport</h2>
      <p>
        RSC 와 클라이언트가 다른 경로를 타기 때문에 동작 검증을 양쪽 모두에서
        해야 한다. 그 대신 RSC 는 추가 hop 없이 백엔드 직통이라 prefetch 가
        빠르고, 브라우저는 <code>/api/proxy</code> 를 거쳐 httpOnly 쿠키와
        refresh 책임자(BFF)를 한 곳으로 모은다.
      </p>
    </main>
  );
}
