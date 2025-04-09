'use client';

import { Icons } from '@/components/icons';
import { useActiveSession } from '@/hooks/use-active-session';
import { useMutation } from '@tanstack/react-query';
import EmailVerification from './email-verification';

type Props = Pick<ReturnType<typeof useActiveSession>, 'current' | 'sessions'>;

export default function LoginActivity({ current, sessions }: Props) {
  const { mutate: resend, isPending } = useMutation({
    mutationFn: async () => {
      // request forgot password
    },
  });

  return (
    <>
      <EmailVerification
        show={true}
        disabled={false}
        email={current?.user.email || ''}
        resend={() => {}}
      />

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-6 text-neutral-700">
          Login Activity
        </h3>

        <div className="flex items-center max-w-md text-sm gap-2">
          <Icons.Lamp className="size-20" />
          <p className="text-neutral-500">
            If there is any unfamiliar activity, immediately click &quot;Sign
            Out&quot; and{' '}
            <span className="underline underline-offset-4 cursor-pointer text-green-500 hover:text-yellow-500">
              change your password
            </span>
            .
          </p>
        </div>
      </div>
    </>
  );
}
