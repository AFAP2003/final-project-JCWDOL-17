import { FRONTEND_URL, NODE_ENV } from '@/config';
import {
  SignupBasicConfirmationDTO,
  SignupBasicResendEmailDTO,
  SignupDTO,
} from '@/dtos/signup.dto';
import {
  InternalSeverError,
  NotFoundError,
  UnprocessableEntityError,
} from '@/errors';
import { currentDate, dateFrom } from '@/helpers/datetime';
import { generateReferralCode } from '@/helpers/referral-code';
import { prismaclient } from '@/prisma';
import { createSupabaseClient } from '@/supabase';
import { randomBytes } from 'crypto';
import { addHours, isAfter } from 'date-fns';
import { Request, Response } from 'express';
import { base32 } from 'rfc4648';
import { z } from 'zod';
import { SMTPService } from './smtp.service';
import { UserService } from './user.service';

export class AuthService {
  private userService = new UserService();
  private smtpService = new SMTPService();

  signupBasicConfirmation = async (
    dto: z.infer<typeof SignupBasicConfirmationDTO>,
  ) => {
    const user = await this.userService.getByEmail(dto.email);
    if (user)
      throw new UnprocessableEntityError({
        email: {
          _errors: 'User with this email already exists',
        },
      });
    if (dto.referralCode) {
      const exists = await this.userService.getByReferralCode(dto.referralCode);
      if (!exists)
        throw new UnprocessableEntityError({
          referralCode: {
            _errors: 'No match for this referral code',
          },
        });
    }

    const satuJamKedepan = addHours(currentDate(), 1);
    const { token, expiredAt } = await prismaclient.signupToken.upsert({
      where: {
        email: dto.email,
      },
      create: {
        ...dto,
        expiredAt: satuJamKedepan,
        token: await this.generateSignupToken(),
      },
      update: {
        expiredAt: satuJamKedepan,
      },
    });

    // TODO: Setup Worker for removing 1 hour

    // TODO: On production fill the confirmation Link
    const confirmationLink =
      NODE_ENV === 'development'
        ? `${FRONTEND_URL}/auth/signup/set-password?token=${token}`
        : '';

    this.smtpService.sendMail({
      tmplname: 'signup-confirmation',
      to: dto.email,
      subject: 'Signup Confirmation',
      data: {
        receiver: dto.email,
        confirmationLink: confirmationLink,
        year: currentDate().getFullYear(),
      },
    });

    return { confirmationLink, expiredAt };
  };

  signupBasicResendEmail = async (
    dto: z.infer<typeof SignupBasicResendEmailDTO>,
  ) => {
    const record = await prismaclient.signupToken.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!record) throw new NotFoundError();

    if (isAfter(currentDate(), dateFrom(record.expiredAt))) {
      throw new UnprocessableEntityError({
        token: {
          _errors: 'This token is no longer valid',
        },
      });
    }

    // TODO: On production fill the confirmation Link
    const confirmationLink =
      NODE_ENV === 'development'
        ? `${FRONTEND_URL}/auth/signup/set-password?token=${record.token}`
        : '';

    this.smtpService.sendMail({
      tmplname: 'signup-confirmation',
      to: dto.email,
      subject: 'Signup Confirmation',
      data: {
        receiver: dto.email,
        confirmationLink: confirmationLink,
        year: currentDate().getFullYear(),
      },
    });

    return { confirmationLink, expiredAt: record.expiredAt };
  };

  signup = async (
    dto: z.infer<typeof SignupDTO>,
    req: Request,
    res: Response,
  ) => {
    const supabase = createSupabaseClient(req, res);
    return prismaclient.$transaction(async (tx) => {
      switch (dto.type) {
        case 'basic': {
          const signupinfo = await tx.signupToken.findUnique({
            where: {
              token: dto.token,
            },
          });
          if (!signupinfo)
            throw new InternalSeverError(
              `No match for signup token ${dto.token}`,
            );

          let referredById = undefined;
          if (signupinfo.referralCode) {
            // TODO:
            // - find referred with this referral code
            // - add voucher
            // - assign referredById to the id of referred
          }

          const localuser = await tx.user.create({
            data: {
              email: signupinfo.email,
              role: dto.role,
              firstName: signupinfo.firstName,
              lastName: signupinfo.lastName,
              referralCode: await generateReferralCode(),
              referredById: referredById,
            },
          });

          const authuser = await supabase.auth.signUp({
            email: signupinfo.email,
            password: dto.password,
            options: {
              data: {
                ...localuser,
              },
            },
          });
          if (authuser.error) throw new InternalSeverError(authuser.error);

          await supabase.auth.admin.updateUserById(authuser.data.user!.id, {
            id: localuser.id,
            email_confirm: true,
          });

          await tx.signupToken.delete({ where: { id: signupinfo.id } });

          return localuser;
        }
      }
    });
  };

  generateSignupToken = async () => {
    // Generate 16 random bytes
    const randomBytesBuffer = randomBytes(16);

    // Encode to Base32 (without padding)
    const token = base32.stringify(randomBytesBuffer, {
      pad: false,
    });

    return token;
  };
}
