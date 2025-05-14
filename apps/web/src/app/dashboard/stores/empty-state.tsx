'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  hasQuery: boolean;
}

export default function EmptyState({ hasQuery }: EmptyStateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="size-full flex items-center justify-center text-neutral-400 min-h-[calc(100vh-350px)]"
    >
      <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200 shadow-sm">
        <div className="p-4 bg-neutral-50 rounded-full">
          {hasQuery ? (
            <Search className="size-12 text-neutral-300" />
          ) : (
            <Store className="size-12 text-neutral-300" />
          )}
        </div>

        <div className="flex flex-col w-full justify-center items-center gap-1 text-center">
          <h3 className="text-lg font-medium text-neutral-800">🫢 Oops!</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Tidak ada toko yang ditemukan
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {hasQuery
              ? 'Coba periksa kembali atau gunakan kata kunci lain.'
              : 'Belum ada toko yang terdaftar. Silakan buat toko baru.'}
          </p>
        </div>

        {hasQuery ? (
          <Button
            variant="outline"
            className="mt-2 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300"
            onClick={() => router.push('/dashboard/stores')}
          >
            Tampilkan Semua Toko
          </Button>
        ) : (
          <Button
            variant="default"
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105"
            onClick={() => router.push('/dashboard/stores/create')}
          >
            Buat Toko Baru
          </Button>
        )}
      </div>
    </motion.div>
  );
}
