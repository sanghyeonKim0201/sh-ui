import type { ReactElement, ReactNode } from 'react';

import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createTestQueryClient } from './createTestQueryClient';

type Options = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
};

type Result = RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
  queryClient: QueryClient;
};

/**
 * RTL render + QueryClientProvider + userEvent setup 한 번에.
 * 추가 Provider 가 필요하면 이 파일을 직접 수정하거나 wrapper 옵션을 쓴다.
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: Options = {},
): Result => {
  const { queryClient = createTestQueryClient(), ...rtlOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const result = render(ui, { wrapper: Wrapper, ...rtlOptions });
  const user = userEvent.setup();

  return { ...result, user, queryClient };
};
