'use client';

import { cn } from '@/lib/utils';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  containerClass?: string;
}

export default function HorizontalScroll({ children, containerClass }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Our main x motion value
  const x = useMotionValue(0);
  // Constrain x so that we don’t scroll past the content
  const constrainedX = useTransform(x, (value) =>
    Math.min(0, Math.max(value, -contentWidth + containerWidth)),
  );

  useEffect(() => {
    const updateWidths = () => {
      if (containerRef.current && contentRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContentWidth(contentRef.current.scrollWidth);
      }
    };

    updateWidths();
    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        // Cancel any ongoing animation from dragging (if any)
        x.stop();

        // Use full deltaY for scrolling
        const scrollAmount = e.deltaY;
        const newX = Math.min(
          0,
          Math.max(x.get() - scrollAmount, -contentWidth + containerWidth),
        );

        // Animate the scroll with a spring for a responsive feel.
        animate(x, newX, { type: 'spring', damping: 60, stiffness: 1500 });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [x, contentWidth, containerWidth]);

  return (
    <div
      ref={containerRef}
      className={cn('horizontal-scroll overflow-hidden w-full', containerClass)}
    >
      <motion.div
        ref={contentRef}
        drag="x"
        dragConstraints={{ left: -contentWidth + containerWidth, right: 0 }}
        dragMomentum={false} // Disable built-in drag inertia
        style={{ x: constrainedX }}
        className="inline-flex cursor-grab active:cursor-grabbing py-4"
      >
        {children}
      </motion.div>
    </div>
  );
}
