'use client';

import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import AuthLogo from '../../../../../components/auth-logo';

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

export default function SetPasswordForm(props: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const [isRedirecting, startTransition] = useTransition();

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const { data } = await apiclient.post('/auth/signup', {
        password: payload.password,
        token: props.token,
        role: 'USER',
        signupMethod: 'CREDENTIAL',
      });
      return data;
    },
    onError: (error: AxiosError) => {
      const body = error.response?.data as { error: { message: string } };
      const msg = body.error.message;

      if (error.status === 400 && msg.startsWith('Bad token')) {
        toast({
          description: 'Invalid or expired token, please sign up again!',
          variant: 'destructive',
        });
        startTransition(() => {
          router.push('/auth/signup');
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
        description: 'Success creating account, please continue on sign in',
      });
      form.reset();
      startTransition(() => {
        router.push('/auth/signin');
      });
    },
  });

  return (
    <div className="flex size-full items-center justify-center grow">
      <div className="w-full max-w-md relative overflow-hidden">
        {/* <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60"></div> */}

        {/* Header */}
        <CardHeader className="space-y-2 pb-6">
          <AuthLogo />

          <CardTitle className="text-2xl font-bold">
            Setup Your Password
          </CardTitle>
          <CardDescription className="text-sm">
            Please provide strong password to finish creating your account
          </CardDescription>
        </CardHeader>

        <Separator />

        {/* Content */}
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((payload) => signup(payload))}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className="pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-6 w-full gap-2"
                disabled={isPending || isRedirecting}
                size="lg"
              >
                {isRedirecting ? 'Redirecting ' : 'Create My Account'}
                {isPending || isRedirecting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
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
