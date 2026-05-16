import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'theme';

function subscribeSystemTheme(onChange: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system';
  });

  // 시스템 테마는 외부 스토어(matchMedia) — useSyncExternalStore 로 구독해
  // effect 안에서 setState 하지 않는다 (React 19 set-state-in-effect 회피).
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    () => 'light' as const,
  );

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
