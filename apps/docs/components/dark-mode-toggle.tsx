"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label="다크 모드 토글"
      aria-pressed={isDark}
    >
      {isDark ? "☀" : "🌙"}
    </Button>
  );
}
