'use client';

import AuthLogo from '@/components/auth-logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import PanelLeft from './panel-left';

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

type Props = {
  role: 'ADMIN' | 'SUPER';
};

export default function SigninForm(props: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: signin, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      return await apiclient.post('/auth/signin/confirm', {
        ...payload,
        signinMethod: 'CREDENTIAL',
        role: props.role,
      });
    },
    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (error.status! === 401) {
        form.resetField('password');
        form.setError('email', {
          message: 'Invalid email or password',
          type: 'onChange',
        });
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
      toast({
        description: `Email was send to ${form.getValues('email')}`,
      });
      setIsSubmitted(true);
      restartCooldown();
    },
  });

  return (
    <div>
      {!isSubmitted ? (
        <Card className="size-full shadow-md max-lg:shadow-none max-lg:border-none overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <PanelLeft />
            <Signin
              form={form}
              isPending={isPending}
              loginRole={props.role}
              onSignin={signin}
            />
          </div>
        </Card>
      ) : (
        <Notification
          form={form}
          isPending={isPending}
          onSignin={signin}
          cooldownTime={cooldownTime}
          rawCooldownTime={rawCooldownTime}
        />
      )}
    </div>
  );
}

type SigninProps = {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  onSignin: (payload: z.infer<typeof formSchema>) => any;
  isPending: boolean;
  loginRole: 'ADMIN' | 'SUPER';
  // setLoginRole: Dispatch<SetStateAction<'ADMIN' | 'SUPER'>>;
};

export function Signin({
  form,
  onSignin,
  isPending,
  loginRole,
  // setLoginRole,
}: SigninProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="flex size-full items-center justify-center grow">
      <div className="w-full max-w-md overflow-hidden">
        {/* Header */}
        <CardHeader className="space-y-2 pb-6">
          <AuthLogo shoudLink={false} />

          <CardDescription className="">
            Sign in as {loginRole === 'ADMIN' ? 'super admin' : 'admin store'}?{' '}
            <button
              onClick={() => {
                if (loginRole === 'ADMIN') {
                  router.push('/admin/auth/signin?role=SUPER');
                } else {
                  router.push('/admin/auth/signin?role=ADMIN');
                }
              }}
              className="font-medium text-primary underline-offset-4 underline"
            >
              Click Here
            </button>
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((payload) => onSignin(payload))}
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
                        placeholder='use this: @Password123'
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

              <Button
                type="submit"
                className="w-full gap-2 transition-all"
                disabled={isPending}
                size="lg"
              >
                Sign as {loginRole === 'ADMIN' ? 'Admin Store' : 'Super Admin'}
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
            By continuing, you agree to our{' '}
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

type NotificationProps = {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>;
  onSignin: (payload: z.infer<typeof formSchema>) => any;
  isPending: boolean;
  rawCooldownTime: number;
  cooldownTime: string;
};

export function Notification({
  form,
  onSignin,
  isPending,
  rawCooldownTime,
  cooldownTime,
}: NotificationProps) {
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
          {form.getValues().email}
        </span>
        .
      </p>
      <p className="text-center text-sm text-muted-foreground font-normal">
        Didn&apos;t receive the email?
      </p>
      <Button
        onClick={() => onSignin(form.getValues())}
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
