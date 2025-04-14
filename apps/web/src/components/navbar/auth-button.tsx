import Link from 'next/link';
import { Button } from '../ui/button';

export default function AuthButton() {
  return (
    <div>
      <div className="flex gap-4 h-full size-full">
        <Link href={'/auth/signin'} passHref>
          <Button
            className="border-primary border "
            variant={'ghost'}
            size={'default'}
          >
            Sign In
          </Button>
        </Link>
        <Link href={'/auth/signup'} passHref>
          <Button className="" size={'default'}>
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
