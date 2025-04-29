import { Bitter, Inter } from 'next/font/google';

export const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontBitter = Bitter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-bitter',
});
