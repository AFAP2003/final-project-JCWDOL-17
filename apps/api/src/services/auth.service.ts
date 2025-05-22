import { auth } from '@/auth';
import { BASE_FRONTEND_URL } from '@/config';
import { AccountLinkDTO } from '@/dtos/account-link.dto';
import { CheckPasswordDTO } from '@/dtos/check-password.dto';
import { ConfirmEmailDTO } from '@/dtos/confirm-email.dto';
import { ForgotPasswordDTO } from '@/dtos/forgot-password.dto';
import { ResendConfirmEmailDTO } from '@/dtos/resend-confirm-email.dto';
import { ResetPasswordDTO } from '@/dtos/reset-password.dto';
import { RevokeSessionDTO } from '@/dtos/revoke-session.dto';
import { SigninCredConfirmDTO, SigninDTO } from '@/dtos/signin.dto';
import { SignupCredConfirmDTO, SignupDTO } from '@/dtos/signup.dto';
import { AuthEmailType } from '@/enums/auth-email-type';
import { VerificationIdentifier } from '@/enums/verification-identifier';
import {
  BadRequestError,
  InternalSeverError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '@/errors';
import { BadTokenError } from '@/errors/400-bad-token.error';
import { createZodError } from '@/helpers/create-zod-error';
import { currentDate } from '@/helpers/datetime';
import { genReferralCode } from '@/helpers/gen-referral-code';
import { genVoucherCode } from '@/helpers/gen-voucher-code';
import { prismaclient } from '@/prisma';
import { UserSession } from '@/types/user-session.type';
import { UserRole } from '@prisma/client';
import { APIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import { add } from 'date-fns';
import { Request } from 'express';
import { z } from 'zod';
import { SMTPService } from './smtp.service';
import { UserService } from './user.service';

export class AuthService {
  private userService = new UserService();
  private smtpService = new SMTPService();

  signupCredConfirm = async (dto: z.infer<typeof SignupCredConfirmDTO>) => {
    const user = await this.userService.getByEmail(dto.email);
    if (user)
      throw new UnprocessableEntityError(
        createZodError({
          email: 'User with this email already exists',
        }),
      );

    if (dto.referralCode) {
      const exists = await this.userService.getByReferralCode(dto.referralCode);
      if (!exists)
        throw new UnprocessableEntityError(
          createZodError({
            referralCode: 'No match for this referral code',
          }),
        );
    }

    const { url } = await this.smtpService.sendAuthEmail({
      type: AuthEmailType.SignupConfirmation,
      data: {
        baseCallback: `${BASE_FRONTEND_URL}/auth/signup/set-password`,
        name: dto.name,
        receiverEmail: dto.email,
        referralCode: dto.referralCode,
      },
    });
    return { url };
  };

  signup = async (dto: z.infer<typeof SignupDTO>, req: Request) => {
    return prismaclient.$transaction(async (tx) => {
      switch (dto.signupMethod) {
        case 'CREDENTIAL': {
          const veriftoken = await prismaclient.verification.findFirst({
            where: {
              identifier: VerificationIdentifier.SignupConfirmation,
              value: dto.token,
              expiresAt: {
                gt: currentDate(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (!veriftoken) throw new BadTokenError(dto.token);

          const { email, name, referralCode } = veriftoken.metadata as {
            email: string;
            name: string;
            referralCode?: string;
          };

          const { token, user } = await auth.api.signUpEmail({
            body: {
              role: dto.role,
              email: email,
              password: dto.password,
              name: name,
              signupMethod: [dto.signupMethod],
              referralCode: await genReferralCode(),
              // referredById: referredById,
            },
            headers: fromNodeHeaders(req.headers),
          });

          let referredById: string | undefined = undefined;
          const nextMonth = add(currentDate(), { months: 1 });

          if (referralCode) {
            const referred =
              await this.userService.getByReferralCode(referralCode);
            if (!referred) {
              throw new InternalSeverError('Referred should be exists!');
            }
            await prismaclient.voucher.create({
              data: {
                name: 'Bonus Teman Baru 10K',
                description:
                  'Ajak teman belanja dan dapatkan bonus Rp10.000 untuk pembelian pertama mereka. Berlaku untuk pembelian minimal Rp50.000.',
                type: 'REFERRAL',
                valueType: 'FIXED_AMOUNT',
                maxDiscount: null,
                value: 10000,
                minPurchase: 50000,
                startDate: currentDate(),
                endDate: nextMonth,
                isForShipping: false,
                code: await genVoucherCode('REFERRAL'),
                users: {
                  connect: [
                    {
                      id: referred.id,
                    },
                  ],
                },
              },
            });
            referredById = referred.id;
          }

          if (referredById) {
            await prismaclient.voucher.create({
              data: {
                name: 'Bonus Teman Baru 10K',
                description:
                  'Ajak teman belanja dan dapatkan bonus Rp10.000 untuk pembelian pertama mereka. Berlaku untuk pembelian minimal Rp50.000.',
                type: 'REFERRAL',
                valueType: 'FIXED_AMOUNT',
                maxDiscount: null,
                value: 10000,
                minPurchase: 50000,
                startDate: currentDate(),
                endDate: nextMonth,
                isForShipping: false,
                code: await genVoucherCode('REFERRAL'),
                users: {
                  connect: [
                    {
                      id: user.id,
                    },
                  ],
                },
              },
            });
          }

          await prismaclient.user.update({
            where: {
              id: user.id,
            },
            data: {
              emailVerified: true,
              referredById: referredById,
            },
          });

          await prismaclient.verification.delete({
            where: {
              id: veriftoken.id,
            },
          });

          return { token, user, signupMethod: 'CREDENTIAL' };
        }

        case 'GOOGLE': {
          const { redirect, url } = await auth.api.signInSocial({
            body: {
              provider: 'google',
              callbackURL: dto.callbackURL,
              errorCallbackURL: dto.errorCallback,
            },
            headers: fromNodeHeaders(req.headers),
          });
          return { redirect, url, signupMethod: 'SOCIAL' };
        }

        case 'DISCORD': {
          const { redirect, url } = await auth.api.signInSocial({
            body: {
              provider: 'discord',
              callbackURL: dto.callbackURL,
              errorCallbackURL: dto.errorCallback,
            },
            headers: fromNodeHeaders(req.headers),
          });
          return { redirect, url, signupMethod: 'SOCIAL' };
        }
      }
    });
  };

  signinCredConfirm = async (dto: z.infer<typeof SigninCredConfirmDTO>) => {
    const user = await prismaclient.user.findUnique({
      where: {
        email: dto.email,
        role: dto.role,
      },
      include: {
        accounts: {
          select: {
            id: true,
            password: true,
          },
          where: {
            providerId: 'credential',
          },
        },
      },
    });
    if (!user) throw new UnauthorizedError('Invalid email or password');

    if (user.accounts.length <= 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const account = user.accounts[0];
    if (!account.password) {
      throw new InternalSeverError(
        `User with account id ${account.id} should have hash password`,
      );
    }
    const match = await this.verifyPassword(account.password, dto.password);
    if (!match) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.role !== dto.role) {
      throw new InternalSeverError(
        `User login role did not match, got: ${user.role}, expected: ${dto.role}`,
      );
    }

    const { url } = await this.smtpService.sendAuthEmail({
      type: AuthEmailType.SigninConfirmation,
      data: {
        baseCallback: `${BASE_FRONTEND_URL}/admin/auth/signin/confirm`,
        password: dto.password,
        receiverEmail: dto.email,
        role: dto.role,
      },
    });

    return { url };
  };

  signin = async (dto: z.infer<typeof SigninDTO>, req: Request) => {
    switch (dto.signinMethod) {
      case 'CREDENTIAL': {
        if (!dto.withEmailConfirmation) {
          // If login not to verify email (user)
          const user = await prismaclient.user.findUnique({
            where: {
              email: dto.email,
              role: dto.role,
            },
            include: {
              accounts: {
                select: {
                  id: true,
                  password: true,
                },
                where: {
                  providerId: 'credential',
                },
              },
            },
          });
          if (!user) throw new UnauthorizedError('Invalid email or password');

          if (user.accounts.length <= 0) {
            throw new UnauthorizedError('Invalid email or password');
          }

          const account = user.accounts[0];
          if (!account.password) {
            throw new InternalSeverError(
              `User with account id ${account.id} should have hash password`,
            );
          }
          const match = await this.verifyPassword(
            account.password,
            dto.password,
          );
          if (!match) {
            throw new UnauthorizedError('Invalid email or password');
          }

          if (user.role !== 'USER') {
            throw new InternalSeverError(
              `User login role did not match, got: ${user.role}, expected: USER`,
            );
          }

          try {
            const { headers, response } = await this.signinWithCredential(
              {
                email: dto.email,
                password: dto.password,
              },
              req,
            );

            const { url } = await this.smtpService.sendAuthEmail({
              type: AuthEmailType.SigninNotification,
              data: {
                baseCallback: `${BASE_FRONTEND_URL}/auth/reset-password`,
                receiverEmail: dto.email,
                sessionToken: response.token,
                userId: response.user.id,
              },
            });

            return {
              headers,
              response,
              signinMethod: 'CREDENTIAL' as const,
              resetUrl: url,
              emailVerified: true as const,
            };
          } catch (error: any) {
            throw new InternalSeverError(
              new Error(`should be valid login, got error instead ${error}`),
            );
          }
        } else {
          // If login need to verify email (admin)
          const veriftoken = await prismaclient.verification.findFirst({
            where: {
              identifier: VerificationIdentifier.SigninConfirmation,
              value: dto.token,
              expiresAt: {
                gt: currentDate(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (!veriftoken) throw new BadTokenError(dto.token);

          const { email, password, role } = veriftoken.metadata as {
            role: UserRole;
            password: string;
            email: string;
          };

          try {
            const { headers, response } = await this.signinWithCredential(
              {
                email: email,
                password: password,
              },
              req,
            );

            await prismaclient.verification.delete({
              where: {
                id: veriftoken.id,
              },
            });
            return { headers, response, signinMethod: 'CREDENTIAL' as const };
          } catch (error: any) {
            throw new InternalSeverError(
              new Error(`should be valid login, got error instead ${error}`),
            );
          }
        }
      }

      case 'GOOGLE': {
        const { redirect, url } = await auth.api.signInSocial({
          body: {
            provider: 'google',
            callbackURL: dto.callbackURL,
            errorCallbackURL: dto.errorCallback,
          },
          headers: fromNodeHeaders(req.headers),
        });
        return { redirect, url, signinMethod: 'GOOGLE' as const };
      }

      case 'DISCORD': {
        const { redirect, url } = await auth.api.signInSocial({
          body: {
            provider: 'discord',
            callbackURL: dto.callbackURL,
            errorCallbackURL: dto.errorCallback,
          },
          headers: fromNodeHeaders(req.headers),
        });
        return { redirect, url, signinMethod: 'FACEBOOK' as const };
      }
    }
  };

  forgotPassword = async (dto: z.infer<typeof ForgotPasswordDTO>) => {
    const user = await prismaclient.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new NotFoundError();
    const permitted = user.signupMethod.find((m) => m === 'CREDENTIAL');
    if (!permitted) {
      throw new BadRequestError(
        'This account is not linked to credential method',
      );
    }

    const { url } = await this.smtpService.sendAuthEmail({
      type: AuthEmailType.ResetPassword,
      data: {
        baseCallback: `${BASE_FRONTEND_URL}/auth/reset-password`,
        receiverEmail: user.email,
        userId: user.id,
      },
    });
    return { url };
  };

  resetPassword = async (
    dto: z.infer<typeof ResetPasswordDTO>,
    req: Request,
  ) => {
    const veriftoken = await prismaclient.verification.findFirst({
      where: {
        identifier: dto.identifier,
        value: dto.token,
        expiresAt: {
          gt: currentDate(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!veriftoken) throw new BadTokenError(dto.token);

    const { userId } = veriftoken.metadata as {
      userId: string;
    };

    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundError();

    const ctx = await auth.$context;

    if (user.signupMethod.includes('CREDENTIAL')) {
      const hash = await ctx.password.hash(dto.newPassword);
      await ctx.internalAdapter.updatePassword(userId, hash);
    } else {
      // For linking account with credential
      try {
        await auth.api.setPassword({
          body: {
            newPassword: dto.newPassword,
          },
          headers: fromNodeHeaders(req.headers),
        });
      } catch (error: any) {
        throw new InternalSeverError(
          `error creating new password ${error.status}`,
        );
      }
    }

    await ctx.internalAdapter.deleteSessions(userId); // remove all session
    await prismaclient.verification.delete({
      where: {
        id: veriftoken.id,
      },
    });
    return { userId: userId };
  };

  getAllSession = async (req: Request) => {
    const sessions = await auth.api.listSessions({
      headers: fromNodeHeaders(req.headers),
    });
    return sessions;
  };

  revokeSession = async (
    dto: z.infer<typeof RevokeSessionDTO>,
    req: Request,
  ) => {
    const { status } = await auth.api.revokeSession({
      body: {
        token: dto.sessionToken,
      },
      headers: fromNodeHeaders(req.headers),
    });

    return { status };
  };

  getAllAccount = async (req: Request) => {
    const accounts = await auth.api.listUserAccounts({
      headers: fromNodeHeaders(req.headers),
    });
    return accounts;
  };

  accountLink = async (
    dto: z.infer<typeof AccountLinkDTO>,
    session: UserSession,
    req: Request,
  ) => {
    switch (dto.method) {
      case 'CREDENTIAL': {
        if (dto.action === 'RESET') {
          await this.forgotPassword({
            email: session.user.email,
          });
          return { method: dto.method, redirect: false, url: '' };
        }

        const user = await prismaclient.user.findUnique({
          where: {
            email: session.user.email,
          },
        });
        if (!user) throw new NotFoundError();

        const { url } = await this.smtpService.sendAuthEmail({
          type: AuthEmailType.NewPassword,
          data: {
            baseCallback: `${BASE_FRONTEND_URL}/auth/reset-password`,
            receiverEmail: user.email,
            userId: user.id,
          },
        });

        return { method: dto.method, redirect: false, url: url };
      }

      case 'GOOGLE': {
        try {
          const { redirect, url } = await auth.api.linkSocialAccount({
            body: {
              provider: 'google',
              callbackURL: dto.callbackUrl,
            },
            headers: fromNodeHeaders(req.headers),
          });

          return { method: dto.method, redirect, url };
        } catch (error) {
          throw new InternalSeverError(
            `invalid link account to google ${error}`,
          );
        }
      }

      case 'DISCORD': {
        try {
          const { redirect, url } = await auth.api.linkSocialAccount({
            body: {
              provider: 'discord',
              callbackURL: dto.callbackUrl,
            },
            headers: fromNodeHeaders(req.headers),
          });

          return { method: dto.method, redirect, url };
        } catch (error) {
          throw new InternalSeverError(
            `invalid link account to discord ${error}`,
          );
        }
      }
    }
  };

  checkPassword = async (
    dto: z.infer<typeof CheckPasswordDTO>,
    userId: string,
  ) => {
    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        accounts: {
          select: {
            id: true,
            password: true,
          },
          where: {
            providerId: 'credential',
          },
        },
      },
    });

    if (!user || user.accounts.length <= 0) {
      throw new BadRequestError(
        'This user dont have credential account associated with',
      );
    }

    const account = user.accounts[0];
    if (!account.password) {
      throw new InternalSeverError(
        `User with account id ${account.id} should have hash password`,
      );
    }
    const match = await this.verifyPassword(account.password, dto.password);
    return match;
  };

  confirmEmail = async (dto: z.infer<typeof ConfirmEmailDTO>, req: Request) => {
    const veriftoken = await prismaclient.verification.findFirst({
      where: {
        identifier: VerificationIdentifier.ResetEmail,
        value: dto.token,
        expiresAt: {
          gt: currentDate(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!veriftoken) throw new BadTokenError(dto.token);

    const { userId, password } = veriftoken.metadata as {
      userId: string;
      password?: string;
    };

    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new BadTokenError(dto.token);

    const updated = await prismaclient.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    });

    if (password) {
      try {
        const { headers, response } = await this.signinWithCredential(
          {
            email: updated.email,
            password: password,
          },
          req,
        );

        await prismaclient.verification.delete({
          where: {
            id: veriftoken.id,
          },
        });
        return { headers, updated, withPassword: true as const };
      } catch (error: any) {}
    } else {
      await prismaclient.verification.delete({
        where: {
          id: veriftoken.id,
        },
      });

      return { updated, withPassword: false as const };
    }
  };

  resendConfirmEmail = async (dto: z.infer<typeof ResendConfirmEmailDTO>) => {
    const user = await prismaclient.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new NotFoundError();

    const { url } = await this.smtpService.sendAuthEmail({
      type: AuthEmailType.ResetEmail,
      data: {
        baseCallback: `${BASE_FRONTEND_URL}/auth/confirm-email`,
        receiverEmail: user.email,
        userId: user.id,
      },
    });

    return { url };
  };

  private signinWithCredential = async (
    data: {
      email: string;
      password: string;
    },
    req: Request,
  ) => {
    try {
      const { headers, response } = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
        headers: fromNodeHeaders(req.headers),
        returnHeaders: true,
        asResponses: true,
      });
      return { headers, response };
    } catch (error) {
      if (error instanceof APIError) {
        switch (error.status) {
          case 'UNAUTHORIZED':
            throw new UnauthorizedError('Invalid email or password');

          default:
            throw new InternalSeverError(
              error.body?.message || (error.status as string),
            );
        }
      }
      throw error;
    }
  };

  private verifyPassword = async (hash: string, password: string) => {
    const ctx = await auth.$context;
    return await ctx.password.verify({
      hash: hash,
      password: password,
    });
  };
}
