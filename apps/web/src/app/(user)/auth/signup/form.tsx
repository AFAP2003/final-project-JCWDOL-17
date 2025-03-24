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
import { useSignupContext } from '@/context/signup-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { parseBasicObjZodError } from '@/lib/parse-zod-error';
import { removeStorage, writeStorage } from '@/lib/session-storage';
import { SignupConfirmResponse } from '@/types/signup-confirm-response';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowRight, LayoutDashboard, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { SiFacebook } from 'react-icons/si';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Please input valid email address'),
  firstName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  lastName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  referralCode: z
    .string()
    .trim()
    .regex(/^REF-[A-Z0-9]{8}$|/, 'Invalid referral code format')
    .or(z.literal(''))
    .optional(),
});

export default function SignupForm() {
  const { setData } = useSignupContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      referralCode: '',
    },
  });

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      if (!payload.referralCode) payload.referralCode = undefined;
      const { data } = await apiclient.post(
        '/auth/signup/basic/confirm',
        payload,
      );
      return data as SignupConfirmResponse;
    },
    onError: (error: AxiosError) => {
      if (error.status! === 422) {
        const parsederror = parseBasicObjZodError(error);
        parsederror.forEach((err) => form.setError(err.key, err.value));
        return;
      }

      toast({
        title: 'Server Error',
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      removeStorage('signup-pending');
      writeStorage({
        key: 'signup-pending',
        data: { email: data.email, expiredAt: data.expiredAt },
      });
      setData({ email: data.email, expiredAt: data.expiredAt });
      form.reset();
    },
  });

  return (
    <div className="flex size-full items-center justify-center grow">
      <div className="w-full max-w-md overflow-hidden">
        {/* Header */}
        <CardHeader className="space-y-2 pb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((payload) => signup(payload))}
              className="space-y-4"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            placeholder="Smith"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                disabled={isPending}
                size="lg"
              >
                Sign Up with Email
                {isPending ? (
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
              variant="outline"
              className="group flex w-full items-center justify-center gap-2 border-slate-200 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <FcGoogle className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Google</span>
            </Button>
            <Button
              variant="outline"
              className="group flex w-full items-center justify-center gap-2 border-slate-200 transition-all"
            >
              <SiFacebook className="h-4 w-4 transition-transform group-hover:scale-110 text-blue-600" />
              <span>Facebook</span>
            </Button>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col space-y-4 border-t bg-slate-50/50 p-6">
          <div className="text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </div>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
