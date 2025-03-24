import { z } from 'zod';

export const SignupBasicConfirmationDTO = z.object({
  email: z.string().email('Invalid email format'),
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
    .regex(new RegExp(`^REF-[A-Z0-9]{8}$`), 'Invalid referral code format')
    .optional(),
});

export const SignupBasicResendEmailDTO = z.object({
  email: z.string().email('Invalid email format'),
});

export const SignupBasicExchangeTokenDTO = z.object({
  token: z
    .string()
    .length(26)
    .regex(/^[A-Z2-7]+$/, 'Invalid Base32 token format'),
});

export const SignupDTO = z.union([
  z.object({
    type: z.literal('basic'),
    token: z
      .string()
      .length(26)
      .regex(/^[A-Z2-7]+$/, 'Invalid Base32 token format'),
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
    role: z.literal('USER'),
  }),
  z.object({
    type: z.literal('google'),
  }),
]);
