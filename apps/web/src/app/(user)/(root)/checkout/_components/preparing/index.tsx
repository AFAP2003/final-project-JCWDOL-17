'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  onComplete?: () => void;
};

export default function Preparing({ onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { message: 'Memeriksa ketersediaan stok...', icon: Package },
    { message: 'Menghubungi toko terdekat...', icon: Store },
    { message: 'Mempersiapkan pengiriman...', icon: Truck },
  ];

  // Rotate through messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const StepIcon = steps[stepIndex].icon;
  const message = steps[stepIndex].message;

  return (
    <>
      <div style={{ height: 'calc(100vh - 220px)' }}></div>
      <Dialog open={true}>
        <DialogContent
          closeClass="hidden"
          className="w-full max-w-xl p-12 rounded-lg sm:rounded-lg bg-neutral-800 text-neutral-200 border-neutral-500 focus:outline-none"
        >
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-24 mb-6">
              <Image
                src="/images/app-logo-white.png"
                alt="App Logo"
                fill
                className="object-contain"
              />
              <div className="bg-neutral-700/5 rounded-lg absolute inset-0 top-0"></div>
            </div>

            <div className="h-8 flex items-center justify-center mb-3 text-neutral-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center font-medium flex items-center justify-center gap-3"
                >
                  {<StepIcon className="w-6 h-6" />} {message}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="text-center text-neutral-200 text-sm">
              Mohon tunggu sebentar, kami sedang memproses pesanan Anda
            </p>

            <div className="flex justify-center mt-6 space-x-1.5">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                  ease: 'easeInOut',
                  delay: 0,
                }}
                className="h-2 w-2 rounded-full bg-neutral-200"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="h-2 w-2 rounded-full bg-neutral-200"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="h-2 w-2 rounded-full bg-neutral-200"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
