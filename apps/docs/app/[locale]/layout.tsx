import "../globals.css";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/ui/theme";
import { Toaster } from "@/components/ui/toast";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: "sh-ui",
    description: t("siteDescription"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  let isDark = false;
  try {
    const cookieStore = await cookies();
    isDark = cookieStore.get("sh-ui-theme")?.value === "dark";
  } catch {
    // force-static 페이지에서는 cookies() 사용 불가 — 아래 인라인 스크립트가 클라이언트에서 보정.
  }

  const messages = await getMessages();

  // force-static 페이지는 SSR 시 항상 isDark=false 폴백이라 클래스가 light 로 굳어진다.
  // 인라인 스크립트로 hydration 전에 cookie 를 읽어 .dark/.light 즉시 부여 — 깜빡임 없음.
  // 동적 페이지에서는 이미 className 이 맞게 와 있어 toggle 결과가 동일 → no-op.
  const themeBootstrapScript = `(function(){try{var m=document.cookie.match(/(?:^|; )sh-ui-theme=(dark|light)/);if(m){var c=document.documentElement.classList;c.toggle("dark",m[1]==="dark");c.toggle("light",m[1]==="light");}}catch(e){}})();`;

  return (
    <html lang={locale} className={isDark ? "dark" : "light"}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme={isDark ? "dark" : "light"}>{children}</ThemeProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
