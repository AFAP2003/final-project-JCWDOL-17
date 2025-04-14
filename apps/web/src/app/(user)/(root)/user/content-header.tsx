import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ContentHeader({ children }: Props) {
  return (
    <div className="p-2 text-2xl font-semibold h-[72px] flex w-full items-center">
      {children}
    </div>
  );
}
