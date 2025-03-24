'use client';

import { readStorage } from '@/lib/session-storage';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export type SignupContextValue = {
  data: { email: string; expiredAt: string } | null;
  setData: Dispatch<
    SetStateAction<{ email: string; expiredAt: string } | null>
  >;
};

const SignupContext = createContext<SignupContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export default function SignupProvider({ children }: Props) {
  const [hasPendingEmail, setHasPendingEmail] = useState<{
    email: string;
    expiredAt: string;
  } | null>(() => {
    const data = readStorage<{ email: string; expiredAt: string } | null>({
      key: 'signup-pending',
    });
    return data;
  });

  return (
    <SignupContext.Provider
      value={{
        data: hasPendingEmail,
        setData: setHasPendingEmail,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignupContext() {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignupContext must be used within an SignupProvider');
  }
  return context;
}
