import Link from 'next/link';

export default async function Landing() {
  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center">
      <h1 className="text-4xl font-bold">Landing</h1>
      <div className="flex flex-col gap-4">
        <Link href={'/auth/signin'}>Go To User Signin</Link>
        <Link href={'/auth/signup'}>Go To User Signup</Link>
        <Link href={'/private/client'}>Go To User Private Page Client</Link>
        <Link href={'/private/server'}>Go To User Private Page Server</Link>
        <Link href={'/admin/auth/signin'}>Go To Admin Signin</Link>
      </div>
    </div>
  );
}
