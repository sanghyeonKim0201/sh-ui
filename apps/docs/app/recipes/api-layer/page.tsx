export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function ApiLayerRecipe() {
  return (
    <main className="container">
      <h1>API 레이어</h1>
      <p className="muted">
        템플릿이 제공하는 <code>http.ts</code> + <code>/api/proxy</code> 구조와
        TanStack Query 연동.
      </p>

      <h2>구조</h2>
      <p>
        클라이언트와 서버 컴포넌트 모두{" "}
        <strong>같은 axios 인스턴스</strong>를 사용한다. 양쪽 모두{" "}
        <code>/api/proxy/[path]</code>를 거치고, 인증과 쿠키 주입은 라우트
        핸들러에서 단일하게 처리한다.
      </p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`[클라 컴포넌트] ──┐
                       │
                       ├──► /api/proxy/[...path]  ──► 백엔드
                       │     · 쿠키 → Authorization 주입
[서버 컴포넌트] ───┘     · 쿼리/바디/multipart 포워딩
                          · 응답 그대로 반환`}
      />
      <p>
        기존 "서버는 백엔드 직통, 클라는 프록시 경유"의 이중 분기를 제거한다.
        서버 컨텍스트에서는 axios 가 절대 URL 을 요구하므로 호스트만
        프리픽스하는 작은 인터셉터가 들어가지만, baseURL 자체는 항상{" "}
        <code>/api/proxy</code>로 동일하다.
      </p>

      <h2>파일</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`src/shared/api/
├── http.ts        # axios 인스턴스 + 인터셉터 (response 언래핑, ApiError throw)
├── error.ts       # ApiError 클래스
└── apiTypes.ts    # ApiResponse, PaginatedData 등 응답 래퍼 타입

app/api/proxy/[...path]/
└── route.ts       # BFF — 쿠키→Authorization, 메서드/바디/쿼리 포워딩`}
      />

      <h2>queryFn 에서 사용</h2>
      <p>
        TanStack Query 의 <code>queryFn</code> · <code>mutationFn</code>에서
        그대로 호출한다. 클라/서버 어느 컨텍스트인지 신경 쓸 필요 없다.
      </p>
      <CodePanel
        language="ts"
        filename="entities/order/api/getOrdersApi.ts"
        code={`import { http } from '@/shared/api/http';
import type { Order } from '../model/types';

export const getOrdersApi = async () => {
  const { data } = await http.get<Order[]>('/v1/orders');
  return data;
};`}
      />
      <CodePanel
        language="ts"
        filename="entities/order/model/queryOptions.ts"
        code={`import { getOrdersApi } from '../api/getOrdersApi';

export const ORDERS_QUERY_KEY = () => ['ORDERS'] as const;

export const ordersQueryOptions = () => ({
  queryKey: ORDERS_QUERY_KEY(),
  queryFn: getOrdersApi,
});`}
      />
      <CodePanel
        language="tsx"
        filename="views/orders/OrderListContent.tsx"
        code={`'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ordersQueryOptions } from '@/entities/order/model/queryOptions';

export function OrderListContent() {
  const { data: orders } = useSuspenseQuery(ordersQueryOptions());
  return <OrderListView orders={orders} />;
}`}
      />

      <h2>응답 형식</h2>
      <p>
        백엔드가 다음 래퍼로 응답한다고 가정한다. <code>http.ts</code>의 응답
        인터셉터가 자동으로 벗긴다 — <code>queryFn</code>은{" "}
        <code>data</code>만 받는다.
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
        백엔드 응답 형태가 다르면 <code>http.ts</code>의 응답 인터셉터를
        수정한다. 예를 들어 표준 REST(success → 2xx + 본문, error → 4xx/5xx + 본문)는
        인터셉터에서 <code>response.data</code>를 그대로 반환하고{" "}
        <code>error</code>에서 <code>ApiError</code>를 던지면 된다.
      </p>

      <h2>에러 처리</h2>
      <p>
        모든 에러는 <code>ApiError</code>로 통일된다. <code>queryFn</code>
        밖에서는 <code>ErrorBoundary</code>로 잡고, 내부에서는 다음 형태로
        분기한다.
      </p>
      <CodePanel
        language="ts"
        code={`import { ApiError } from '@/shared/api/error';

try {
  await http.post('/v1/orders', payload);
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
          <strong>토큰 refresh 로직</strong> — 401 시 자동 재발급은{" "}
          <a href="/recipes/auth">인증 레시피</a>에서 추가한다.
        </li>
        <li>
          <strong>로그인/로그아웃 쿠키 특례 처리</strong> — 동일.
        </li>
        <li>
          <strong>Sentry 캡처</strong> — 별도 레시피. 응답 인터셉터와 라우트
          핸들러 양쪽에 끼우는 형태.
        </li>
      </ul>

      <h2>트레이드오프 — 한 hop 추가</h2>
      <p>
        서버 컴포넌트 호출이 항상 한 hop 더 거치는 구조다(Next 서버 → 자기
        자신의 <code>/api/proxy</code> → 백엔드). 같은 머신/네트워크면 영향이
        미미하지만, 같은 페이지에서 직렬 fetch 가 많으면 누적될 수 있으므로{" "}
        <code>Promise.all</code>로 병렬화한다.
      </p>
    </main>
  );
}
