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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
// import { useSignupContext } from '@/context/signup-provider';
import { parseBasicObjZodError } from '@/lib/parse-zod-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  ArrowRight,
  LayoutDashboard,
  Mail,
  MailCheckIcon,
  User,
} from 'lucide-react';
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
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  referralCode: z.string().trim().optional(),
});

type SingupPayload =
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

export default function SignupForm({ searchParams }: Props) {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);
  const [isRedirecting, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      referralCode: '',
    },
  });

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async (payload: SingupPayload) => {
      if (payload.method === 'CREDENTIAL') {
        if (!payload.referralCode) payload.referralCode = undefined;
        return await apiclient.post('/auth/signup/confirm', payload);
      }

      if (payload.method === 'GOOGLE') {
        return await apiclient.post('/auth/signup', {
          signupMethod: payload.method,
          role: 'USER',
          callbackURL: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/`,
          errorCallback: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signup`,
        });
      }

      if (payload.method === 'DISCORD') {
        return await apiclient.post('/auth/signup', {
          signupMethod: payload.method,
          role: 'USER',
          callbackURL: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/`,
          errorCallback: `${process.env.NEXT_PUBLIC_BASE_FRONTEND_URL}/auth/signup`,
        });
      }

      throw new Error('Unhandled posible case for singup method');
    },
    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (error.status! === 422) {
        const parsederror = parseBasicObjZodError(error);
        parsederror.forEach((err) => form.setError(err.key, err.value));
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

    onSuccess: (response) => {
      if (response?.data?.signupMethod === 'SOCIAL') {
        const url = response.data.url;
        startTransition(() => {
          router.replace(url);
        });
        return;
      }

      toast({
        description: `Email was send to ${form.getValues('email')}`,
      });
      setShowNotification(true);
      restartCooldown();
    },
  });

  if (searchParams?.error && searchParams.error === 'account_not_linked') {
    toast({
      description:
        "Your account isn't linked. Log in with your signup method to link it later in settings.",
      variant: 'destructive',
    });
    startTransition(() => {
      router.push('/auth/signup');
    });
  }

  return (
    <div>
      {!showNotification ? (
        <div className="flex size-full items-center justify-center grow">
          <div className="w-full max-w-md overflow-hidden">
            {/* Header */}
            <CardHeader className="space-y-2 pb-6">
              <AuthLogo />

              <CardTitle className=" text-2xl font-bold">
                Create a App account
              </CardTitle>
              <CardDescription className="">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="font-medium text-primary underline-offset-4 underline"
                >
                  Sign in
                </Link>
              </CardDescription>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((payload) => {
                    signup({ method: 'CREDENTIAL', ...payload });
                  })}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              placeholder="John"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-2">
                          <div className="flex flex-row gap-2">
                            <FormLabel htmlFor="referralCode">
                              Referral Code
                            </FormLabel>
                            <FormDescription className="text-xs text-red-700">
                              (*optional)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <LayoutDashboard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="referralCode"
                                placeholder="REF-AABB5577"
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
                  <Button
                    type="submit"
                    className="w-full gap-2 transition-all"
                    disabled={isPending || isRedirecting}
                    size="lg"
                  >
                    {isRedirecting ? 'Redirecting ' : 'Sign Up with Email'}
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
                  onClick={() => {
                    signup({ method: 'GOOGLE' });
                  }}
                  disabled={isPending || isRedirecting}
                  variant="outline"
                  className="group flex w-full items-center justify-center gap-2 border-slate-200 transition-all hover:bg-slate-100 hover:text-slate-900"
                >
                  <FcGoogle className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>Google</span>
                </Button>
                <Button
                  onClick={() => {
                    signup({ method: 'DISCORD' });
                  }}
                  disabled={isPending || isRedirecting}
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
      ) : (
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
              {form.getValues().email}
            </span>
            .
          </p>
          <p className="text-center text-sm text-muted-foreground font-normal">
            Didn&apos;t receive the email?
          </p>
          <Button
            onClick={() =>
              signup({ method: 'CREDENTIAL', ...form.getValues() })
            }
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
      )}
    </div>
  );
}
