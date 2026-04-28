export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function I18nRecipe() {
  return (
    <main className="container">
      <h1>next-intl + 로케일 쿠키</h1>
      <p className="muted">
        <code>NEXT_LOCALE</code> 쿠키로 사용자 언어를 기억하고, BFF 가
        <code> Accept-Language</code> 헤더로 백엔드에 자동 전달한다.
      </p>

      <h2>흐름</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`[사용자 언어 선택] → NEXT_LOCALE 쿠키 set
                       │
                       ├─► next-intl 미들웨어가 /ko/... · /en/... 라우팅
                       │
                       └─► /api/proxy 가 NEXT_LOCALE → Accept-Language 헤더로 백엔드에 전달`}
      />
      <p>
        <strong>템플릿의 <code>/api/proxy</code>는 이미 이 흐름을 지원한다.</strong>{" "}
        쿠키만 박혀 있으면 자동으로 백엔드로 전달됨. 이 레시피는 next-intl 자체
        세팅을 다룬다.
      </p>

      <h2>설치</h2>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`pnpm add next-intl`}
      />

      <h2>1. 라우팅 설정</h2>
      <CodePanel
        language="ts"
        filename="src/shared/config/i18n/routing.ts"
        code={`import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365 },
});`}
      />

      <h2>2. 메시지 파일</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`src/shared/config/i18n/messages/
├── ko.json
└── en.json`}
      />
      <CodePanel
        language="json"
        filename="src/shared/config/i18n/messages/ko.json"
        code={`{
  "common": {
    "submit": "제출",
    "cancel": "취소"
  }
}`}
      />

      <h2>3. 요청 설정</h2>
      <CodePanel
        language="ts"
        filename="src/shared/config/i18n/request.ts"
        code={`import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && routing.locales.includes(requested as never)
      ? requested
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(\`./messages/\${locale}.json\`)).default,
  };
});`}
      />
      <CodePanel
        language="ts"
        filename="next.config.ts"
        code={`import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts');

export default withNextIntl({ /* ...기존 설정 */ });`}
      />

      <h2>4. 미들웨어 — next-intl + 인증 가드 합치기</h2>
      <p>
        next-intl 미들웨어와 <a href="/recipes/auth">인증 라우트 가드</a>를 한 파일에
        합친다. next-intl 이 먼저 라우팅 처리(로케일 prefix 정규화)를 하고, 그
        결과 응답에 인증 가드의 redirect/cookie 를 덮어씌운다.
      </p>
      <CodePanel
        language="ts"
        filename="middleware.ts"
        code={`import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from '@/shared/config/i18n/routing';

const intl = createIntlMiddleware(routing);

const PROTECTED_PREFIXES = ['/dashboard'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

const stripLocalePrefix = (pathname: string): string => {
  const locales = routing.locales as readonly string[];
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.includes(segments[0])) {
    const rest = segments.slice(1).join('/');
    return \`/\${rest}\`.replace(/\\/$/, '') || '/';
  }
  return pathname;
};

export const middleware = (req: NextRequest) => {
  const intlRes = intl(req);
  const pathname = stripLocalePrefix(req.nextUrl.pathname);
  const accessToken = req.cookies.get('accessToken')?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return intlRes;
};

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\\\..*).*)',
};`}
      />

      <h2>5. App Router 구조</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`app/
├── [locale]/          # 모든 라우트는 로케일 prefix 안에
│   ├── layout.tsx
│   ├── page.tsx
│   └── sign-in/
└── api/proxy/[...path]/route.ts  # API 는 prefix 밖`}
      />
      <CodePanel
        language="tsx"
        filename="app/[locale]/layout.tsx"
        code={`import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/shared/config/i18n/routing';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();

  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}`}
      />

      <h2>6. 사용</h2>
      <CodePanel
        language="tsx"
        filename="서버 컴포넌트"
        code={`import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('submit')}</h1>;
}`}
      />
      <CodePanel
        language="tsx"
        filename="클라이언트 컴포넌트"
        code={`'use client';
import { useTranslations } from 'next-intl';

export function SubmitButton() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}`}
      />

      <h2>BFF 와의 연동 — 자동</h2>
      <p>
        템플릿의 <code>/api/proxy/[...path]/route.ts</code> 는 이미{" "}
        <code>NEXT_LOCALE</code> 쿠키를 읽어 백엔드 요청에{" "}
        <code>Accept-Language</code> 헤더로 변환해 보낸다. next-intl 셋업만
        하면 추가 작업 없이 백엔드가 사용자 언어를 인지한다.
      </p>
      <CodePanel
        language="ts"
        showLineNumbers={false}
        code={`// route.ts 의 해당 라인 (이미 박혀있음)
const locale =
  cookieStore.get(LOCALE_COOKIE)?.value ??
  request.headers.get('Accept-Language') ??
  undefined;
if (locale) headers['Accept-Language'] = locale;`}
      />
    </main>
  );
}
