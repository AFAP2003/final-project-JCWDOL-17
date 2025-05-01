'use client';

import Lenis from 'lenis';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
};

export default function LocoScroll({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleWheel = (e: WheelEvent) => {
      const isInsideHorizontal = (e.target as HTMLElement)?.closest(
        '.horizontal-scroll',
      );

      if (isInsideHorizontal && e.shiftKey) {
        lenis.stop();

        // Resume scrolling after user stops wheel input for 300ms
        clearTimeout((handleWheel as any)._timeout);
        (handleWheel as any)._timeout = setTimeout(() => {
          lenis.start();
        }, 300);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
