import { GlobalProvider } from '@/components/providers';

export function RootLayout({ children }: { children: React.ReactNode }) {
  // `lang` 은 앱의 주 언어. 영어 등 다른 언어 우선이면 'en' 으로 바꾸거나
  // next-intl 플러그인을 활성화해 라우트 기반 자동 분기로 전환하세요.
  return (
    <html lang='ko' suppressHydrationWarning>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
