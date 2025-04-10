'use client';

import { Separator } from '@/components/ui/separator';
import { useActiveSession } from '@/hooks/use-active-session';
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { parseUserAgent } from '@/lib/parse-user-agent';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';
import EmailVerification from './email-verification';

type Props = Pick<
  ReturnType<typeof useActiveSession>,
  'current' | 'sessions' | 'refetch'
>;

export default function LoginActivity({
  current,
  sessions,
  refetch: refetchSession,
}: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async () => {
      return await apiclient.post('/auth/forgot-password', {
        email: current?.user.email,
      });
    },

    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (
        error.status === 400 &&
        message.startsWith('This account is not linked to credential method')
      ) {
        toast({
          description:
            'Please set your password first to link your account with credential',
          variant: 'destructive',
        });
        return;
      }

      if (error.status! === 400 && message?.startsWith('Too many request')) {
        toast({
          description: 'Too many request, please try again later!',
          variant: 'destructive',
        });
        return;
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        description: `Email was send to ${current?.user.email}`,
      });
      restartCooldown();
    },
  });

  const { mutate: revokeSession } = useMutation({
    mutationFn: async (sessionToken: string) => {
      return await apiclient.post('/auth/sessions/revoke', {
        sessionToken,
      });
    },

    onError: () => {
      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: async () => {
      await refetchSession();
    },
  });

  return (
    <>
      <EmailVerification
        show={isSubmitted}
        disabled={isPending}
        email={current?.user.email || ''}
        resend={() => resetPassword()}
        cooldownTime={cooldownTime}
        rawCooldownTime={rawCooldownTime}
      />

      <div className="mb-12 w-full">
        <h3 className="text-xl font-semibold mb-8 text-neutral-700">
          Login Activity
        </h3>

        <div className="flex items-center text-sm gap-3 mb-6">
          <Lightbulb className="size-6 text-yellow-500" />
          <p className="text-neutral-500">
            If there is any unfamiliar activity, immediately click &quot;Sign
            Out&quot; and{' '}
            <span
              onClick={() => resetPassword()}
              className="underline underline-offset-4 cursor-pointer text-green-500 hover:text-yellow-500"
            >
              change your password
            </span>
            .
          </p>
        </div>

        <div className="">
          {sessions?.map((session) => {
            const ua = parseUserAgent(session.userAgent, session.createdAt);
            return (
              <div key={session.id}>
                <div className="flex justify-between items-center px-8">
                  <div className="flex gap-3 items-center">
                    <ua.icon className="size-12 text-green-500" />
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-neutral-700">
                        {ua.browser} at {ua.os}
                      </p>
                      <p className="text-xs text-neutral-500 mb-1">
                        {ua.timeAgo}
                      </p>
                    </div>
                  </div>

                  {session.id === current?.session.id ? (
                    <div className="text-xs font-semibold bg-green-500 text-neutral-100 rounded-full text-center w-fit px-2 py-0.5">
                      Active
                    </div>
                  ) : (
                    <div
                      onClick={() => revokeSession(session.token)}
                      className="text-xs font-semibold text-green-500 hover:underline cursor-pointer underline-offset-4"
                    >
                      Sign Out
                    </div>
                  )}
                </div>
                <Separator orientation="horizontal" className="my-4" />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
