import { CheckoutProvider } from '@/context/checkout-provider';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: Props) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
