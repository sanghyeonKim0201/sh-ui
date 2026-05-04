export const dynamic = "force-static";

import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("landing");

  return (
    <main className="container">
      <h1>{t("title")}</h1>
      <p className="muted">
        {t.rich("tagline", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", margin: "1.5rem 0 2rem" }}>
        <Link href="/getting-started" style={{ textDecoration: "none" }}>
          <Button size="lg">{t("ctaPrimary")}</Button>
        </Link>
        <Link href="/components/button" style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="lg">{t("ctaSecondary")}</Button>
        </Link>
      </div>

      <h2>{t("philosophyHeading")}</h2>
      <ul>
        <li>
          {t.rich("philosophy.ownership", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </li>
        <li>
          {t.rich("philosophy.tokens", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </li>
        <li>
          {t.rich("philosophy.config", {
            strong: (chunks) => <strong>{chunks}</strong>,
            code: (chunks) => <code>{chunks}</code>,
          })}
        </li>
      </ul>

      <h2>{t("platformsHeading")}</h2>
      <ul>
        <li>{t("platforms.react")}</li>
        <li>{t("platforms.flutter")}</li>
        <li>{t("platforms.more")}</li>
      </ul>
    </main>
  );
}
