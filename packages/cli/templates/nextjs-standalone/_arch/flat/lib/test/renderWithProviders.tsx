import type { ComponentType, ReactElement, ReactNode } from 'react';

import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

import { createTestQueryClient } from './createTestQueryClient';

type Options = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
  /**
   * 외부 Provider 가 필요할 때 (예: next-intl 활성 프로젝트에서
   * `NextIntlClientProvider`) 사용. ThemeProvider 안쪽 / QueryClientProvider 바깥에 wrap.
   */
  extraWrapper?: ComponentType<{ children: ReactNode }>;
};

type Result = RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
  queryClient: QueryClient;
};

/**
 * RTL render + ThemeProvider + QueryClientProvider + userEvent setup 한 번에.
 *
 * next-intl 프로젝트에서 `useTranslations` 사용 컴포넌트 테스트 시:
 *
 *   const Intl = ({ children }) => (
 *     <NextIntlClientProvider locale='ko' messages={ko}>
 *       {children}
 *     </NextIntlClientProvider>
 *   );
 *   renderWithProviders(<MyComponent />, { extraWrapper: Intl });
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: Options = {},
): Result => {
  const {
    queryClient = createTestQueryClient(),
    extraWrapper: Extra,
    ...rtlOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const inner = (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return (
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
        {Extra ? <Extra>{inner}</Extra> : inner}
      </ThemeProvider>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...rtlOptions });
  const user = userEvent.setup();

  return { ...result, user, queryClient };
};
