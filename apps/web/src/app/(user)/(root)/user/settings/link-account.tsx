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
import { SiFacebook } from 'react-icons/si';
import EmailVerification from './email-verification';
import SectionHeading from './section-heading';

type LinkAccountParam =
  | {
      method: 'CREDENTIAL';
      action: 'CREATE' | 'RESET';
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

  // TODO: handle query.error
  const query = useQuery({
    queryKey: ['user/settings', 'list-account'],
    queryFn: async () => {
      const { data } = await apiclient.get('/auth/accounts');
      return data as GetAllAccountResponse;
    },
  });

  const isGoogleLinked = !!query.data?.find((a) => a.provider === 'google');
  const isFacebookLinked = !!query.data?.find((a) => a.provider === 'facebook');
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
      label: 'Change / Set Password',
      icon: <Key className="size-4 text-yellow-500" />,
      isLinked: isCredentialLinked,
      canToogle: true,
      onClick: () => setOpenDialog(true),
      isPending: isPending,
    },
    {
      label: 'Google',
      icon: <FcGoogle className="size-4 text-yellow-500" />,
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
      label: 'Facebook',
      icon: <SiFacebook className="size-4 text-blue-500" />,
      isLinked: isFacebookLinked,
      canToogle: false,
      onClick: () => {},
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
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            Confirm Password Change
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-700 mt-2">
            For security reasons, changing or creating new password will sign
            you out of all sessions. Please confirm to proceed.
          </DialogDescription>
          <DialogFooter className="mt-6 flex w-full gap-3">
            <button
              onClick={() => setOpenDialog(false)}
              className="text-sm font-medium border border-green-500 text-green-600 rounded-lg px-4 py-2 hover:bg-green-50 transition-colors duration-200"
            >
              Cancel
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
              className="text-sm font-medium bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition-colors duration-200"
            >
              Continue
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-12 w-full">
        <SectionHeading>Account Linking</SectionHeading>
        <div className="flex flex-col space-y-2 w-full justify-center">
          {items.map((item, idx) => (
            <Button
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

function Button(props: ButtonProps) {
  return (
    <button
      onClick={props.onClick}
      disabled={(() => {
        if (props.isPending) return true;
        if (!props.canToogle && props.isLinked) return true;
      })()}
      className={cn(
        'border rounded-xl text-sm w-full disabled:opacity-80 transition-all duration-300 group',
        props.canToogle &&
          !props.isPending &&
          'hover:border-green-500/50 hover:bg-green-50',
        !props.canToogle &&
          !props.isLinked &&
          !props.isPending &&
          'hover:border-green-500/50 hover:bg-green-50 ',
      )}
    >
      <div className="flex items-center">
        <span
          className={cn(
            'border-r py-2 px-3 transition-all',
            props.canToogle && !props.isPending && 'group-hover:scale-[110%]',
            !props.canToogle &&
              !props.isLinked &&
              !props.isPending &&
              'group-hover:scale-[110%]',
          )}
        >
          {props.icon}
        </span>
        <p className="w-full font-semibold text-neutral-600">{props.label}</p>
        <span className="py-2 px-3 w-28">
          {props.isLinked ? (
            <div className="text-xs flex flex-row items-center text-green-500 gap-2">
              <Link2 className="size-4 shrink-0" />
              <span className="w-full text-center">Linked</span>
            </div>
          ) : (
            <div className="text-xs flex flex-row items-center text-green-500 gap-2">
              <Link2Off className="size-4" />
              <span>Unlinked</span>
            </div>
          )}
        </span>
      </div>
    </button>
  );
}
