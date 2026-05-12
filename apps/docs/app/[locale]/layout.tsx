import "../globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toast";
import { routing } from "@/i18n/routing";
import {
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  localizedAlternates,
} from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const description = t("siteDescription");
  const alternates = localizedAlternates("/");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s — ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: [
      "sh-ui",
      "design system",
      "React",
      "Flutter",
      "Next.js",
      "Base UI",
      "shadcn",
      "component library",
      "design tokens",
      "디자인 시스템",
    ],
    authors: [{ name: "Sanghyeon Kim", url: "https://github.com/sanghyeonKim0201" }],
    creator: "Sanghyeon Kim",
    publisher: "Sanghyeon Kim",
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: alternates.languages,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description,
      url: `${SITE_URL}/${locale}`,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === "ko" ? "ko_KR" : "en_US")),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
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
  const messages = await getMessages();

  const t = await getTranslations({ locale, namespace: "common" });
  const description = t("siteDescription");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/${locale}`,
        name: SITE_NAME,
        description,
        inLanguage: locale === "ko" ? "ko-KR" : "en-US",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Sanghyeon Kim",
        url: "https://github.com/sanghyeonKim0201",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        description,
        url: SITE_URL,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": `${SITE_URL}/#person` },
        programmingLanguage: ["TypeScript", "Dart"],
        downloadUrl: "https://www.npmjs.com/package/sh-ui-cli",
        softwareHelp: `${SITE_URL}/${locale}/getting-started`,
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
