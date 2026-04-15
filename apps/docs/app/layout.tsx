import "./globals.css";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

export const metadata = {
  title: "Hyeon Design System",
  description: "Hyeon (玄) — 검고 그윽한, 멀티 플랫폼 디자인 시스템",
};

// 하이드레이션 전에 테마 적용 (FOUC 방지)
const themeScript = `
  try {
    var t = localStorage.getItem('hyeon-docs-theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
