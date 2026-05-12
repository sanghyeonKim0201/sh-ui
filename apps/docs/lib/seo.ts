import { routing } from "@/i18n/routing";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://sh-ui.dev"
).replace(/\/$/, "");

export const SITE_NAME = "sh-ui";

export const TWITTER_HANDLE = "@sanghyeonKim0201";

type AlternateLanguages = Record<string, string> & { "x-default": string };

export function localizedAlternates(path: string): {
  canonical: string;
  languages: AlternateLanguages;
} {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${clean}`])
  ) as Record<string, string>;
  return {
    canonical: `${SITE_URL}/${routing.defaultLocale}${clean}`,
    languages: {
      ...languages,
      "x-default": `${SITE_URL}/${routing.defaultLocale}${clean}`,
    },
  };
}

export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}
