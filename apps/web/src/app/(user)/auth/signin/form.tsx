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
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { SiDiscord } from 'react-icons/si';
import { z } from 'zod';
import AuthLogo from '../../../../components/auth-logo';

const formSchema = z.object({
  email: z.string().email('Please input valid email address'),
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

type SigninPayload =
  | ({
      method: 'CREDENTIAL';
    } & z.infer<typeof formSchema>)
  | {
      method: 'GOOGLE';
    }
  | {
      method: 'DISCORD';
    };

type Props = {
  searchParams: Record<string, any>;
};

export default function SigninForm({ searchParams }: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: signin, isPending } = useMutation({
    mutationFn: async (payload: SigninPayload) => {
      if (payload.method === 'CREDENTIAL') {
        return await apiclient.post('/auth/signin', {
          signinMethod: payload.method,
          withEmailConfirmation: false,
          role: 'USER',
          email: payload.email,
          password: payload.password,
        });
      }

      if (payload.method === 'GOOGLE') {
        return await apiclient.post('/auth/signin', {
          signinMethod: payload.method,
          role: 'USER',
          callbackURL: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signin/check-verified`,
          errorCallback: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signin`,
        });
      }

      if (payload.method === 'DISCORD') {
        return await apiclient.post('/auth/signin', {
          signinMethod: payload.method,
          role: 'USER',
          callbackURL: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signin/check-verified`,
          errorCallback: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signin`,
        });
      }

      throw new Error('Unhandled posible case for singup method');
    },
    onError: (error: AxiosError) => {
      if (error.status === 401) {
        form.resetField('password');
        form.setError('email', {
          message: 'Invalid email or password',
          type: 'onChange',
        });
        return;
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: (response) => {
      if (response.data.signinMethod === 'CREDENTIAL') {
        form.reset();
        startTransition(() => {
          router.push('/auth/signin/check-verified');
        });
        return;
      }

      const url = response.data.url;
      startTransition(() => {
        router.replace(url);
      });
    },
  });

  if (searchParams?.error && searchParams.error === 'account_not_linked') {
    toast({
      description:
        "Your account isn't linked. Log in with your signup method to link it later in settings.",
      variant: 'destructive',
    });

    startTransition(() => {
      router.push('/auth/signin');
    });
  }

  return (
    <div className="flex size-full items-center justify-center grow">
      <div className="w-full max-w-md overflow-hidden">
        {/* Header */}
        <CardHeader className="space-y-2 pb-6">
          <AuthLogo />

          <CardTitle className=" text-2xl font-bold">Signin into App</CardTitle>
          <CardDescription className="">
            Don&apos; have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary underline-offset-4 underline"
            >
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((payload) =>
                signin({
                  method: 'CREDENTIAL',
                  ...payload,
                }),
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            placeholder="m@example.com"
                            className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

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
                          onChange={(e) => {
                            form.clearErrors('password');
                            return field.onChange(e);
                          }}
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

              <div className="text-right text-sm underline underline-offset-4">
                <Link href={'/auth/forgot-password'}>
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 transition-all"
                disabled={isPending || isRedirecting}
                size="lg"
              >
                {isRedirecting ? 'Redirecting ' : 'Sign In With Email'}
                {isPending || isRedirecting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              disabled={isPending || isRedirecting}
              onClick={() =>
                signin({
                  method: 'GOOGLE',
                })
              }
              variant="outline"
              className="group flex w-full items-center justify-center gap-2 border-slate-200 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <FcGoogle className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Google</span>
            </Button>
            <Button
              disabled={isPending || isRedirecting}
              onClick={() =>
                signin({
                  method: 'DISCORD',
                })
              }
              variant="outline"
              className="group flex w-full items-center justify-center gap-2 border-slate-200 transition-all"
            >
              <SiDiscord className="h-4 w-4 transition-transform group-hover:scale-110 text-blue-600" />
              <span>Discord</span>
            </Button>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
          <div className="text-xs text-muted-foreground">
            By sign up, you agree to our{' '}
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
