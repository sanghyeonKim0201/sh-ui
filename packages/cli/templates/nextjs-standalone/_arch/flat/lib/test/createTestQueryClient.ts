import { QueryClient } from '@tanstack/react-query';

/**
 * 테스트 전용 QueryClient — retry/refetch 끄고 gcTime 0 으로 격리.
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
