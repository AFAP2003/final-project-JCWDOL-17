'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type AuthEmailContextType = {
  isShowing: boolean;
  setIsShowing: (val: boolean) => void;
};

const AuthEmailContext = createContext<AuthEmailContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const AuthEmailProvider = ({ children }: Props) => {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <AuthEmailContext.Provider value={{ isShowing, setIsShowing }}>
      {children}
    </AuthEmailContext.Provider>
  );
};

// Custom hook for accessing the context safely
export const useAuthEmail = () => {
  const context = useContext(AuthEmailContext);
  if (!context) {
    throw new Error('useAuthEmail must be used within a AuthEmailProvider');
  }
  return context;
};
