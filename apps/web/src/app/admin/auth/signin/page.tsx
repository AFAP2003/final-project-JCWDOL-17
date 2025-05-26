import { redirect } from 'next/navigation';
import SigninForm from './form';

type Props = {
  searchParams: {
    role?: string;
  };
};

export default function SigninPage({ searchParams }: Props) {
  if (searchParams.role !== 'ADMIN' && searchParams.role !== 'SUPER') {
    redirect('/admin/auth/signin?role=ADMIN');
  }
  const role =
    searchParams?.role === 'ADMIN' || searchParams?.role === 'SUPER'
      ? searchParams.role
      : 'ADMIN';

  return (
    <div className="size-full">
      <SigninForm role={role} />
    </div>
  );
}
