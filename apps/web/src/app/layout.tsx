import type { Metadata } from 'next';
import { fontInter } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: '',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fontInter.variable} antialiased font-inter`}>
        {children}
      </body>
    </html>
  );
}
