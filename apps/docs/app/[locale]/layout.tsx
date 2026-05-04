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
    // force-static 페이지에서는 cookies() 사용 불가
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={isDark ? "dark" : ""}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider defaultTheme={isDark ? "dark" : "light"}>{children}</ThemeProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
