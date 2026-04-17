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

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider.");
  return ctx;
}

/* ───────────── Provider ───────────── */

export interface ThemeProviderProps {
  /** SSR 시 쿠키에서 읽은 초기 테마.
   *  예(Next.js):
   *    const t = (await cookies()).get("sh-ui-theme")?.value;
   *    <ThemeProvider defaultTheme={t === "dark" ? "dark" : "light"}>
   */
  defaultTheme?: Theme;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  children: React.ReactNode;
}

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
