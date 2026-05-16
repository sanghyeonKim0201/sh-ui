/**
 * next-intl 플러그인 — Layer 2 부터 arch-aware.
 *
 * 모든 fs 경로 / import alias 가 arch 디스크립터의 논리 키에서 파생된다:
 *   - i18n 설정 (request/routing/navigation/messages) → arch.paths.config + '/i18n'
 *   - 내부 import (RootLayout, GlobalProvider) → arch.aliases.layouts / providers
 *
 * FSD 에서는 v0.57 까지의 하드코딩과 1:1 일치 (회귀 가드는 smoke 시나리오 3).
 * flat 에서는 자동으로 lib/config/i18n + components/layouts/RootLayout 로 emit.
 */
export const nextIntlPlugin = {
  name: 'next-intl',
  label: 'next-intl (다국어 지원)',
  description:
    '다국어. 라우트 기반 로케일, NEXT_LOCALE 쿠키, BFF 가 백엔드로 Accept-Language 자동 전달.',
  priority: 2,

  dependencies: {
    'next-intl': '^4.8.3',
  },

  // ─── next.config.ts 관련 ───

  imports: [
    `import createNextIntlPlugin from 'next-intl/plugin';`,
  ],

  preExport: (arch) => [
    `const withNextIntl = createNextIntlPlugin('./${arch.paths.config}/i18n/request.ts');`,
  ],

  wrapExport(expr) {
    return `withNextIntl(${expr})`;
  },

  envVars: [],

  turboEnvVars: [],

  // ─── providers 합성 ───
  //
  // NextIntlClientProvider 는 GlobalProvider 가 아니라 RootLayout 에서 직접 wrap 한다.
  // 이유: RootLayout 만이 검증된 `locale: string` 을 가지므로 `<NextIntlClientProvider
  // locale={locale}>` 처럼 prop 을 명시할 수 있다. GlobalProvider 단에서 wrap 하면
  // locale 을 prop drilling 해야 해서 깔끔하지 않다. 대신 RootLayout 의 content
  // (아래 transforms 의 replace) 가 NextIntlClientProvider 를 직접 import + wrap.

  // ─── 라우트 구조 변환 ───

  transforms: (arch) => [
    { type: 'move', from: 'app/page.tsx', to: 'app/[locale]/page.tsx' },
    { type: 'move', from: 'app/error.tsx', to: 'app/[locale]/error.tsx' },
    // sentry 가 emit 한 error.tsx 를 i18n-aware 버전으로 교체.
    // sentry 비활성이면 위 move 가 no-op 이라 [locale]/error.tsx 가 없고 이 replace 도 no-op.
    {
      type: 'replace',
      path: 'app/[locale]/error.tsx',
      contentFn: () => `'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Link } from '${arch.aliases.config}/i18n/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='border-border bg-background w-full max-w-md rounded-lg border p-6 shadow-lg'>
        <div className='mb-4 flex justify-center'>
          <div className='bg-danger/10 flex h-16 w-16 items-center justify-center rounded-full'>
            <AlertTriangle className='text-danger h-8 w-8' />
          </div>
        </div>

        <h2 className='text-foreground mb-2 text-center text-2xl font-bold'>
          {t('title')}
        </h2>
        <p className='text-foreground-muted mb-6 text-center text-sm'>
          {t('description')}
        </p>

        <div className='border-danger/30 bg-danger/5 rounded-md border p-3'>
          <p className='text-danger text-sm'>
            {error.message || t('unexpectedError')}
          </p>
        </div>

        <div className='mt-6 space-y-3'>
          <button
            onClick={reset}
            className='bg-primary text-primary-foreground hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium'
          >
            <RefreshCw className='h-4 w-4' />
            {t('button.tryAgain')}
          </button>

          <Link
            href='/'
            className='border-border text-foreground hover:bg-background-muted flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium'
          >
            <Home className='h-4 w-4' />
            {t('button.goHome')}
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className='bg-background-subtle mt-4 rounded-md p-3'>
            <p className='text-foreground-subtle text-xs'>
              Error ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
`,
    },
    {
      // Next 16 부터 root layout (app/layout.tsx) 은 반드시 <html>/<body> 를 가져야 한다.
      // next-intl 적용 시에는 [locale] 가 root 역할을 맡으므로, 기본 app/layout.tsx 를 그대로
      // [locale]/layout.tsx 로 이동시켜 globals.css side-effect import 를 보존한 뒤,
      // body 만 locale-aware 버전으로 교체한다. 결과적으로 app/layout.tsx 는 존재하지 않게 되고
      // [locale]/layout.tsx 가 Next 의 root layout 으로 인식된다.
      type: 'move',
      from: 'app/layout.tsx',
      to: 'app/[locale]/layout.tsx',
    },
    {
      // 위에서 옮겨진 [locale]/layout.tsx 는 비-locale 버전 — body 를 locale-aware 로 갈아끼운다.
      // side-effect import (`import 'x';` 형태, binding 없음) 만 보존하고 나머지는 통째 교체.
      // 이름 있는 import (예: `import { RootLayout } from ...`) 는 새 본체와 식별자 충돌 가능성이
      // 있어 제외.
      //
      // 경로 보정: 파일이 `app/layout.tsx` → `app/[locale]/layout.tsx` 로 1단계 깊어졌으므로
      // 보존된 side-effect import 의 상대 경로(`./x` / `../x`)는 `../` 한 번만큼 더 위로 끌어올린다.
      // 절대 경로(`/x`)나 모듈명(`polyfills`)은 그대로. v0.59.8 까지는 보정이 빠져 standalone+next-intl
      // 조합에서 `./globals.css` 가 깨졌고 prod 빌드가 실패했다.
      type: 'replace',
      path: 'app/[locale]/layout.tsx',
      contentFn: (existing) => {
        const adjustRelative = (line) =>
          line.replace(/(['"])(\.\.?\/)/g, (_m, q, prefix) => `${q}../${prefix === './' ? '' : prefix}`);
        const sideEffectImports = existing
          .split('\n')
          .filter((line) => /^\s*import\s+['"][^'"]+['"];?\s*$/.test(line))
          .map(adjustRelative)
          .join('\n');
        const body = `import type { Metadata } from 'next';
import { RootLayout } from '${arch.aliases.layouts}/RootLayout';

export const metadata: Metadata = {
  title: 'sh-ui app',
  description: 'sh-ui 기반 앱 — metadata 를 변경하세요.',
};

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return <RootLayout locale={locale}>{children}</RootLayout>;
}
`;
        return sideEffectImports ? `${sideEffectImports}\n\n${body}` : body;
      },
    },
    {
      type: 'replace',
      path: `${arch.paths.layouts}/RootLayout.tsx`,
      content: `import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { GlobalProvider } from '${arch.aliases.providers}';
import { routing } from '${arch.aliases.config}/i18n/routing';

/**
 * 루트 셸 — html/body + 전역 Provider. 로케일 검증은 여기서 한 번만.
 * 호출자([locale]/layout.tsx) 가 이미 \`await params\` 로 string 을 풀어 넘긴다.
 *
 * NextIntlClientProvider 는 GlobalProvider 바깥(html 안쪽) 에서 \`locale\` prop 과
 * 함께 직접 wrap. 자동 detect 로 두면 client 컴포넌트에서 useLocale() 결과가
 * RSC 컨텍스트와 어긋날 수 있어 명시적으로 전달한다.
 */
export function RootLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale}>
          <GlobalProvider>{children}</GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
`,
    },
  ],

  // ─── 독립 파일 ───

  files: (arch) => ({
    [`${arch.paths.config}/i18n/routing.ts`]: `import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});
`,

    [`${arch.paths.config}/i18n/request.ts`]: `import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(\`./messages/\${locale}.json\`)).default,
  };
});
`,

    [`${arch.paths.config}/i18n/navigation.ts`]: `import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
`,

    [`${arch.paths.config}/i18n/messages/ko.json`]: `{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "confirm": "확인",
    "cancel": "취소",
    "save": "저장",
    "delete": "삭제",
    "edit": "수정",
    "create": "만들기",
    "search": "검색",
    "back": "뒤로",
    "name": "이름",
    "description": "설명",
    "empty": "아직 항목이 없습니다."
  },
  "nav": {
    "home": "홈",
    "settings": "설정"
  },
  "app": {
    "title": "App"
  },
  "form": {
    "required": "필수 항목입니다.",
    "invalid": "올바른 값을 입력하세요.",
    "submit": "제출",
    "reset": "초기화"
  },
  "error": {
    "title": "오류가 발생했습니다",
    "description": "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
    "unexpectedError": "알 수 없는 오류",
    "button": {
      "tryAgain": "다시 시도",
      "goHome": "홈으로 이동"
    }
  },
  "notFound": {
    "title": "페이지를 찾을 수 없습니다",
    "description": "요청하신 페이지가 존재하지 않습니다.",
    "button": {
      "goHome": "홈으로 이동"
    }
  }
}
`,

    [`${arch.paths.config}/i18n/messages/en.json`]: `{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "back": "Back",
    "name": "Name",
    "description": "Description",
    "empty": "No items yet."
  },
  "nav": {
    "home": "Home",
    "settings": "Settings"
  },
  "app": {
    "title": "App"
  },
  "form": {
    "required": "This field is required.",
    "invalid": "Please enter a valid value.",
    "submit": "Submit",
    "reset": "Reset"
  },
  "error": {
    "title": "Something went wrong",
    "description": "An unexpected error occurred. Please try again.",
    "unexpectedError": "Unknown error",
    "button": {
      "tryAgain": "Try again",
      "goHome": "Go home"
    }
  },
  "notFound": {
    "title": "Page not found",
    "description": "The page you requested does not exist.",
    "button": {
      "goHome": "Go home"
    }
  }
}
`,

    'proxy.ts': `import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

import { routing } from '${arch.aliases.config}/i18n/routing';

/**
 * 홈(\`/\`, \`/{locale}\`) 진입 시 redirect 할 path. 빈 문자열이면
 * \`app/[locale]/page.tsx\` 가 그대로 노출. 예: '/dashboard', '/projects'.
 */
const HOME_REDIRECT = '';

const intl = createIntlMiddleware(routing);

/**
 * 로케일 prefix (/ko, /en) 를 벗겨 홈 매칭 (\`/\`) 에 사용한다.
 * 예: /ko → /, /ko/posts → /posts.
 */
const stripLocalePrefix = (pathname: string): string => {
  const locales = routing.locales as readonly string[];
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.includes(segments[0])) {
    const rest = segments.slice(1).join('/');
    return \`/\${rest}\`.replace(/\\/$/, '') || '/';
  }
  return pathname;
};

export default function proxy(req: NextRequest) {
  if (HOME_REDIRECT && stripLocalePrefix(req.nextUrl.pathname) === '/') {
    return NextResponse.redirect(new URL(HOME_REDIRECT, req.url));
  }
  return intl(req);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\\\..*).*)',
};
`,

    // ─── i18n-aware formatter hooks ───
    //
    // base 템플릿의 \`formatDate\` / \`formatPrice\` util 은 default 'ko-KR' / 'KRW'.
    // next-intl 활성 시엔 hook 으로 현재 locale 자동 추적.

    [`${arch.paths.hooks}/useFormatDate.ts`]: `'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';

import {
  formatDate as formatDateUtil,
  formatDateTime as formatDateTimeUtil,
} from '${arch.aliases.utils}/formatDate';

/**
 * 현재 locale 을 자동으로 따르는 날짜 포맷 hook.
 * 'use client' 필요 — RSC 에선 \`getLocale()\` 로 직접 util 호출.
 */
export function useFormatDate() {
  const locale = useLocale();
  return useCallback((date: Date) => formatDateUtil(date, locale), [locale]);
}

export function useFormatDateTime() {
  const locale = useLocale();
  return useCallback((date: Date) => formatDateTimeUtil(date, locale), [locale]);
}
`,

    [`${arch.paths.hooks}/useFormatPrice.ts`]: `'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';

import { formatPrice as formatPriceUtil } from '${arch.aliases.utils}/formatPrice';

/**
 * 현재 locale 을 자동으로 따르는 통화 포맷 hook.
 * currency 는 비즈니스 의존이라 인자로 받음 — 사용처에서 명시.
 *
 * 예: const fp = useFormatPrice('USD'); fp(99.5) → "$99.50" (locale 'en-US' 시)
 */
export function useFormatPrice(currency = 'KRW') {
  const locale = useLocale();
  return useCallback(
    (amount: number) => formatPriceUtil(amount, locale, currency),
    [locale, currency],
  );
}
`,
  }),
};
