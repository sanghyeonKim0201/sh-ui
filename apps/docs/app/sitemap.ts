import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { examples } from "@/examples";
import { SITE_URL } from "@/lib/seo";

const DOCS_ROOT = join(process.cwd(), "app", "[locale]", "(docs)");

function collectDocRoutes(dir: string, base = ""): string[] {
  const routes: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return routes;
  }

  const hasPage = entries.includes("page.tsx");
  if (hasPage) routes.push(base || "/");

  for (const name of entries) {
    if (name.startsWith("[") || name.startsWith("(")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      routes.push(...collectDocRoutes(full, `${base}/${name}`));
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const docRoutes = collectDocRoutes(DOCS_ROOT);
  const exampleRoutes = examples.map((e) => `/examples/${e.slug}`);
  const allRoutes = Array.from(new Set([...docRoutes, ...exampleRoutes, "/create"]));

  return allRoutes.flatMap((route) => {
    const path = route === "/" ? "" : route;
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
    );

    return routing.locales.map((locale) => {
      const isHome = route === "/";
      const isComponentOrExample =
        route.startsWith("/components/") || route.startsWith("/examples/");

      return {
        url: `${SITE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: (isHome
          ? "weekly"
          : isComponentOrExample
            ? "monthly"
            : "monthly") as "weekly" | "monthly",
        priority: isHome ? 1.0 : isComponentOrExample ? 0.8 : 0.6,
        alternates: { languages },
      };
    });
  });
}
