"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("chrome");
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={t("darkModeToggle")}
      aria-pressed={isDark}
    >
      {isDark ? "☀" : "🌙"}
    </Button>
  );
}
