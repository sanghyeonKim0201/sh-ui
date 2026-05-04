import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { QueryClientProvider } from '../tanstack/QueryClientProvider';
import { TanstackDevtoolsProvider } from '../tanstack/TanstackDevtoolsProvider';
import { ThemeProviders } from '../theme/ThemeProviders';

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <ThemeProviders>
      <QueryClientProvider>
        <TanstackDevtoolsProvider>
          <Toaster />
          {children}
        </TanstackDevtoolsProvider>
      </QueryClientProvider>
    </ThemeProviders>
  );
}
