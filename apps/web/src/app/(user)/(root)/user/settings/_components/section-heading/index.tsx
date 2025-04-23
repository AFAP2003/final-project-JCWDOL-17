import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function SectionHeading({ children }: Props) {
  return (
    <h3 className="text-xl font-semibold mb-8 text-neutral-800">{children}</h3>
  );
}
