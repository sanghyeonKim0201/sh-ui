import type { Metadata } from 'next';
import '@workspace/ui-app-name/globals.css';
import { RootLayout } from '@/components/layouts/RootLayout';

export const metadata: Metadata = {
  title: 'App Name',
  description: 'App Description',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayout>{children}</RootLayout>;
}
