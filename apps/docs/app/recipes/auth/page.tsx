export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function AuthRecipe() {
  return (
    <main className="container">
      <h1>인증 추가</h1>
      <p className="muted">
        템플릿의 <code>/api/proxy</code>에 로그인/로그아웃 쿠키 set,
        401 시 refresh-and-retry, 미들웨어 라우트 가드를 추가한다.
      </p>

      <h2>구조 — 왜 BFF에서 처리하나</h2>
      <ul>
        <li>
          <strong>쿠키는 httpOnly</strong> — 브라우저 JS 가 토큰을 읽지 못한다.
          XSS 가 발생해도 토큰을 빼앗기지 않음.
        </li>
        <li>
          <strong>인증은 라우트 핸들러 한 곳에서</strong> — 미들웨어와 axios
          인터셉터에 분산된 인증 로직을 만들지 않는다. 미들웨어는 라우트 가드만,
          인터셉터는 응답 형태 변환만 담당.
        </li>
        <li>
          <strong>토큰 refresh 도 BFF</strong> — 동시 요청 다수가 만료를 만나는
          경우는 in-flight refresh promise 캐시로 처리한다. 미들웨어는 refresh
          하지 않음.
        </li>
      </ul>

      <h2>전제 — 백엔드 동작</h2>
      <ul>
        <li>
          <code>POST /v1/auth/login</code> — 응답 body 에{" "}
          <code>{"{ accessToken, refreshToken }"}</code>
        </li>
        <li>
          <code>POST /v1/auth/logout</code> — 성공 시{" "}
          <code>result: SUCCESS</code>
        </li>
        <li>
          <code>GET /v1/auth/token/refresh?refreshToken=...</code> — 응답
          body 에 새 토큰 쌍
        </li>
      </ul>

      <h2>1. 라우트 핸들러 확장 — 로그인/로그아웃 쿠키</h2>
      <p>
        백엔드 응답을 그대로 흘려보내되, 인증 경로일 때만 쿠키를
        set / delete 한다.
      </p>
      <CodePanel
        language="ts"
        filename="app/api/proxy/[...path]/route.ts (추가 부분)"
        code={`const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
};

const AUTH_PATHS = {
  LOGIN: 'v1/auth/login',
  LOGOUT: 'v1/auth/logout',
} as const;

// proxyRequest 함수 끝부분 — 응답을 만들고 반환하기 직전에:
const res = NextResponse.json(data, { status: response.status });

if (apiPath === AUTH_PATHS.LOGIN && data.result === 'SUCCESS') {
  res.cookies.set('accessToken', data.data.accessToken, COOKIE_OPTIONS);
  res.cookies.set('refreshToken', data.data.refreshToken, COOKIE_OPTIONS);
}

if (apiPath === AUTH_PATHS.LOGOUT && data.result === 'SUCCESS') {
  res.cookies.set('accessToken', '', { ...COOKIE_OPTIONS, maxAge: -1 });
  res.cookies.set('refreshToken', '', { ...COOKIE_OPTIONS, maxAge: -1 });
}

return res;`}
      />
      <p>
        이렇게 하면 클라이언트는 평범하게{" "}
        <code>http.post(&apos;/v1/auth/login&apos;, ...)</code> 만 호출하면 되고,
        쿠키는 BFF 가 자동으로 박아준다.
      </p>

      <h2>2. 401 시 refresh-and-retry</h2>
      <p>
        백엔드가 401 을 반환하면 라우트 핸들러가 refreshToken 으로 재발급을
        시도하고 새 토큰으로 같은 요청을 한 번 더 보낸다. 실패하면 쿠키를
        지우고 <code>AUTH_EXPIRED</code>로 응답한다.
      </p>
      <CodePanel
        language="ts"
        filename="app/api/proxy/[...path]/route.ts (확장)"
        code={`const refreshTokens = async (refreshToken: string) => {
  const url = \`\${API_URL}/v1/auth/token/refresh?refreshToken=\${encodeURIComponent(
    refreshToken,
  )}\`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    if (body.result === 'SUCCESS') {
      return {
        success: true as const,
        accessToken: body.data.accessToken as string,
        refreshToken: body.data.refreshToken as string,
      };
    }
    return { success: false as const };
  } catch {
    return { success: false as const };
  }
};

const buildAuthExpiredResponse = () => {
  const res = NextResponse.json(
    {
      result: 'ERROR',
      data: null,
      error: {
        code: 'AUTH_EXPIRED',
        message: '인증이 만료되었습니다. 다시 로그인해주세요.',
      },
    },
    { status: 401 },
  );
  res.cookies.set('accessToken', '', { ...COOKIE_OPTIONS, maxAge: -1 });
  res.cookies.set('refreshToken', '', { ...COOKIE_OPTIONS, maxAge: -1 });
  return res;
};

// proxyRequest 안 — 백엔드 응답이 401 일 때
if (response.status === 401) {
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  if (!refreshToken) return buildAuthExpiredResponse();

  const result = await refreshTokens(refreshToken);
  if (!result.success) return buildAuthExpiredResponse();

  // 새 토큰으로 재요청
  headers.Authorization = \`Bearer \${result.accessToken}\`;
  const retry = await fetch(url.toString(), { method, headers, body });
  const retryData = await retry.json();

  const res = NextResponse.json(retryData, { status: retry.status });
  res.cookies.set('accessToken', result.accessToken, COOKIE_OPTIONS);
  res.cookies.set('refreshToken', result.refreshToken, COOKIE_OPTIONS);
  return res;
}`}
      />

      <h2>3. 미들웨어 라우트 가드</h2>
      <p>
        쿠키 존재 여부만 보고 보호 라우트와 인증 라우트를 분기한다. 토큰
        재발급은 <strong>여기서 하지 않는다</strong> — BFF 가 처리.
      </p>
      <CodePanel
        language="ts"
        filename="middleware.ts"
        code={`import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
};

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\\\..*).*)',
};`}
      />
      <p className="muted">
        accessToken 만료 여부는 미들웨어에서 검증하지 않는다. 만료된 채로
        통과시키고, 첫 인증 호출에서 BFF 가 refresh 한다 — 만료 검증을
        미들웨어와 BFF 양쪽에서 하면 동시 요청 시 race condition 이 생긴다.
      </p>

      <h2>4. 클라이언트에서 AUTH_EXPIRED 처리</h2>
      <p>
        BFF 가 <code>AUTH_EXPIRED</code> 응답을 만들면, 클라이언트는 SPA
        내부에서도 즉시 로그인 페이지로 이동시킨다 (다음 네비게이션을
        기다리지 않고).
      </p>
      <CodePanel
        language="ts"
        filename="src/shared/api/http.ts (응답 인터셉터에 추가)"
        code={`http.interceptors.response.use(
  (response) => { /* ... 기존 ... */ },
  (error) => {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      const errorBody = (response?.data as ApiResponse | undefined)?.error;

      const isClient = typeof window !== 'undefined';
      if (
        isClient &&
        response?.status === 401 &&
        errorBody?.code === 'AUTH_EXPIRED' &&
        !window.location.pathname.startsWith('/sign-in') &&
        !window.location.pathname.startsWith('/sign-up')
      ) {
        window.location.href = '/sign-in';
      }

      return Promise.reject(
        new ApiError(response?.status ?? 0, errorBody?.code ?? '', errorBody ?? null),
      );
    }
    return Promise.reject(error);
  },
);`}
      />

      <h2>로그인 호출 (entities/feature 측)</h2>
      <p>
        쿠키는 BFF 가 박아주므로 클라이언트는 평범하게 mutation 만 보내면 된다.
      </p>
      <CodePanel
        language="ts"
        filename="features/auth/api/postSignInApi.ts"
        code={`import { http } from '@/shared/api/http';

type SignInPayload = { email: string; password: string };
type SignInResponse = { accessToken: string; refreshToken: string };

export const postSignInApi = async (payload: SignInPayload) => {
  const { data } = await http.post<SignInResponse>('/v1/auth/login', payload);
  return data;
};`}
      />
      <CodePanel
        language="tsx"
        filename="features/auth/ui/SignInForm.tsx"
        code={`'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { postSignInApi } from '../api/postSignInApi';

export function SignInForm() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: postSignInApi,
    onSuccess: () => router.push('/'),
  });

  // ... handleSubmit 에서 mutate(payload) 호출
}`}
      />

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
