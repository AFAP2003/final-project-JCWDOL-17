import { VerificationIdentifier } from '@/enums/verification-identifier';
import { z } from 'zod';

export const ResetPasswordDTO = z
  .object({
    token: z
      .string()
      .length(25) // Must be exactly 25 characters
      .regex(/^[a-f0-9]+$/i), // Must contain only hexadecimal characters

    identifier: z.enum([
      VerificationIdentifier.AnonymusSignin,
      VerificationIdentifier.ResetPassword,
      VerificationIdentifier.NewPassword,
    ]),

    newPassword: z
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

    confirmPassword: z
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
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Your password did not match',
  });
