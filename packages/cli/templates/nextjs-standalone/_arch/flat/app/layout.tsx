import type { Metadata } from 'next';
import { RootLayout } from '@/components/layouts/RootLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'My App Description',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayout>{children}</RootLayout>;
}
