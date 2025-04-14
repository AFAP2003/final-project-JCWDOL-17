import { VerificationIdentifier } from '@/enums/verification-identifier';
import { z } from 'zod';

export const ExchangeTokenDTO = z.object({
  identifier: z.enum([
    VerificationIdentifier.SignupConfirmation,
    VerificationIdentifier.SigninConfirmation,
    VerificationIdentifier.ResetPassword,
    VerificationIdentifier.AnonymusSignin,
  ]),
  token: z.string(), // encrypted token
});
