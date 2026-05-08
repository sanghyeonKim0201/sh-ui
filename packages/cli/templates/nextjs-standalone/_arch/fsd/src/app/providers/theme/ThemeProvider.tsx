'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * 다크/라이트 테마 — next-themes ThemeProvider 를 wrap.
 *
 * - `attribute='class'` — `<html class="dark">` 토글 (Tailwind dark variant 와 호환)
 * - `defaultTheme='system'` + `enableSystem` — OS 설정에 자동 동기화. light/dark 만
 *   노출하려면 `enableSystem` 을 false 로
 * - `disableTransitionOnChange` — 토글 순간 transition 깜빡임 차단
 *
 * useTheme 는 next-themes 에서 직접 import: `import { useTheme } from 'next-themes'`
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
