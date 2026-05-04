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

  preExport: [
    `const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts');`,
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

  transforms: [
    { type: 'move', from: 'app/page.tsx', to: 'app/[locale]/page.tsx' },
    { type: 'move', from: 'app/error.tsx', to: 'app/[locale]/error.tsx' },
    {
      // 기본 nextjs-app 템플릿의 app/layout.tsx 는 globals.css 를 side-effect import 한다 —
      // next-intl 도입 시 layout 본체는 [locale]/layout.tsx 로 옮기지만, CSS import 는 root
      // layout 에 살아 있어야 사용자 프로젝트의 Tailwind 스타일이 동작한다. content 통째 교체
      // 대신 contentFn 으로 side-effect import (`import 'x';` 형태, binding 없음) 만 추출해
      // 새 본체 앞에 prepend. 이름 있는 import (예: `import { RootLayout } from ...`) 는 새 본체와
      // 식별자 충돌 가능성이 있어 제외.
      type: 'replace',
      path: 'app/layout.tsx',
      contentFn: (existing) => {
        const sideEffectImports = existing
          .split('\n')
          .filter((line) => /^\s*import\s+['"][^'"]+['"];?\s*$/.test(line))
          .join('\n');
        const body = `export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
`;
        return sideEffectImports ? `${sideEffectImports}\n\n${body}` : body;
      },
    },
    {
      type: 'replace',
      path: 'src/app/layouts/RootLayout.tsx',
      content: `import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { GlobalProvider } from '@/src/app/providers';
import { routing } from '@/src/shared/config/i18n/routing';

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

  files: {
    'src/shared/config/i18n/routing.ts': `import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});
`,

    'src/shared/config/i18n/request.ts': `import { getRequestConfig } from 'next-intl/server';
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

    'src/shared/config/i18n/navigation.ts': `import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
`,

    'src/shared/config/i18n/messages/ko.json': `{
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

    'src/shared/config/i18n/messages/en.json': `{
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

    'app/[locale]/layout.tsx': `import type { Metadata } from 'next';
import { RootLayout } from '@/src/app/layouts/RootLayout';

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
`,

    'proxy.ts': `import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/src/shared/config/i18n/routing';

const intl = createIntlMiddleware(routing);

export default intl;

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\\\..*).*)',
};
`,
  },
};
