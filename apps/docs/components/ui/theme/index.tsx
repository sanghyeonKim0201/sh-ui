"use client";

import * as React from "react";

type Theme = "light" | "dark";

const THEME_COOKIE_NAME = "sh-ui-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/* ───────────── Context ───────────── */

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/** 현재 테마와 setter를 반환한다. ThemeProvider 안에서만 호출 가능. */
export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider.");
  return ctx;
}

/* ───────────── Provider ───────────── */

export interface ThemeProviderProps {
  /**
   * SSR 시 쿠키에서 읽은 초기 테마. 클라이언트 첫 렌더와 SSR 마크업이 일치하도록
   * 서버에서 쿠키를 읽어 주입해야 hydration mismatch가 없다.
   *
   * @default "light"
   * @example
   * // Next.js App Router
   * const t = (await cookies()).get("sh-ui-theme")?.value;
   * <ThemeProvider defaultTheme={t === "dark" ? "dark" : "light"}>
   */
  defaultTheme?: Theme;
  /**
   * 외부에서 테마를 제어할 때 사용. 지정하면 내부 state 대신 이 값이 우선한다.
   * 보통 `defaultTheme` 비제어 모드로 충분.
   */
  theme?: Theme;
  /** 테마 변경 콜백. 제어 모드에서는 이 콜백 안에서 외부 상태를 업데이트해야 한다. */
  onThemeChange?: (theme: Theme) => void;
  children: React.ReactNode;
}

/**
 * 다크/라이트 테마 컨텍스트와 `<html class="dark">` 토글, 쿠키 영속화를 담당하는 Provider.
 * SSR 하이드레이션 시프트를 피하려면 서버에서 쿠키를 읽어 `defaultTheme`로 주입할 것.
 */
export function ThemeProvider({
  defaultTheme = "light",
  theme: themeProp,
  onThemeChange,
  children,
}: ThemeProviderProps) {
  const [_theme, _setTheme] = React.useState<Theme>(defaultTheme);
  const theme = themeProp ?? _theme;

  const setTheme = React.useCallback(
    (next: Theme) => {
      if (onThemeChange) onThemeChange(next);
      else _setTheme(next);

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}`;
      }
    },
    [onThemeChange],
  );

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
