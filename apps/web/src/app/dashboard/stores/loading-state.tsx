'use client';

import { motion } from 'framer-motion';
import { Loader2Icon } from 'lucide-react';

export default function LoadingState() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="size-full flex items-center justify-center text-neutral-400 min-h-[calc(100vh-350px)]"
    >
      <motion.div
        variants={item}
        className="flex flex-col items-center justify-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-neutral-200 shadow-sm"
      >
        <motion.div
          animate={{
            rotate: 360,
            transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
          }}
        >
          <Loader2Icon className="size-10 text-emerald-500" />
        </motion.div>

        <motion.div
          variants={item}
          className="flex flex-col items-center gap-1"
        >
          <motion.p className="text-base font-medium text-neutral-700">
            Memuat Data
          </motion.p>
          <motion.p className="text-sm italic text-neutral-500">
            Tunggu sebentar ya...
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
