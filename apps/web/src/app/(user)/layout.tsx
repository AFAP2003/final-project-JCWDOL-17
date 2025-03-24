import SignupConfirmationPopup from '@/components/signup-confirmation-popup';
import SignupProvider from '@/context/signup-provider';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserLayout({ children }: Props) {
  return (
    <SignupProvider>
      <main>
        <SignupConfirmationPopup />
        {children}
      </main>
    </SignupProvider>
  );
}
