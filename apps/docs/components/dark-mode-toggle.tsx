"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("chrome");
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("darkModeToggle")}
      aria-pressed={isDark}
    >
      {isDark ? "☀" : "🌙"}
    </Button>
  );
}
