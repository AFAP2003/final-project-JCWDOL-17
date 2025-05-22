'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Edit2, Eye, EyeOff, Lock, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCooldown } from '@/hooks/use-cooldown';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import EmailVerification from '../email-verification';

export default function EmailChangeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'password' | 'email'>('password');
  const { cooldownTime, rawCooldownTime, restartCooldown } = useCooldown(120);

  // Password validation schema
  const passwordSchema = z.object({
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

  // Email validation schema
  const emailSchema = z.object({
    newEmail: z.string().email('Please enter a valid email address'),
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  });

  // Email form
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { newEmail: '' },
  });

  // Password verification mutation
  const verifyPassword = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      const response = await apiclient.post('/auth/check-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.match) {
        setStep('email');
        emailForm.reset();
      } else {
        passwordForm.setError('password', {
          message: 'Your password is not match with this account',
          type: 'onChange',
        });
      }
    },
    onError: () => {
      toast({
        description: 'Failed to check password. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Email change mutation
  const changeEmail = useMutation({
    mutationFn: async (data: z.infer<typeof emailSchema>) => {
      const response = await apiclient.patch('/user/email', {
        ...data,
        password: passwordForm.getValues('password'),
      });
      return response.data;
    },
    onSuccess: () => {
      setIsVerifying(true);
      restartCooldown();
      setIsOpen(false);
      toast({
        description: 'Verification email sent. Please check your inbox.',
      });
    },
    onError: () => {
      toast({
        description: 'Failed to update email. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
    setStep('password');
    passwordForm.reset();
    emailForm.reset();
  };

  return (
    <>
      <EmailVerification
        show={isVerifying}
        disabled={changeEmail.isPending}
        email={emailForm.getValues('newEmail')}
        resend={() => changeEmail.mutate(emailForm.getValues())}
        cooldownTime={cooldownTime}
        rawCooldownTime={rawCooldownTime}
        // restartCooldown={restartCooldown}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </DialogTrigger>

        <DialogContent
          closeClass="hidden"
          className="rounded-lg border border-neutral-500 shadow-md bg-neutral-800"
        >
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div className="w-full relative px-4 py-3">
            <div className="flex w-full justify-between items-center mb-4">
              <h2 className="text-neutral-200 font-semibold">
                {step === 'password'
                  ? 'Enter Password'
                  : 'Change Email Address'}
              </h2>
              <X
                onClick={handleClose}
                className="size-4 text-neutral-200 cursor-pointer"
              />
            </div>

            <div className="text-sm text-neutral-300 mb-6">
              {step === 'password'
                ? 'We need to verify your account before changing your email address.'
                : 'Changing your email will require verification and sign you out of all sessions.'}
            </div>

            {step === 'password' ? (
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit((data) =>
                    verifyPassword.mutate(data),
                  )}
                >
                  <FormField
                    key={'password'}
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              className="pl-10 bg-neutral-50 text-neutral-800"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground"
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

                  <div className="w-full flex justify-end mt-6">
                    <Button
                      disabled={verifyPassword.isPending}
                      className="bg-neutral-600 hover:bg-neutral-700 text-neutral-200"
                      type="submit"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit((data) =>
                    changeEmail.mutate(data),
                  )}
                >
                  <FormField
                    key={'email'}
                    control={emailForm.control}
                    name="newEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            className="bg-neutral-50 text-neutral-800"
                            placeholder="Enter new email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="w-full flex justify-end mt-6">
                    <Button
                      disabled={changeEmail.isPending}
                      className="bg-neutral-600 hover:bg-neutral-700 text-neutral-200"
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
