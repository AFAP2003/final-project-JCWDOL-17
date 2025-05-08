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
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowRight, Mail, MailCheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import AuthLogo from '../../../../components/auth-logo';

const formSchema = z.object({
  email: z.string().email('Please input valid email address'),
});

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate: sendEmail, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      return await apiclient.post('/auth/forgot-password', {
        email: payload.email,
      });
    },
    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;
      if (error.status! === 404) {
        // Just ignore it
        restartCooldown();
        setIsSubmitted(true);
        return;
      }
      if (
        error.status === 400 &&
        message.startsWith('This account is not linked to credential method')
      ) {
        // Just ignore it
        restartCooldown();
        setIsSubmitted(true);
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

    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        description: `Email was send to ${form.getValues('email')}`,
      });
      restartCooldown();
    },
  });

  return (
    <div>
      {!isSubmitted ? (
        <div className="flex size-full items-center justify-center grow">
          <div className="w-full max-w-md relative overflow-hidden">
            {/* <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60"></div> */}

            {/* Header */}
            <CardHeader className="space-y-2 pb-6">
              <AuthLogo />

              <CardTitle className="text-2xl font-bold">
                Forgot Password
              </CardTitle>
              <CardDescription className="text-sm">
                Include the email address associated with your account and we’ll
                send you an email with instructions to reset your password.
              </CardDescription>
            </CardHeader>

            <Separator />

            {/* Content */}
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((payload) => {
                    sendEmail(payload);
                  })}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              id="email"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mt-6 w-full gap-2"
                    disabled={isPending}
                    size="lg"
                  >
                    Send Email
                    {isPending ? (
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
            onClick={() => sendEmail({ email: form.getValues('email') })}
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
