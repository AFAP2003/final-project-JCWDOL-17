'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="size-full flex items-center justify-center text-neutral-400 min-h-[calc(100vh-350px)]"
    >
      <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto p-8 bg-white/80 backdrop-blur-sm rounded-xl border border-red-100 shadow-sm">
        <div className="p-3 bg-red-50 rounded-full text-red-500 animate-pulse">
          <AlertTriangle className="size-10" />
        </div>

        <div className="flex flex-col w-full justify-center items-center gap-1 text-center">
          <h3 className="text-lg font-medium text-neutral-800">
            😓 Terjadi Kesalahan
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Gagal memuat data toko
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Silakan coba lagi nanti atau hubungi administrator.
          </p>
        </div>

        <Button
          variant="default"
          className="mt-2 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={onRetry}
        >
          Coba Lagi
        </Button>
      </div>
    </motion.div>
  );
}
