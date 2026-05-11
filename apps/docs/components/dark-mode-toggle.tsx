"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("chrome");
  // SSR 단계에서는 실제 테마를 알 수 없으므로 hydration 후에만 실제 아이콘을 그린다.
  // 미스매치 → 트리 재생성 → inline RSC <script> 재방문으로 인한 경고를 동시에 차단.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("darkModeToggle")}
      aria-pressed={mounted ? isDark : undefined}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{mounted ? (isDark ? "☀" : "🌙") : "🌙"}</span>
    </Button>
  );
}
