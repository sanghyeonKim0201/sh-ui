import type { ReactNode } from 'react';

import {
  dehydrate,
  type FetchQueryOptions,
  HydrationBoundary,
} from '@tanstack/react-query';

import { getQueryClient } from '@/src/shared/lib/getQueryClient';

export type FetchOptions = Pick<FetchQueryOptions, 'queryKey' | 'queryFn'>;

type Props = {
  fetchOptions?: FetchOptions[] | FetchOptions | null;
  children: ReactNode;
};

/**
 * RSC 에서 prefetch 를 끝낸 뒤 dehydrated state 로 클라이언트에 hydrate.
 * 단일/배열 둘 다 받는다.
 */
export async function PrefetchBoundary({ fetchOptions, children }: Props) {
  const queryClient = getQueryClient();

  if (fetchOptions) {
    const list = Array.isArray(fetchOptions) ? fetchOptions : [fetchOptions];
    await Promise.all(list.map((opt) => queryClient.prefetchQuery(opt)));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
