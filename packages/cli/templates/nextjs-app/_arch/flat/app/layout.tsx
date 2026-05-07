import type { Metadata } from 'next';
import '@workspace/ui-app-name/globals.css';
import { RootLayout } from '@/components/layouts/RootLayout';

export const metadata: Metadata = {
  title: 'sh-ui app',
  description: 'sh-ui 기반 앱 — metadata 를 변경하세요.',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayout>{children}</RootLayout>;
}
