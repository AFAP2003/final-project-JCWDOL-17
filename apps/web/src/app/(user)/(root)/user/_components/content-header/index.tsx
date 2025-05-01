import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function ContentHeader({ children }: Props) {
  return (
    <div className="text-2xl font-semibold text-neutral-800">{children}</div>
  );
}
