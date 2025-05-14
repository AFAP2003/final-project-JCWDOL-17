'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, MailCheckIcon } from 'lucide-react';

type Props = {
  show: boolean;
  email: string;
  resend: (email: string) => void;
  disabled: boolean;
  cooldownTime: string;
  rawCooldownTime: number;
};

export default function EmailVerification({
  show,
  email,
  resend,
  disabled,
  cooldownTime,
  rawCooldownTime,
}: Props) {
  if (!show) return null;

  return (
    <div className="fixed left-0 top-0 bg-white size-full z-50 flex flex-col gap-2 items-center justify-center rounded-md">
      <div className="size-[48px]">
        <MailCheckIcon
          size="48px"
          className="animate-bounce text-neutral-500"
        />
      </div>
      <h2 className="text-xl tracking-[-0.16px] font-bold text-neutral-700">
        Check your email
      </h2>
      <p className="text-center text-sm text-muted-foreground font-normal">
        We just sent a verification link to{' '}
        <span className="font-semibold underline underline-offset-4 text-neutral-700">
          {email}
        </span>
        .
      </p>
      <p className="text-center text-sm text-muted-foreground font-normal">
        Didn&apos;t receive the email?
      </p>
      <Button
        onClick={async () => {
          resend(email);
        }}
        disabled={rawCooldownTime > 0 || disabled}
        className="h-[40px] bg-neutral-600 hover:bg-neutral-600/90 transition-all duration-300"
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
