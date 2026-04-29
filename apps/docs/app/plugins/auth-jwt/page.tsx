export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function AuthJwtPlugin() {
  return (
    <main className="container">
      <h1>auth-jwt</h1>
      <p className="muted">
        쿠키 기반 JWT 인증 플러그인 — Next 16 <code>proxy.ts</code> 미들웨어,
        refresh-aware BFF, Server Action 헬퍼를 한 번에 추가한다. 백엔드 refresh
        명세 확정 후 한 파일만 채우면 자동 활성화.
      </p>

      <h2>1. 개요</h2>
      <ul>
        <li>
          <strong>토큰 보관:</strong> <code>accessToken</code> /{" "}
          <code>refreshToken</code> 둘 다 httpOnly 쿠키. JS 가 못 읽음 → XSS
          방어.
        </li>
        <li>
          <strong>refresh 책임자 한 곳:</strong> <code>/api/proxy</code> 가 401
          을 만나면 <code>refreshSession()</code> 호출 → 새 AT 로 재시도. 미들웨어와 RSC 는 refresh 안 함.
        </li>
        <li>
          <strong>프로젝트별 다양성 흡수:</strong> v1 의{" "}
          <code>refreshSession.ts</code> 는 placeholder — 백엔드 명세가
          확정되면 본문만 채우면 BFF 가 자동 활용. 템플릿이 백엔드 API 를
          가정하지 않는다.
        </li>
        <li>
          <strong>RSC prefetch 와 호환:</strong> RSC 는 <code>serverFetch</code>{" "}
          로 백엔드 직통, 클라이언트는 <code>/api/proxy</code> 경유 — API 함수는
          한 번만 작성한다.
        </li>
      </ul>

      <h2>2. 설치</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npm create sh-ui my-app -- --platform next --structure standalone --plugins auth-jwt --yes`}
      />
      <p>
        Sentry / next-intl 와 함께:{" "}
        <code>--plugins sentry,auth-jwt,next-intl</code>. 조합은{" "}
        <a href="#combinations">8. 다른 플러그인과 조합</a> 참고.
      </p>

      <h2>3. 폴더 구조</h2>
      <p>이 플러그인이 생성/덮어쓰는 파일.</p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`my-app/
├── src/
│   ├── proxy.ts                            ← NEW   Next 16 미들웨어 (토큰 존재 체크)
│   └── shared/
│       └── api/
│           ├── refreshSession.ts           ← NEW   ★ placeholder — 본문만 채우면 활성화
│           ├── withAuthRetry.ts            ← NEW   Server Action 용 401 자동 갱신
│           ├── http.ts                     (베이스) isomorphic 진입점
│           ├── serverFetch.ts              (베이스) RSC transport
│           ├── clientFetch.ts              (베이스) 브라우저 transport
│           ├── queryClient.ts              (베이스) cache() 패턴
│           ├── observability.ts            (베이스) 캡처/로그 훅
│           ├── apiTypes.ts                 (베이스) ApiResponse 등
│           └── error.ts                    (베이스) ApiError
└── app/
    └── api/
        └── proxy/[...path]/
            └── route.ts                    ← OVERWRITE   refresh-aware BFF`}
      />
      <p className="muted">
        <strong>(베이스)</strong> 는 모든 sh-ui Next 템플릿이 기본으로 갖는 파일.
        auth-jwt 는 그 위에 인증 인프라만 얹는다.
      </p>
      <h3>각 신규 파일이 하는 일</h3>
      <ul>
        <li>
          <code>src/proxy.ts</code> — 페이지 네비게이션 시 AT 쿠키 존재만
          확인하고 없으면 <code>/sign-in</code> 으로 리다이렉트. fetch /
          만료검사 / refresh 안 함.
        </li>
        <li>
          <code>src/shared/api/refreshSession.ts</code> — 모듈 변수 코얼레싱이
          포함된 refresh 함수.{" "}
          <strong>v1 본문은 placeholder (항상 ok:false)</strong> — 백엔드 명세가
          확정되면 채운다.
        </li>
        <li>
          <code>src/shared/api/withAuthRetry.ts</code> — Route Handler / Server
          Action 안에서 401 만나면 자동으로 refresh + 재시도.
        </li>
        <li>
          <code>app/api/proxy/[...path]/route.ts</code> — 베이스 BFF 를 덮어쓴
          버전. 백엔드 401 → <code>refreshSession()</code> 호출 → 성공이면 새
          쿠키 set + 재시도, 실패면 쿠키 삭제 + 401 그대로.
        </li>
      </ul>

      <h2>4. 아키텍처</h2>
      <CodePanel
        language="text"
        filename="요청 흐름"
        showLineNumbers={false}
        code={`browser → 페이지 진입
  proxy.ts: AT 쿠키 없음 → /sign-in
            AT 쿠키 있음 → 통과

[RSC]
  http() → serverFetch → API_URL 직통 (cookies()로 AT 주입)
  401 → ApiError throw → prefetchQuery 가 swallow → 클라가 refetch

[Client]
  http() → clientFetch → /api/proxy/[...path]
                          ↓
                        BFF: AT 주입 → 백엔드 → 401?
                          ↓ yes
                        refreshSession() 호출
                          ↓ 성공
                        새 AT/RT 쿠키 + 원 요청 재시도
                          ↓ 실패
                        쿠키 삭제 + 401 → clientFetch 가 /sign-in 이동`}
      />
      <p className="muted">
        RSC 가 401 만나도 prefetchQuery 가 error 를 swallow 하고 클라이언트
        refetch 가 BFF 경유로 자연 복구한다 — RSC 가 직접 refresh 못 하는 제약
        (cookies().set() 금지) 을 우회하는 핵심 메커니즘.
      </p>

      <h2>5. 사용 패턴</h2>

      <h3>API 함수는 한 벌만</h3>
      <CodePanel
        language="ts"
        filename="src/entities/order/api/orderQueries.ts"
        code={`import { queryOptions } from '@tanstack/react-query';
import { http } from '@/src/shared/api/http';
import type { Order } from '../model/types';

export const orderQueries = {
  detail: (id: number) =>
    queryOptions({
      queryKey: ['order', id],
      queryFn: () => http<Order>(\`/v1/orders/\${id}\`),
    }),
};`}
      />

      <h3>RSC Prefetch + Hydration</h3>
      <p>
        자세한 패턴은 <a href="/recipes/data-fetching">데이터 페칭 레시피</a>{" "}
        참고. 핵심 코드만:
      </p>
      <CodePanel
        language="tsx"
        filename="app/orders/[id]/page.tsx (RSC)"
        code={`import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getServerQueryClient } from '@/src/shared/api/queryClient';
import { orderQueries } from '@/src/entities/order/api/orderQueries';

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

      <h3>로그인 — Server Action</h3>
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
      <p className="muted">
        Action 이 토큰을 받아 직접 쿠키에 박는다 — 클라이언트는 토큰을 눈으로
        보지 못함.
      </p>

      <h3>로그아웃 — Server Action (best-effort)</h3>
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
  try {
    await serverFetch('/v1/auth/logout', { method: 'POST' });
  } catch {
    // 백엔드 호출 실패해도 쿠키는 삭제
  }

  const jar = await cookies();
  jar.set('accessToken', '', CLEAR);
  jar.set('refreshToken', '', CLEAR);
}`}
      />

      <h3>인증된 Mutation — withAuthRetry</h3>
      <p>
        Server Action 안에서 보호된 백엔드를 호출할 때 사용. 401 시{" "}
        <code>refreshSession()</code> 호출 → 한 번 재시도. RSC 에서는 사용 금지
        (cookies().set() 막힘).
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

      <h3>queryFn 결정 트리</h3>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`TQ queryFn 에 무엇을 넣을까?

├─ http() 호출            → ✅ 기본. RSC/Client 자동 분기
├─ Server Action 호출
│   ├─ revalidateTag 등 필요 → OK. 단 Action 안에서
│   │                          serverFetch + withAuthRetry 사용
│   └─ 그냥 멋있어 보여서 → ❌ 직렬화·POST 비용·refresh 분산
└─ 일반 서버 전용 함수    → ❌ 클라 refetch 시 폭발`}
      />

      <h2>6. 환경 변수</h2>
      <CodePanel
        language="bash"
        filename=".env"
        code={`# 베이스가 사용
API_URL=http://localhost:8080/api

# auth-jwt 가 추가
COOKIE_SECURE=false   # HTTPS 환경에서는 true`}
      />

      <h2>7. 커스터마이징</h2>

      <h3>Refresh 활성화 (★ 가장 중요)</h3>
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
        모듈 변수 <code>inflight</code> 가 코얼레싱 — 동시에 여러 요청이 401 을
        만나도 refresh 는 한 번만.
      </p>

      <h3>(고급) RSC 깜빡임까지 제거 — 사전 갱신</h3>
      <p>
        prefetch 의존도가 매우 높다면, 미들웨어에서 JWT 만료시각을 로컬로
        디코드해 미리 갱신 라우트로 우회시킬 수 있다. fetch 안 함.
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

  if (!at || isExpiringSoon(at)) {
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
        filename="app/api/auth/refresh/route.ts (신규)"
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

      <h3>응답 envelope 가 다를 때</h3>
      <p>
        템플릿은 <code>{`{ result, data, error }`}</code> envelope 을 가정한다.
        백엔드가 다르면 <code>serverFetch.ts</code> /{" "}
        <code>clientFetch.ts</code> 의 응답 처리 부분만 갈아끼우면 된다 (envelope
        를 벗기는 로직 4-5줄).
      </p>

      <h2 id="combinations">8. 다른 플러그인과 조합</h2>
      <ul>
        <li>
          <strong>+ sentry</strong> — Sentry 가{" "}
          <code>observability.ts</code> 를 덮어써 BFF 의 5xx + refresh 실패 경로가
          자동 캡처. 401 (인증 만료) 은 비즈니스 에러로 분류돼 Sentry 에 안 감.
        </li>
        <li>
          <strong>+ next-intl</strong> — proxy.ts 와 next-intl 미들웨어가 합성됨.
          AUTH_ROUTES 가 locale prefix (<code>/ko/sign-in</code>) 도 매칭하도록{" "}
          <code>stripLocalePrefix</code> 헬퍼를 proxy.ts 에 추가해야 함. 자세한 건{" "}
          <a href="/plugins/next-intl">next-intl 페이지</a>.
        </li>
      </ul>
    </main>
  );
}
