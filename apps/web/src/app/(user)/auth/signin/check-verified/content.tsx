'use client';

import { Button } from '@/components/ui/button';
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { Session } from '@/lib/types/session';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, MailCheckIcon } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  session: Session | null;
  error: {
    code?: string | undefined;
    message?: string | undefined;
    t?: unknown;
    status: number;
    statusText: string;
  } | null;
};

export default function Content({ session, error }: Props) {
  if (error) {
    toast({
      description:
        'Sorry we have problem in our server. Please try again later!',
      variant: 'destructive',
    });

    redirect('/auth/signin');
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.emailVerified) {
    redirect('/');
  }

  if (!session.user.emailVerified) {
    return <AuthVerification session={session} />;
  }

  return <Loading />;
}

function Loading() {
  return (
    <div className="w-full max-w-xl p-12 rounded-lg sm:rounded-lg text-neutral-700">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-48 h-24">
          <Image
            src="/images/app-logo-black.png"
            alt="App Logo"
            fill
            className="object-contain"
          />
        </div>

        <p className="text-center text-neutral-700 text-sm">
          Mohon tunggu sebentar, kami sedang memproses data anda
        </p>

        <div className="flex justify-center mt-6 space-x-1.5">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
              ease: 'easeInOut',
              delay: 0,
            }}
            className="h-2 w-2 rounded-full bg-neutral-700"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="h-2 w-2 rounded-full bg-neutral-700"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="h-2 w-2 rounded-full bg-neutral-700"
          />
        </div>
      </div>
    </div>
  );
}

function AuthVerification({ session }: { session: Session }) {
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);

  const { mutate: resend, isPending } = useMutation({
    mutationFn: async () => {
      return await apiclient.post('/auth/resend-confirm-email', {
        email: session.user.email,
      });
    },
    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

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
      toast({
        description: `Email was send to ${session.user.email}`,
      });
      restartCooldown();
    },
  });

  useEffect(() => {
    resend();
    restartCooldown();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col gap-2 items-center justify-center rounded-md">
      <div className="size-[48px]">
        <MailCheckIcon size="48px" className="animate-bounce" />
      </div>
      <h2 className="text-xl tracking-[-0.16px]  font-bold">
        Check your email
      </h2>
      <p className="text-center text-sm text-muted-foreground font-normal">
        We just sent a verification link to{' '}
        <span className="font-semibold underline underline-offset-4">
          {session.user.email}
        </span>
        .
      </p>
      <p className="text-center text-sm text-muted-foreground font-normal">
        Didn&apos;t receive the email?
      </p>
      <Button
        onClick={() => resend()}
        disabled={rawCooldownTime > 0 || isPending}
        className="h-[40px]"
      >
        {rawCooldownTime > 0 ? (
          <>
            Resend In <span className="font-mono">{cooldownTime}</span>
          </>
        ) : (
          'Resend Email'
        )}
        <ArrowRight />
      </Button>
    </div>
  );
}
