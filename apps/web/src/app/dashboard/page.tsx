import { getSessionServer } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function DashboardRedirect() {
  const { data, error } = await getSessionServer();
  if (error) {
    console.log(`Error get session: ${error}`);
    redirect('/admin/auth/signin');
  }

  if (!data?.user) {
    redirect('/admin/auth/signin');
  }

  if (data.user.role === 'ADMIN') {
    redirect('/dashboard/products');
  }

  redirect('/dashboard/users');
}
