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

  // ─── 공유 파일 조각 (providers 합성용) ───

  providerImports: [
    `import { NextIntlClientProvider } from 'next-intl';`,
  ],
  providerWrappers: ['NextIntlClientProvider'],

  // ─── 라우트 구조 변환 ───

  transforms: (arch) => [
    { type: 'move', from: 'app/page.tsx', to: 'app/[locale]/page.tsx' },
    { type: 'move', from: 'app/error.tsx', to: 'app/[locale]/error.tsx' },
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
      type: 'replace',
      path: 'app/[locale]/layout.tsx',
      contentFn: (existing) => {
        const sideEffectImports = existing
          .split('\n')
          .filter((line) => /^\s*import\s+['"][^'"]+['"];?\s*$/.test(line))
          .join('\n');
        const body = `import type { Metadata } from 'next';
import { RootLayout } from '${arch.aliases.layouts}/RootLayout';

export const metadata: Metadata = {
  title: 'My App',
  description: 'My App Description',
};

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return <RootLayout params={params}>{children}</RootLayout>;
}
`;
        return sideEffectImports ? `${sideEffectImports}\n\n${body}` : body;
      },
    },
    {
      type: 'replace',
      path: `${arch.paths.layouts}/RootLayout.tsx`,
      content: `import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { GlobalProvider } from '${arch.aliases.providers}';
import { routing } from '${arch.aliases.config}/i18n/routing';

export async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
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
    "search": "검색",
    "back": "뒤로"
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
    "search": "Search",
    "back": "Back"
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
import { routing } from '${arch.aliases.config}/i18n/routing';

const intl = createIntlMiddleware(routing);

export default intl;

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\\\..*).*)',
};
`,
  }),
};
