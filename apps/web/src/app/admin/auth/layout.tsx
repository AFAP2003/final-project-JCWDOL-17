import MaxWidthWrapper from '@/components/max-width-wrapper';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
  return (
    <div>
      <MaxWidthWrapper className="min-h-screen max-w-5xl flex flex-col items-center justify-center">
        {children}
      </MaxWidthWrapper>
    </div>
  );
}
