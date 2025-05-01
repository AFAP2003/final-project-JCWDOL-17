'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useScrollDirection } from 'react-use-scroll-direction';

type NavbarContextType = {
  isFullNavbar: boolean;
};

const NavbarContext = createContext<NavbarContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const NavbarProvider = ({ children }: Props) => {
  const [isFullNavbar, setIsFullNavbar] = useState(true);
  const { scrollY } = useScroll();
  const { isScrollingUp, isScrollingDown } = useScrollDirection();
  useMotionValueEvent(scrollY, 'change', (val) => {
    if (isScrollingDown && val !== 0) {
      setIsFullNavbar(false);
      return;
    }

    if (isScrollingUp && val <= 220) {
      setIsFullNavbar(true);
      return;
    }
  });

  return (
    <NavbarContext.Provider value={{ isFullNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};

// Custom hook for accessing the context safely
export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
