import { z } from 'zod';

export const SigninDTO = z.union([
  z.object({
    signinMethod: z.literal('CREDENTIAL'),
    withEmailConfirmation: z.literal(true),
    token: z
      .string()
      .length(25) // Must be exactly 25 characters
      .regex(/^[a-f0-9]+$/i), // Must contain only hexadecimal characters
  }),
  z.object({
    signinMethod: z.literal('CREDENTIAL'),
    withEmailConfirmation: z.literal(false),
    role: z.literal('USER'),
    email: z.string().email('Invalid email format'),
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
  }),
  z.object({
    signinMethod: z.literal('GOOGLE'),
    role: z.literal('USER'),
    callbackURL: z.string().url(),
    errorCallback: z.string().url(),
  }),

  z.object({
    signinMethod: z.literal('DISCORD'),
    role: z.literal('USER'),
    callbackURL: z.string().url(),
    errorCallback: z.string().url(),
  }),
]);

export const SigninCredConfirmDTO = z.object({
  signinMethod: z.literal('CREDENTIAL'),
  role: z.enum(['USER', 'ADMIN', 'SUPER']),
  email: z.string().email('Invalid email format'),
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
