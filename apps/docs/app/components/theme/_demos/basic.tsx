"use client";

import { useTheme } from "@/components/ui/theme";
import { Button } from "@/components/ui/button";

export function ThemeBasicDemo() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Button onClick={toggleTheme}>
        {theme === "dark" ? "☀ 라이트 모드로" : "🌙 다크 모드로"}
      </Button>
      <span className="muted">현재: {theme}</span>
    </div>
  );
}
