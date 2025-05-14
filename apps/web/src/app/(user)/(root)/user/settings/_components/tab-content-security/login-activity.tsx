'use client';

import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { parseUserAgent } from '@/lib/parse-user-agent';
import { GetAllSessionResponse } from '@/lib/types/get-all-session-response';
import { Session } from '@/lib/types/session';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';
import EmailVerification from '../email-verification';
import SectionHeading from '../section-heading';
import LoginActivitySkeleton from './login-activiy-skeleton';

type Props = {
  current: Session | null;
};

export default function LoginActivity({ current }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);

  const {
    data: sessions,
    refetch: refetchSession,
    isPending,
  } = useQuery({
    queryKey: ['user/settings', 'list-session'],
    queryFn: async () => {
      const { data } = await apiclient.get('/auth/sessions');
      return data as GetAllSessionResponse;
    },
  });

  const { mutate: resetPassword, isPending: resetPasswordPending } =
    useMutation({
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
          description: `Email was sent to ${current?.user.email}`,
        });
        restartCooldown();
      },
    });

  const { mutate: revokeSession } = useMutation({
    mutationFn: async (sessionToken: string) => {
      return await apiclient.post('/auth/sessions/revoke', { sessionToken });
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

  if (isPending) {
    return <LoginActivitySkeleton />;
  }

  return (
    <>
      <EmailVerification
        show={isSubmitted}
        disabled={resetPasswordPending}
        email={current?.user.email || ''}
        resend={() => resetPassword()}
        cooldownTime={cooldownTime}
        rawCooldownTime={rawCooldownTime}
      />

      <div className="mb-12 w-full">
        <SectionHeading>Login Activity</SectionHeading>

        <div className="flex items-start sm:items-center text-sm gap-3 mb-6 flex-col sm:flex-row">
          <Lightbulb className="size-6 text-red-500 shrink-0" />
          <p className="text-neutral-500 max-w-xl leading-snug">
            If there is any unfamiliar activity, immediately click{' '}
            <span className="font-semibold">&quot;Sign Out&quot;</span> and{' '}
            <span
              onClick={() => resetPassword()}
              className="underline underline-offset-4 cursor-pointer text-red-500 hover:text-red-600"
            >
              change your password
            </span>
            .
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4 sm:p-6 border shadow-sm divide-y divide-neutral-200">
          {sessions?.map((session) => {
            const ua = parseUserAgent(session.userAgent, session.createdAt);
            const isCurrentSession = session.id === current?.session.id;

            return (
              <div key={session.id} className="py-4 px-2 sm:px-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                  <div className="flex gap-4 items-center w-full max-w-full">
                    <ua.icon className="size-10 text-neutral-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {ua.browser} at {ua.os}
                      </p>
                      <p className="text-xs text-neutral-500">{ua.timeAgo}</p>
                    </div>
                  </div>

                  {isCurrentSession ? (
                    <span className="text-xs font-semibold bg-green-700 text-white rounded-full px-2 py-0.5">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => revokeSession(session.token)}
                      className="text-xs font-medium text-red-500 hover:underline underline-offset-4 transition-colors"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
