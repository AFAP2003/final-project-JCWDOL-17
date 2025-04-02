'use client';

import { queryclient } from '@/lib/tanstack-query';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryclient}>{children}</QueryClientProvider>
  );
}
