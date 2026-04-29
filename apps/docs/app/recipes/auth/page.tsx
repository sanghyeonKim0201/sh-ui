export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function AuthRecipe() {
  return (
    <main className="container">
      <h1>인증 (auth-jwt)</h1>
      <p className="muted">
        쿠키 기반 JWT 인증 — RSC prefetch + hydration 흐름과 호환되도록 설계.
        <code>--plugins auth-jwt</code> 로 추가하면 미들웨어, refresh 자리표시자,
        Server Action 헬퍼가 같이 깔린다.
      </p>

      <h2>설치</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npm create sh-ui my-app -- --platform next --structure standalone --plugins auth-jwt --yes`}
      />
      <p>
        Sentry 와 같이 쓰려면 <code>--plugins sentry,auth-jwt</code>. 두 플러그인은
        독립적으로 동작하며, Sentry 가 같이 켜지면{" "}
        <code>src/shared/api/observability.ts</code> 가 Sentry-aware 버전으로
        덮여 BFF 와 serverFetch 의 5xx 가 자동 보고된다.
      </p>

      <h2>아키텍처 한눈에</h2>
      <CodePanel
        language="text"
        filename="요청 경로"
        code={`browser
  └─ proxy.ts (Next 16 미들웨어) — 토큰 존재 체크 → /sign-in 가드
  └─ RSC
      └─ http()  ── (서버) ──→ serverFetch ──→ 백엔드 직통
                                                 (cookies()로 AT 주입)
  └─ Client
      └─ http()  ── (브라우저) ──→ clientFetch ──→ /api/proxy/[...path]
                                                       │
                                                       ▼
                                                 BFF 라우트 핸들러
                                                   - AT 주입
                                                   - 401 → refreshSession()
                                                       (성공: 새 쿠키 + 재시도)
                                                       (실패: 쿠키 삭제 + 401)
                                                   - 백엔드 직통`}
      />
      <p className="muted">
        refresh 책임자는 <strong>BFF 한 곳</strong>. 미들웨어는 fetch 안 함,
        RSC 도 refresh 안 함 (RSC 는 cookies().set() 금지). RSC 의 401 은
        prefetchQuery 가 swallow 하고 클라이언트 refetch 가 BFF 경유로
        자연 복구된다.
      </p>

      <h2>1. API 함수는 한 벌만 작성</h2>
      <p>
        <code>http()</code> 가 환경을 보고 자동 분기하므로 RSC와 클라이언트가
        같은 함수를 공유한다.
      </p>
      <CodePanel
        language="ts"
        filename="src/entities/order/api/orderQueries.ts"
        code={`import { queryOptions } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';

type Order = { id: number; title: string };

export const orderQueries = {
  detail: (id: number) =>
    queryOptions({
      queryKey: ['order', id],
      queryFn: () => http<Order>(\`/v1/orders/\${id}\`),
    }),
};`}
      />

      <h2>2. RSC Prefetch + Hydration</h2>
      <p>
        서버에서 미리 데이터를 채우고, 클라이언트는 즉시 hydrate 된 캐시를
        사용한다. <code>queryClient.ts</code> 의{" "}
        <code>getServerQueryClient()</code> 는 React <code>cache()</code> 로
        요청 스코프가 보장된다 — 요청 간 캐시가 새는 일은 없다.
      </p>
      <CodePanel
        language="tsx"
        filename="src/app/orders/[id]/page.tsx (RSC)"
        code={`import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getServerQueryClient } from '@/src/shared/api/queryClient';
import { orderQueries } from '@/src/entities/order/api/orderQueries';
import { OrderDetail } from '@/src/widgets/order/OrderDetail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qc = getServerQueryClient();

  await qc.prefetchQuery(orderQueries.detail(Number(id)));

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <OrderDetail id={Number(id)} />
    </HydrationBoundary>
  );
}`}
      />
      <CodePanel
        language="tsx"
        filename="src/widgets/order/OrderDetail.tsx (Client)"
        code={`'use client';

import { useQuery } from '@tanstack/react-query';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

export function OrderDetail({ id }: { id: number }) {
  const { data, isPending } = useQuery(orderQueries.detail(id));
  if (isPending) return <Skeleton />;
  return <div>{data?.title}</div>;
}`}
      />

      <h2>3. 로그인 / 로그아웃 — Server Action</h2>
      <p>
        쿠키 set/clear 는 Route Handler 또는 Server Action 에서만 가능하므로
        Server Action 으로 작성한다. 클라이언트에서는 <code>useMutation</code>{" "}
        으로 호출하면 된다.
      </p>
      <CodePanel
        language="ts"
        filename="src/features/auth/signIn/api/signInAction.ts"
        code={`'use server';

import { cookies } from 'next/headers';
import { serverFetch } from '@/src/shared/api/serverFetch';

const COOKIE = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
};

type SignInInput = { email: string; password: string };
type SignInResult = { accessToken: string; refreshToken: string };

export async function signInAction(input: SignInInput): Promise<void> {
  const data = await serverFetch<SignInResult>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  const jar = await cookies();
  jar.set('accessToken', data.accessToken, COOKIE);
  jar.set('refreshToken', data.refreshToken, COOKIE);
}`}
      />
      <CodePanel
        language="tsx"
        filename="src/features/auth/signIn/ui/SignInForm.tsx"
        code={`'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signInAction } from '../api/signInAction';

export function SignInForm() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: signInAction,
    onSuccess: () => router.replace('/'),
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      mutate({
        email: fd.get('email') as string,
        password: fd.get('password') as string,
      });
    }}>
      {/* input 들 ... */}
    </form>
  );
}`}
      />
      <CodePanel
        language="ts"
        filename="src/features/auth/signOut/api/signOutAction.ts"
        code={`'use server';

import { cookies } from 'next/headers';
import { serverFetch } from '@/src/shared/api/serverFetch';

const CLEAR = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 0,
};

export async function signOutAction(): Promise<void> {
  // best-effort — 백엔드 호출 실패해도 쿠키는 삭제
  try {
    await serverFetch('/v1/auth/logout', { method: 'POST' });
  } catch {
    // noop
  }

  const jar = await cookies();
  jar.set('accessToken', '', CLEAR);
  jar.set('refreshToken', '', CLEAR);
}`}
      />

      <h2>4. 인증된 Mutation — withAuthRetry</h2>
      <p>
        Server Action 안에서 보호된 백엔드를 호출할 때 사용한다. 401 을 만나면{" "}
        <code>refreshSession()</code> 으로 갱신 후 한 번 재시도한다 (RSC 에서는
        쓰지 말 것 — RSC 는 쿠키 set 이 막혀 있음).
      </p>
      <CodePanel
        language="ts"
        filename="src/features/toggleFavorite/api/toggleFavoriteAction.ts"
        code={`'use server';

import { revalidateTag } from 'next/cache';
import { serverFetch } from '@/src/shared/api/serverFetch';
import { withAuthRetry } from '@/src/shared/api/withAuthRetry';

export async function toggleFavoriteAction(productId: number): Promise<void> {
  await withAuthRetry(() =>
    serverFetch(\`/v1/products/\${productId}/favorite\`, { method: 'POST' }),
  );
  revalidateTag('favorites');
}`}
      />

      <h2>5. queryFn 에 무엇을 넣어야 하나</h2>
      <CodePanel
        language="text"
        filename="결정 트리"
        code={`TQ queryFn 에 무엇을 넣을까?

├─ http() 호출            → ✅ 기본. RSC/Client 자동 분기
├─ Server Action 호출
│   ├─ revalidateTag 등 필요 → OK. 단 Action 안에서
│   │                          serverFetch + withAuthRetry 사용
│   └─ 그냥 멋있어 보여서 → ❌ 직렬화·POST 비용·refresh 분산
└─ 일반 서버 전용 함수    → ❌ 클라 refetch 시 폭발`}
      />

      <h2>6. Refresh 활성화 가이드</h2>
      <p>
        v1 의 <code>refreshSession.ts</code> 는 placeholder 라{" "}
        <code>{`{ ok: false }`}</code> 만 반환한다. 백엔드 refresh API 명세가
        확정되면 본문만 채우면 BFF 와 withAuthRetry 가 자동 활성화된다.
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/api/refreshSession.ts (본문 채운 예)"
        code={`export async function refreshSession(
  refreshToken: string,
): Promise<RefreshResult> {
  if (inflight) return inflight;

  inflight = (async (): Promise<RefreshResult> => {
    try {
      const res = await fetch(\`\${process.env.API_URL}/v1/auth/token/refresh\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const body = await res.json();
      if (body.result === 'SUCCESS') {
        return {
          ok: true,
          accessToken: body.data.accessToken,
          refreshToken: body.data.refreshToken,
        };
      }
      return { ok: false };
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}`}
      />
      <p className="muted">
        모듈 레벨 <code>inflight</code> 변수가 코얼레싱 — 동시에 여러 요청이
        401 을 만나도 refresh 는 한 번만 발사된다.
      </p>

      <h3>(선택) 사전 갱신으로 RSC 깜빡임까지 제거</h3>
      <p>
        prefetch 에 의존도가 높다면, 미들웨어에서 JWT 만료 임박을 로컬로
        디코드해 미리 갱신 라우트로 우회시킬 수 있다. fetch 는 안 한다.
      </p>
      <CodePanel
        language="ts"
        filename="src/proxy.ts (만료 임박 분기 추가)"
        code={`import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];
const REFRESH_BUFFER_SEC = 60;

function isExpiringSoon(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp - Math.floor(Date.now() / 1000) < REFRESH_BUFFER_SEC;
  } catch {
    return true;
  }
}

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const at = req.cookies.get('accessToken')?.value;
  const rt = req.cookies.get('refreshToken')?.value;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthRoute) return NextResponse.next();

  if (!at) {
    if (rt) return goRefresh(req, pathname + search);
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isExpiringSoon(at)) {
    if (rt) return goRefresh(req, pathname + search);
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}

function goRefresh(req: NextRequest, next: string) {
  const url = new URL('/api/auth/refresh', req.url);
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/((?!api|_next|.*\\\\..*).*)',
};`}
      />
      <CodePanel
        language="ts"
        filename="src/app/api/auth/refresh/route.ts (신규)"
        code={`import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshSession } from '@/src/shared/api/refreshSession';

const COOKIE = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
};

export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get('next') || '/';
  const refreshToken = (await cookies()).get('refreshToken')?.value;

  if (!refreshToken) return goSignIn(req);

  const r = await refreshSession(refreshToken);
  if (!r.ok) return goSignIn(req);

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set('accessToken', r.accessToken, COOKIE);
  res.cookies.set('refreshToken', r.refreshToken, COOKIE);
  return res;
}

function goSignIn(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/sign-in', req.url));
  res.cookies.set('accessToken', '', { ...COOKIE, maxAge: 0 });
  res.cookies.set('refreshToken', '', { ...COOKIE, maxAge: 0 });
  return res;
}`}
      />

      <h2>7. 백엔드 응답 envelope 가정</h2>
      <p>
        템플릿은 <code>{`{ result: 'SUCCESS' | 'ERROR', data, error }`}</code>{" "}
        envelope 을 가정한다 (<code>src/shared/api/apiTypes.ts</code>). 백엔드
        포맷이 다르면 <code>serverFetch.ts</code> / <code>clientFetch.ts</code>{" "}
        의 응답 처리 부분만 갈아끼우면 된다.
      </p>

      <h2>환경 변수</h2>
      <CodePanel
        language="bash"
        filename=".env"
        code={`API_URL=http://localhost:8080/api
COOKIE_SECURE=false   # HTTPS 환경에서는 true`}
      />
    </main>
  );
}
