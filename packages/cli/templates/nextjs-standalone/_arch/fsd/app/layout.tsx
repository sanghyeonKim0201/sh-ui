import type { Metadata } from 'next';
import { RootLayout } from '@/src/app/layouts/RootLayout';
import './globals.css';

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
