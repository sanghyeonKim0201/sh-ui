export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function NextIntlPlugin() {
  return (
    <main className="container">
      <h1>next-intl</h1>
      <p className="muted">
        다국어 플러그인. <code>next-intl</code> 의 라우트 기반 로케일,{" "}
        <code>NEXT_LOCALE</code> 쿠키, 그리고 BFF 가 백엔드로{" "}
        <code>Accept-Language</code> 자동 전달하는 흐름을 한 번에 세팅.
      </p>

      <h2>1. 개요</h2>
      <ul>
        <li>
          <strong>라우트 prefix:</strong> <code>/ko/...</code>,{" "}
          <code>/en/...</code> 으로 로케일이 URL 에 박힘.
        </li>
        <li>
          <strong>쿠키 기억:</strong> 사용자 선택은{" "}
          <code>NEXT_LOCALE</code> 쿠키로 1 년 보관.
        </li>
        <li>
          <strong>백엔드 자동 전달:</strong> 베이스 BFF 가 쿠키를{" "}
          <code>Accept-Language</code> 헤더로 변환해 백엔드에 보냄 — 추가 작업
          없이 백엔드가 사용자 언어 인지.
        </li>
        <li>
          <strong>RSC + Client 양쪽:</strong>{" "}
          <code>getTranslations</code>(서버) /{" "}
          <code>useTranslations</code>(클라) 둘 다 사용 가능.
        </li>
      </ul>

      <h2>2. 설치</h2>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli create my-app --platform next --structure standalone --plugins next-intl --yes`}
      />

      <h2>3. 폴더 구조</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`my-app/
├── next.config.ts                                  ← MODIFY  withNextIntl 로 감싸짐
├── proxy.ts                                        ← NEW    intl 미들웨어
├── src/
│   └── shared/
│       └── config/
│           └── i18n/
│               ├── routing.ts                      ← NEW   defineRouting (locales, defaultLocale, cookie)
│               ├── request.ts                      ← NEW   getRequestConfig (메시지 로드)
│               ├── navigation.ts                   ← NEW   로케일 인식 Link, useRouter
│               └── messages/
│                   ├── ko.json                     ← NEW
│                   └── en.json                     ← NEW
└── app/
    └── [locale]/                                   ← NEW   모든 라우트가 prefix 안으로
        ├── layout.tsx                              ← NEW   NextIntlClientProvider
        └── (기존 page.tsx 등은 [locale] 안으로 이동)`}
      />
      <h3>각 파일이 하는 일</h3>
      <ul>
        <li>
          <code>routing.ts</code> — locale 목록, defaultLocale,{" "}
          <code>NEXT_LOCALE</code> 쿠키 설정.
        </li>
        <li>
          <code>request.ts</code> — 요청별 메시지 로드. <code>locale</code> 이
          허용 목록에 없으면 default 로 fallback.
        </li>
        <li>
          <code>messages/{`{ko,en}`}.json</code> — 번역 키-값. 네임스페이스로
          구조화 (예: <code>common.submit</code>).
        </li>
        <li>
          <code>proxy.ts</code> — Next 16 미들웨어. <code>createIntlMiddleware</code>{" "}
          가 로케일 라우팅을 처리.
        </li>
        <li>
          <code>app/[locale]/layout.tsx</code> —{" "}
          <code>NextIntlClientProvider</code> 로 클라이언트 훅 사용 가능하게.
          locale 이 허용 목록 밖이면 <code>notFound()</code>.
        </li>
      </ul>

      <h2>4. 아키텍처</h2>
      <CodePanel
        language="text"
        filename="요청 흐름"
        showLineNumbers={false}
        code={`browser → /ko/orders 진입
  proxy.ts: intl 미들웨어가 locale prefix 검증 + NEXT_LOCALE 쿠키 set
            ↓
  RSC → http() → serverFetch
                    ↓
                Authorization 주입 + Accept-Language: ko 헤더 자동
                    ↓
                백엔드`}
      />

      <h2>5. 사용 패턴</h2>

      <h3>서버 컴포넌트</h3>
      <CodePanel
        language="tsx"
        filename="app/[locale]/page.tsx"
        code={`import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('submit')}</h1>;
}`}
      />

      <h3>클라이언트 컴포넌트</h3>
      <CodePanel
        language="tsx"
        code={`'use client';

import { useTranslations } from 'next-intl';

export function SubmitButton() {
  const t = useTranslations('common');
  return <button>{t('submit')}</button>;
}`}
      />

      <h3>로케일 전환</h3>
      <CodePanel
        language="tsx"
        code={`'use client';

import { useRouter, usePathname } from 'next/navigation';

export function LocaleSwitcher({ current }: { current: 'ko' | 'en' }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'ko' | 'en') => {
    // /ko/orders → /en/orders
    const stripped = pathname.replace(/^\\/(ko|en)/, '');
    router.replace(\`/\${next}\${stripped}\`);
  };

  return (
    <div>
      <button onClick={() => switchTo('ko')} disabled={current === 'ko'}>한국어</button>
      <button onClick={() => switchTo('en')} disabled={current === 'en'}>English</button>
    </div>
  );
}`}
      />

      <h2>6. 환경 변수</h2>
      <p>
        next-intl 자체는 환경변수가 없다. 베이스의{" "}
        <code>API_URL</code> 만 있으면 충분.
      </p>

      <h2>7. 커스터마이징</h2>

      <h3>locale 추가</h3>
      <CodePanel
        language="ts"
        filename="src/shared/config/i18n/routing.ts"
        code={`export const routing = defineRouting({
  locales: ['ko', 'en', 'ja'],   // ← ja 추가
  defaultLocale: 'ko',
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365 },
});`}
      />
      <p>
        그리고 <code>messages/ja.json</code> 추가. 그게 끝 — 라우팅 매칭은
        자동.
      </p>

      <h3>locale prefix 정책</h3>
      <CodePanel
        language="ts"
        code={`// always: /ko, /en (default 도 prefix 강제)
defineRouting({ locales: [...], defaultLocale: 'ko', localePrefix: 'always' });

// as-needed: /en, /ja (default 는 / 그대로)
defineRouting({ locales: [...], defaultLocale: 'ko', localePrefix: 'as-needed' });

// never: prefix 없음 (쿠키만으로 판단)
defineRouting({ locales: [...], defaultLocale: 'ko', localePrefix: 'never' });`}
      />

      <h3>중첩 메시지 / 변수</h3>
      <CodePanel
        language="json"
        filename="messages/ko.json"
        code={`{
  "order": {
    "title": "주문 #{id}",
    "status": {
      "pending": "대기 중",
      "shipped": "배송됨"
    }
  }
}`}
      />
      <CodePanel
        language="tsx"
        code={`const t = useTranslations('order');
t('title', { id: 42 });          // "주문 #42"
t('status.shipped');             // "배송됨"`}
      />

    </main>
  );
}
