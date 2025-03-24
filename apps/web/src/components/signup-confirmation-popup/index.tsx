'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSignupContext } from '@/context/signup-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { removeStorage } from '@/lib/session-storage';
import type { SignupResendResponse } from '@/types/signup-resend-response';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import MaxWidthWrapper from '../max-width-wrapper';

export default function SignupConfirmationPopup() {
  const isClient = useIsClient();
  const { data, setData } = useSignupContext();

  const COOLDOWN_DURATION = 120; // 2 minutes in seconds
  const [cooldownTime, setCooldownTime] = useState(COOLDOWN_DURATION);

  const { mutate: resend, isPending } = useMutation({
    mutationFn: async () => {
      const { data: result } = await apiclient.post(
        '/auth/signup/basic/resend',
        {
          email: data?.email,
        },
      );
      return result as SignupResendResponse;
    },
    onSuccess: () => {
      toast({
        title: 'Resend Email',
        description: `Success resending confirmation email to ${data?.email}`,
      });
      // Start cooldown timer
      setCooldownTime(COOLDOWN_DURATION);
    },

    onError: (error: AxiosError) => {
      if (error.status! === 500) {
        toast({
          title: 'Server Error',
          description:
            'Sorry we have problem in our server, please try again later',
          variant: 'destructive',
        });
      } else {
        setData(null);
        removeStorage('signup-pending');
        toast({
          title: 'Resend Email',
          description: 'This link is no longer valid, please signup again!',
          variant: 'destructive',
        });
      }
    },
  });

  // Timer effect to count down
  useEffect(() => {
    if (cooldownTime <= 0) return;

    const timer = setInterval(() => {
      setCooldownTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownTime]);

  // Format the remaining time as mm:ss
  const formatRemainingTime = () => {
    const minutes = Math.floor(cooldownTime / 60);
    const seconds = cooldownTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isClient || !data) return null;

  return (
    <MaxWidthWrapper className="relative flex justify-center items-center">
      <div className="absolute top-0 w-full max-w-3xl my-20 max-lg:px-8 z-10">
        <Alert className="relative border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50 p-6 shadow-lg rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-6 w-6 rounded-full text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900"
            onClick={() => {
              setData(null);
              removeStorage('signup-pending');
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500" />
            <div>
              <AlertTitle className="text-lg font-semibold text-green-800 dark:text-green-400">
                Signup Confirmation!
              </AlertTitle>
              <AlertDescription className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  Thank you for signing up! A confirmation email has been sent
                  to <strong>{data.email}</strong>.
                </p>
                <p className="mt-2">
                  Didn&apos;t receive the email?{' '}
                  {cooldownTime > 0 ? (
                    <span className="font-medium">
                      Resend available in {formatRemainingTime()}
                    </span>
                  ) : (
                    <button
                      disabled={isPending}
                      onClick={() => resend()}
                      className="font-medium text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100 underline"
                    >
                      Click here
                    </button>
                  )}{' '}
                  {cooldownTime > 0 ? '' : 'to resend.'}
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </div>
    </MaxWidthWrapper>
  );
}
