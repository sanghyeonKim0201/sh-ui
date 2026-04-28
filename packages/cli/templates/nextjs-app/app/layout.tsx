import type { Metadata } from 'next';
import '@workspace/ui-app-name/globals.css';
import { GlobalProvider } from '@/src/app/providers';

export const metadata: Metadata = {
  title: 'App Name',
  description: 'App Description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
