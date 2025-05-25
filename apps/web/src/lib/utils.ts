import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function genRandomString() {
  return uuidv4().replace(/-/g, '').substring(0, 25);
}

export function toISO(d?: string) {
  return d ? new Date(d).toISOString() : null;
}

export function getImageUrl(filepath: string) {
  if (filepath.startsWith('http')) {
    return filepath;
  }

  if (filepath.startsWith('/')) {
    return filepath;
  }

  return `/${filepath}`;
}
