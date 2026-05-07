import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { QueryClientProvider } from '../tanstack/QueryClientProvider';
import { TanstackDevtoolsProvider } from '../tanstack/TanstackDevtoolsProvider';
import { ThemeProvider } from '../theme/ThemeProvider';

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider>
        <TanstackDevtoolsProvider>
          <Toaster />
          {children}
        </TanstackDevtoolsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
