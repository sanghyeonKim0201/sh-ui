export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function TestingRecipe() {
  return (
    <main className="container">
      <h1>테스트 셋업</h1>
      <p className="muted">
        Vitest + Testing Library + MSW 로 API 호출 인터셉트와 컴포넌트 테스트를
        구성한다.
      </p>

      <h2>설치</h2>
      <p>
        Vitest · jsdom · @testing-library/jest-dom 은 템플릿에 이미 포함.
        나머지를 추가:
      </p>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add -D @testing-library/react @testing-library/user-event msw`}
      />

      <h2>Vitest 설정</h2>
      <CodePanel
        language="ts"
        filename="vitest.config.ts"
        code={`import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});`}
      />
      <CodePanel
        language="ts"
        filename="src/shared/test/setup.ts"
        code={`import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());`}
      />

      <h2>MSW — http 인터셉트</h2>
      <p>
        템플릿의 axios 는 클라이언트에서 <code>/api/proxy</code>로 호출하므로,
        MSW 핸들러도 그 경로를 가로챈다. 서버 컨텍스트 테스트는 절대 URL 로
        가는데, MSW 가 양쪽 다 처리.
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/test/msw/handlers.ts"
        code={`import { http, HttpResponse } from 'msw';

const apiResponse = <T>(data: T) => ({
  result: 'SUCCESS' as const,
  data,
  error: null,
});

export const handlers = [
  http.get('*/api/proxy/v1/orders', () => {
    return HttpResponse.json(
      apiResponse([
        { id: 1, name: 'Order 1' },
        { id: 2, name: 'Order 2' },
      ]),
    );
  }),

  http.post('*/api/proxy/v1/orders', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      apiResponse({ id: 99, name: body.name }),
      { status: 201 },
    );
  }),
];`}
      />
      <CodePanel
        language="ts"
        filename="src/shared/test/msw/server.ts"
        code={`import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);`}
      />

      <h2>Provider 래퍼</h2>
      <p>
        TanStack Query 와 next-intl 을 쓰는 컴포넌트는 테스트할 때도 같은
        provider 가 필요하다. 헬퍼로 묶어둔다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/shared/test/renderWithProviders.tsx"
        code={`import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import koMessages from '@/shared/config/i18n/messages/ko.json';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

function Providers({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <NextIntlClientProvider locale="ko" messages={koMessages}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: Providers, ...options });`}
      />
      <p className="muted">
        테스트 전용 <code>QueryClient</code>는 <code>retry: false</code>로
        둔다 — 실패 시 즉시 에러를 보여 테스트가 빠르게 실패하게.
      </p>

      <h2>API 함수 테스트</h2>
      <CodePanel
        language="ts"
        filename="entities/order/api/getOrdersApi.test.ts"
        code={`import { describe, expect, it } from 'vitest';
import { getOrdersApi } from './getOrdersApi';

describe('getOrdersApi', () => {
  it('returns orders array', async () => {
    const orders = await getOrdersApi();
    expect(orders).toHaveLength(2);
    expect(orders[0]).toMatchObject({ id: 1, name: 'Order 1' });
  });
});`}
      />
      <p>
        MSW 가 axios 호출을 가로채 핸들러의 mock 응답을 반환한다 — 백엔드 없이도
        실제 호출 흐름을 그대로 테스트.
      </p>

      <h2>에러 케이스 — 핸들러 오버라이드</h2>
      <CodePanel
        language="ts"
        filename="error case 테스트"
        code={`import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/shared/test/msw/server';
import { ApiError } from '@/shared/api/error';
import { getOrdersApi } from './getOrdersApi';

describe('getOrdersApi error', () => {
  it('throws ApiError on 5xx', async () => {
    server.use(
      http.get('*/api/proxy/v1/orders', () =>
        HttpResponse.json(
          {
            result: 'ERROR',
            data: null,
            error: { code: 'INTERNAL_ERROR', message: '서버 오류' },
          },
          { status: 500 },
        ),
      ),
    );

    await expect(getOrdersApi()).rejects.toBeInstanceOf(ApiError);
  });
});`}
      />
      <p>
        <code>server.use</code>는 그 테스트 범위에서만 핸들러를 추가/덮어쓴다.{" "}
        <code>afterEach</code>의 <code>resetHandlers</code>가 다시 기본 핸들러로
        복원.
      </p>

      <h2>컴포넌트 테스트 — useSuspenseQuery 포함</h2>
      <CodePanel
        language="tsx"
        filename="views/orders/OrderList/index.test.tsx"
        code={`import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { OrderList } from './index';

describe('OrderList', () => {
  it('renders skeleton, then orders from API', async () => {
    renderWithProviders(<OrderList />);

    expect(screen.getByTestId('order-list-skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
      expect(screen.getByText('Order 2')).toBeInTheDocument();
    });
  });
});`}
      />

      <h2>사용자 인터랙션 — userEvent</h2>
      <CodePanel
        language="tsx"
        filename="features/order/ui/CreateOrderForm.test.tsx"
        code={`import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/test/renderWithProviders';
import { CreateOrderForm } from './CreateOrderForm';

describe('CreateOrderForm', () => {
  it('submits and shows success', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateOrderForm />);

    await user.type(screen.getByLabelText('주문명'), 'New Order');
    await user.click(screen.getByRole('button', { name: '제출' }));

    expect(await screen.findByText(/등록되었습니다/)).toBeInTheDocument();
  });
});`}
      />

      <h2>모킹 전략 — MSW vs vi.mock</h2>
      <ul>
        <li>
          <strong>MSW 우선</strong> — http 호출 (queryFn · mutationFn 안에서
          axios 부르는 모든 것). 실제 axios + interceptor + ApiError 흐름을 그대로
          테스트.
        </li>
        <li>
          <strong><code>vi.mock</code> 보조</strong> —{" "}
          <code>next/navigation</code>, <code>next/headers</code>, 시간 의존성
          (<code>Date.now</code>) 등 http 가 아닌 외부 의존성. 컴포넌트가{" "}
          <code>useRouter</code>를 쓰면 mock 필요.
        </li>
      </ul>
      <CodePanel
        language="ts"
        filename="next/navigation 모킹 예시"
        code={`import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));`}
      />

      <h2>실행</h2>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm test          # 한 번 실행
pnpm test:watch    # 변경 감지
pnpm test --coverage  # 커버리지`}
      />
    </main>
  );
}
