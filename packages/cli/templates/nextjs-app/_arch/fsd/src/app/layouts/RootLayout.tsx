import { GlobalProvider } from '@/src/app/providers';

/**
 * 첫 paint 전에 localStorage 의 theme 값을 읽어 <html> 에 class 를 박는
 * FOUC 차단 inline script. next-themes 의 ThemeProvider 가 client mount 후
 * 동일 작업을 하지만, mount 전 한 frame 동안 light/dark 깜빡임이 생긴다.
 * 이걸 막으려고 SSR 응답 head 안쪽에 동기 실행 script 박음.
 */
const themeInitScript = `try{var t=localStorage.getItem('theme');var c=document.documentElement.classList;if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){c.add('dark');}else if(t==='light'){c.add('light');}}catch(e){}`;

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
