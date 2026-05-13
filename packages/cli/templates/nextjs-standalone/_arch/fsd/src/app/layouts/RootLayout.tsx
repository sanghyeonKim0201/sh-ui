import { GlobalProvider } from '@/src/app/providers';

/** FOUC 차단 — next-themes mount 전에 첫 paint 에 dark class 박기.
 *  matrix: 'dark' → .dark, 'light' → (none), 'system'/unset → system pref. */
const themeInitScript = `try{var t=localStorage.getItem('theme');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme:dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}`;

export function RootLayout({ children }: { children: React.ReactNode }) {
  // `lang` 은 앱의 주 언어. 영어 등 다른 언어 우선이면 'en' 으로 바꾸거나
  // next-intl 플러그인을 활성화해 라우트 기반 자동 분기로 전환하세요.
  return (
    <html lang='ko' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
