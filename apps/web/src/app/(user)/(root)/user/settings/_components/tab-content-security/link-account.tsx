'use client';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GetAllAccountResponse } from '@/lib/types/get-all-account-response';
import { Session } from '@/lib/types/session';
import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Key, Link2, Link2Off } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiDiscord } from 'react-icons/si';
import EmailVerification from '../email-verification';
import SectionHeading from '../section-heading';

type LinkAccountParam =
  | {
      method: 'CREDENTIAL';
      action: 'CREATE' | 'RESET';
    }
  | {
      method: 'DISCORD';
      callbackUrl: string;
    }
  | {
      method: 'GOOGLE';
      callbackUrl: string;
    };

type Props = {
  session: Session;
};

export default function LinkAccount({ session }: Props) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);
  const [openDialog, setOpenDialog] = useState(false);

  const query = useQuery({
    queryKey: ['user/settings', 'list-account'],
    queryFn: async () => {
      const { data } = await apiclient.get('/auth/accounts');
      return data as GetAllAccountResponse;
    },
  });

  const isGoogleLinked = !!query.data?.find((a) => a.provider === 'google');
  const isDiscordLinked = !!query.data?.find((a) => a.provider === 'discord');
  const isCredentialLinked = !!query.data?.find(
    (a) => a.provider === 'credential',
  );

  const { mutate: linkAccount, isPending } = useMutation({
    mutationFn: async (param: LinkAccountParam) => {
      return await apiclient.post('/auth/accounts/link', {
        ...param,
      });
    },
    onError: (error: AxiosError) => {
      const body = error.response?.data as { error: { message: string } };
      const msg = body.error.message;
      if (error.status! === 400 && msg?.startsWith('Too many request')) {
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
  });

  const items = [
    {
      label: 'Ubah Password',
      icon: <Key className="size-4 text-yellow-500" />,
      isLinked: isCredentialLinked,
      canToogle: true,
      onClick: () => setOpenDialog(true),
      isPending: isPending,
    },
    {
      label: 'Google',
      icon: <FcGoogle className="size-4" />,
      isLinked: isGoogleLinked,
      canToogle: false,
      onClick: () =>
        linkAccount(
          {
            method: 'GOOGLE',
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/user/settings`,
          },
          {
            onSuccess: (response) => {
              router.replace(response.data.url);
            },
          },
        ),
      isPending: isPending,
    },
    {
      label: 'Discord',
      icon: <SiDiscord className="size-4 text-blue-500" />,
      isLinked: isDiscordLinked,
      canToogle: false,
      onClick: () =>
        linkAccount(
          {
            method: 'DISCORD',
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/user/settings`,
          },
          {
            onSuccess: (response) => {
              router.replace(response.data.url);
            },
          },
        ),
      isPending: isPending,
    },
  ];

  return (
    <>
      <EmailVerification
        show={isSubmitted}
        disabled={isPending}
        email={session?.user.email || ''}
        resend={() =>
          linkAccount(
            {
              method: 'CREDENTIAL',
              action: isCredentialLinked ? 'RESET' : 'CREATE',
            },
            {
              onSuccess: () => {
                setIsSubmitted(true);
                restartCooldown();
              },
            },
          )
        }
        cooldownTime={cooldownTime}
        rawCooldownTime={rawCooldownTime}
        // restartCooldown={restartCooldown}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[90vw] max-w-sm bg-neutral-800 text-neutral-200 border-neutral-500 overflow-auto max-h-[90vh]">
          <DialogTitle className="text-lg font-semibold">
            Konfirmasi Ubah Password
          </DialogTitle>
          <DialogDescription className="text-base text-neutral-300 mt-2">
            Demi keamanan, membuat atau mengubah password akan mengeluarkanmu
            dari semua sesi aktif. Lanjutkan?
          </DialogDescription>
          <DialogFooter className="mt-6 flex w-full gap-3">
            <button
              onClick={() => setOpenDialog(false)}
              className="text-sm font-medium border border-neutral-500 text-neutral-700 bg-neutral-50 rounded-lg px-4 py-2 hover:bg-neutral-100 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              onClick={() => {
                linkAccount(
                  {
                    method: 'CREDENTIAL',
                    action: isCredentialLinked ? 'RESET' : 'CREATE',
                  },
                  {
                    onSuccess: () => {
                      setIsSubmitted(true);
                      restartCooldown();
                    },
                  },
                );
                setOpenDialog(false);
              }}
              className="text-sm font-medium bg-neutral-700 text-neutral-200 rounded-lg px-4 py-2 hover:bg-neutral-600 transition-colors duration-200"
            >
              Lanjutkan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full h-full">
        <SectionHeading>Account Linking</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {items.map((item, idx) => (
            <AccountLinkButton
              key={idx}
              label={item.label}
              icon={item.icon}
              isLinked={item.isLinked}
              canToogle={item.canToogle}
              isPending={item.isPending}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}

type ButtonProps = {
  label: string;
  icon: ReactNode;
  isLinked: boolean;
  canToogle: boolean;
  onClick: () => void;
  isPending: boolean;
};

function AccountLinkButton({
  label,
  icon,
  isLinked,
  canToogle,
  onClick,
  isPending,
}: ButtonProps) {
  const disabled = isPending || (!canToogle && isLinked);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-between w-full px-4 py-3 border rounded-xl text-sm transition-all duration-150 group bg-white disabled:opacity-60',
        canToogle &&
          !isPending &&
          'hover:border-neutral-400 hover:bg-neutral-100',
        !canToogle &&
          !isLinked &&
          !isPending &&
          'hover:border-neutral-400 hover:bg-neutral-100',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="transition-transform group-hover:scale-110">
          {icon}
        </span>
        <span className="font-medium text-neutral-700">{label}</span>
      </div>
      <span className="text-xs flex items-center gap-1 text-neutral-600 font-medium">
        {isLinked ? (
          <>
            <Link2 className="size-4" />
            <span className="hidden sm:inline">Terhubung</span>
          </>
        ) : (
          <>
            <Link2Off className="size-4" />
            <span className="hidden sm:inline">Belum Terhubung</span>
          </>
        )}
      </span>
    </button>
  );
}
