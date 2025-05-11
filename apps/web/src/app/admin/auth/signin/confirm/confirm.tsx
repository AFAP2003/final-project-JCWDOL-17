'use client';

import AuthLogo from '@/components/auth-logo';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[@$!%*?&]/,
      'Password must contain at least one special character (@$!%*?&)',
    ),
});

type Props = {
  token: string;
};

export default function Confirm({ token }: Props) {
  const router = useRouter();

  const { mutate: confirm, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await apiclient.post('/auth/signin', {
        token: token,
        withEmailConfirmation: true,
        signinMethod: 'CREDENTIAL',
      });
      return data;
    },
    onError: (error: AxiosError) => {
      const body = error.response?.data as { error: { message: string } };
      const msg = body.error.message;

      if (error.status === 400 && msg.startsWith('Bad token')) {
        toast({
          description: 'Invalid or expired token',
          variant: 'destructive',
        });
        router.push('/admin/auth/signin');
        return;
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: () => {
      router.push('/'); // TODO: change this later
    },
  });

  return (
    <div className="flex size-full items-center justify-center grow">
      <div className="w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <CardHeader className="space-y-2 pb-6">
          <AuthLogo />

          <CardTitle className="text-2xl font-bold">
            Confirm My Sign In
          </CardTitle>
          <CardDescription className="text-sm">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          </CardDescription>
        </CardHeader>

        <Separator />

        {/* Content */}
        <CardContent className="pt-6">
          <Button
            type="button"
            onClick={() => confirm()}
            className="mt-6 w-full gap-2"
            disabled={isPending}
            size="lg"
          >
            Confirm
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
          <div className="text-xs text-muted-foreground">
            By continue, you agree to our{' '}
            <Link
              href="#"
              className="font-medium text-primary underline-offset-4 underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="#"
              className="font-medium text-primary underline-offset-4 underline"
            >
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
