import { Toaster } from '@/components/ui/toaster';
import QueryProvider from '@/context/query-provider';
import type { Metadata } from 'next';
import { fontBitter, fontInter } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Next App',
  description: 'A Next.js application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fontInter.variable} ${fontBitter.variable} antialiased font-inter`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
