/**
 * auth-jwt 플러그인 — Layer 2 부터 arch-aware.
 *
 * fs 경로 / import alias 가 arch.paths.api / arch.aliases.api 에서 파생.
 * FSD 기준 v0.57 까지의 하드코딩과 1:1 일치 (회귀 가드는 smoke).
 */
export const authJwtPlugin = {
  name: 'auth-jwt',
  label: '쿠키 기반 JWT 인증 (refresh 자리표시자 포함)',
  description:
    '쿠키 기반 JWT 인증. Next 16 proxy.ts 미들웨어, refresh-aware BFF, withAuthRetry 헬퍼. refresh 본문은 placeholder — 백엔드 명세 확정 후 한 파일 채우면 자동 활성화.',
  priority: 2,

  // 의존성 추가 없음 — 베이스의 fetch + cookies + react-query 만 사용

  envVars: [
    '# Auth (auth-jwt)',
    'COOKIE_SECURE=false',
  ],

  turboEnvVars: [
    'COOKIE_SECURE',
  ],

  providerImports: [],
  providerWrappers: [],

  // ─── 독립 파일 ───
  //
  // 베이스의 BFF (app/api/proxy/[...path]/route.ts) 를 refresh-aware 버전으로
  // 덮어쓰고, 미들웨어와 인증 헬퍼를 추가한다.
  // refreshSession.ts 는 v1 placeholder — 백엔드 명세 확정 후 본문만 채우면
  // BFF 와 withAuthRetry 가 자동 활용한다.

  files: (arch) => ({
    'proxy.ts': `import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

/**
 * Next 16+ 의 proxy.ts (구 middleware.ts).
 * 토큰 존재 여부만 검사한다 — 만료 검사나 refresh 는 하지 않는다.
 *
 * - AT 쿠키 없음 + 인증 라우트 아님 → /sign-in 으로 리다이렉트
 * - AT 쿠키 있음 또는 인증 라우트 → 통과
 *
 * AT 가 만료된 채 통과한 요청은 BFF (/api/proxy) 가 401 을 받아
 * refreshSession 으로 갱신을 시도한다.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = !!req.cookies.get('accessToken')?.value;
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthRoute) return NextResponse.next();
  if (!hasToken) return NextResponse.redirect(new URL('/sign-in', req.url));

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next|.*\\\\..*).*)',
};
`,

    [`${arch.paths.api}/refreshSession.ts`]: `type RefreshResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false };

let inflight: Promise<RefreshResult> | null = null;

/**
 * refreshToken 으로 새 accessToken / refreshToken 을 발급받는다.
 *
 * v1 placeholder — 백엔드 refresh API 명세가 확정되면 아래 TODO 부분을 채운다.
 * 본문이 채워지면 BFF (/api/proxy) 와 withAuthRetry 가 자동으로 활용한다.
 *
 * 동시에 여러 요청이 401 을 만나도 inflight 모듈 변수로 코얼레싱돼서
 * refresh 는 한 번만 발사된다.
 *
 * 참고 구현 예시:
 *
 *   const res = await fetch(\`\${process.env.API_URL}/v1/auth/token/refresh\`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ refreshToken }),
 *   });
 *   const body = await res.json();
 *   if (body.result === 'SUCCESS') {
 *     return {
 *       ok: true,
 *       accessToken: body.data.accessToken,
 *       refreshToken: body.data.refreshToken,
 *     };
 *   }
 *   return { ok: false };
 */
export async function refreshSession(
  refreshToken: string,
): Promise<RefreshResult> {
  if (inflight) return inflight;

  inflight = (async (): Promise<RefreshResult> => {
    try {
      // TODO: 백엔드 refresh API 명세 확정 후 여기에 fetch 호출을 작성.
      // 지금은 placeholder 라 항상 실패 → BFF 가 쿠키 삭제 + 401 응답.
      void refreshToken;
      return { ok: false };
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
`,

    [`${arch.paths.api}/withAuthRetry.ts`]: `import { cookies } from 'next/headers';

import { ApiError } from './error';
import { refreshSession } from './refreshSession';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

const COOKIE = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Route Handler 또는 Server Action 안에서 인증된 요청을 보낼 때 사용한다.
 * 401 을 만나면 refreshSession 으로 토큰을 갱신하고 fn 을 한 번 더 실행한다.
 *
 * RSC (Server Component) 에서는 cookies().set() 이 막혀 있으므로 여기서 호출하면 안 된다.
 * RSC 는 serverFetch 를 직접 호출하고, 401 은 prefetchQuery 가 swallow 한 뒤
 * 클라이언트 refetch 가 BFF 경유로 자동 복구한다.
 *
 * 사용 예 (Server Action):
 *
 *   'use server';
 *   import { serverFetch } from '${arch.aliases.api}/serverFetch';
 *   import { withAuthRetry } from '${arch.aliases.api}/withAuthRetry';
 *
 *   export async function toggleFavoriteAction(id: number) {
 *     return withAuthRetry(() =>
 *       serverFetch(\`/v1/products/\${id}/favorite\`, { method: 'POST' }),
 *     );
 *   }
 */
export async function withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401) throw e;

    const jar = await cookies();
    const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) throw e;

    const r = await refreshSession(refreshToken);
    if (!r.ok) throw new ApiError(401, 'UNAUTHORIZED', null);

    jar.set(ACCESS_TOKEN_COOKIE, r.accessToken, COOKIE);
    jar.set(REFRESH_TOKEN_COOKIE, r.refreshToken, COOKIE);

    return await fn();
  }
}
`,

    'app/api/proxy/[...path]/route.ts': `import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import {
  captureApiError,
  logApiError,
} from '${arch.aliases.api}/observability';
import { refreshSession } from '${arch.aliases.api}/refreshSession';

const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';
const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const LOCALE_COOKIE = 'NEXT_LOCALE';

const COOKIE = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
};

const clearAuthCookies = (res: NextResponse) => {
  res.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...COOKIE, maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...COOKIE, maxAge: 0 });
  return res;
};

const proxyRequest = async (
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
  method: string,
) => {
  const { path } = await ctx.params;
  const apiPath = path.join('/');
  const url = new URL(\`\${API_URL}/\${apiPath}\`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const locale =
    cookieStore.get(LOCALE_COOKIE)?.value ??
    request.headers.get('Accept-Language') ??
    undefined;

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = \`Bearer \${accessToken}\`;
  if (locale) headers['Accept-Language'] = locale;

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('Content-Type');
    if (contentType?.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), { method, headers, body });
  } catch (error) {
    console.error(\`[PROXY] \${method} \${url.toString()} —\`, error);
    return NextResponse.json(
      {
        result: 'ERROR',
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '서버에 연결할 수 없습니다.',
        },
      },
      { status: 502 },
    );
  }

  let data = await response.json();

  // 401 → refresh 시도 (RT 가 있을 때만)
  if (response.status === 401) {
    if (!refreshToken) {
      return clearAuthCookies(NextResponse.json(data, { status: 401 }));
    }

    const r = await refreshSession(refreshToken);

    // refresh placeholder 가 본문 미구현이면 항상 ok:false
    // → 쿠키 삭제 + 401 그대로 (clientFetch 가 /sign-in 으로 이동)
    if (!r.ok) {
      return clearAuthCookies(NextResponse.json(data, { status: 401 }));
    }

    // 새 AT 로 재시도
    headers.Authorization = \`Bearer \${r.accessToken}\`;
    const retry = await fetch(url.toString(), { method, headers, body });
    data = await retry.json();

    const res = NextResponse.json(data, { status: retry.status });
    res.cookies.set(ACCESS_TOKEN_COOKIE, r.accessToken, COOKIE);
    res.cookies.set(REFRESH_TOKEN_COOKIE, r.refreshToken, COOKIE);

    if (!retry.ok) {
      logApiError('PROXY', {
        url: url.toString(),
        method,
        status: retry.status,
        requestBody: typeof body === 'string' ? body : undefined,
        responseBody: data,
      });

      captureApiError({
        url: url.toString(),
        apiPath,
        method,
        status: retry.status,
        responseBody: data,
      });
    }

    return res;
  }

  if (!response.ok) {
    logApiError('PROXY', {
      url: url.toString(),
      method,
      status: response.status,
      requestBody: typeof body === 'string' ? body : undefined,
      responseBody: data,
    });

    captureApiError({
      url: url.toString(),
      apiPath,
      method,
      status: response.status,
      responseBody: data,
    });
  }

  return NextResponse.json(data, { status: response.status });
};

export const GET = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'GET');

export const POST = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'POST');

export const PUT = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'PUT');

export const PATCH = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'PATCH');

export const DELETE = (
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) => proxyRequest(req, ctx, 'DELETE');
`,
  }),
};
