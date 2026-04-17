import "./globals.css";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";

export const metadata = {
  title: "sh-ui",
  description: "sh-ui — 짧은 이름, 단단한 기본기. 담백하게 설계된 멀티 플랫폼 디자인 시스템.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let isDark = false;
  try {
    const cookieStore = await cookies();
    isDark = cookieStore.get("sh-ui-theme")?.value === "dark";
  } catch {
    // force-static 페이지에서는 cookies() 사용 불가
  }

  return (
    <html lang="ko" className={isDark ? "dark" : ""}>
      <body>
        <AppShell defaultTheme={isDark ? "dark" : "light"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
