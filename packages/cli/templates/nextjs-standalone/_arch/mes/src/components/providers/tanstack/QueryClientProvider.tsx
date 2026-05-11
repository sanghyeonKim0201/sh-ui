'use client';

import { QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getBrowserQueryClient } from '@/lib/api/queryClient';

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <TanstackQueryClientProvider client={getBrowserQueryClient()}>
      {children}
    </TanstackQueryClientProvider>
  );
}
