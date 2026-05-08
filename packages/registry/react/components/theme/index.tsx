"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

type Theme = "light" | "dark";

/* ───────────── Context ───────────── */

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/**
 * 현재 테마와 setter 를 반환한다. ThemeProvider (또는 next-themes 의
 * ThemeProvider) 안에서만 호출 가능.
 *
 * 내부적으로 next-themes 의 useTheme 를 어댑팅 — `resolvedTheme` 을
 * `light`/`dark` 로 좁혀 노출하고, system 모드는 감추는 형태.
 */
export function useTheme(): ThemeContextValue {
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();
  const theme: Theme = resolvedTheme === "dark" ? "dark" : "light";

  const setTheme = React.useCallback(
    (next: Theme) => setNextTheme(next),
    [setNextTheme],
  );
  const toggleTheme = React.useCallback(
    () => setNextTheme(theme === "dark" ? "light" : "dark"),
    [setNextTheme, theme],
  );

  return React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );
}

/* ───────────── Provider ───────────── */

export interface ThemeProviderProps {
  /**
   * 비제어 모드의 초기 테마. next-themes 가 storage(localStorage) 에 저장된
   * 값을 우선하므로, 사용자가 한 번 선택한 후에는 이 값이 무시된다.
   *
   * @default "light"
   */
  defaultTheme?: Theme;
  /**
   * 제어 모드 — 지정 시 강제 테마로 고정 (next-themes `forcedTheme`).
   * 보통 `defaultTheme` 비제어로 충분.
   */
  theme?: Theme;
  /**
   * 테마 변경 콜백. next-themes 자체는 setter 호출 시 콜백을 노출하지 않으므로
   * 내부 effect 로 변화를 감지해 호출한다.
   */
  onThemeChange?: (theme: Theme) => void;
  children: React.ReactNode;
}

/**
 * 다크/라이트 테마와 `<html class="dark">` 토글을 담당하는 Provider 어댑터.
 *
 * 내부 구현은 next-themes — `attribute='class'`, `enableSystem={false}`,
 * `disableTransitionOnChange` 로 고정. SSR/hydration mismatch 방지를 위해
 * `<html suppressHydrationWarning>` 을 RootLayout 에 함께 둘 것.
 */
export function ThemeProvider({
  defaultTheme = "light",
  theme,
  onThemeChange,
  children,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme={theme}
      themes={["light", "dark"]}
    >
      {onThemeChange ? <ThemeChangeBridge onThemeChange={onThemeChange} /> : null}
      {children}
    </NextThemesProvider>
  );
}

function ThemeChangeBridge({
  onThemeChange,
}: {
  onThemeChange: (theme: Theme) => void;
}) {
  const { theme } = useTheme();
  const last = React.useRef<Theme | null>(null);
  React.useEffect(() => {
    if (last.current === theme) return;
    last.current = theme;
    onThemeChange(theme);
  }, [theme, onThemeChange]);
  return null;
}
