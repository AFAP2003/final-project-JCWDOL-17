import { auth } from '@/auth';
import { BASE_FRONTEND_URL, CRYPTO_SECRET } from '@/config';
import { AccountLinkDTO } from '@/dtos/account-link.dto';
import { ForgotPasswordDTO } from '@/dtos/forgot-password.dto';
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
import { TooManyRequestError } from '@/errors/400-too-many-request.error';
import { createZodError } from '@/helpers/create-zod-error';
import { currentDate } from '@/helpers/datetime';
import { aesEncrypt } from '@/helpers/encrypt-decrypt';
import { genRandomString } from '@/helpers/gen-random-string';
import { genReferralCode } from '@/helpers/gen-referral-code';
import { prismaclient } from '@/prisma';
import { UserSession } from '@/types/user-session.type';
import { UserRole } from '@prisma/client';
import { APIError } from 'better-auth/api';
import { fromNodeHeaders } from 'better-auth/node';
import { addHours, format } from 'date-fns';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';
import { SMTPService } from './smtp.service';
import { UserService } from './user.service';

type SendAuthEmailParam =
  | {
      type: AuthEmailType.SignupConfirmation;
      data: {
        receiverEmail: string;
        name: string;
        referralCode?: string | undefined;
        baseCallback: string;
      };
    }
  | {
      type: AuthEmailType.SigninNotification;
      data: {
        receiverEmail: string;
        userId: string;
        sessionToken: string;
        baseCallback: string;
      };
    }
  | {
      type: AuthEmailType.SigninConfirmation;
      data: {
        receiverEmail: string;
        baseCallback: string;
        password: string;
        role: 'USER' | 'ADMIN' | 'SUPER';
      };
    }
  | {
      type: AuthEmailType.ResetPassword | AuthEmailType.NewPassword;
      data: {
        receiverEmail: string;
        userId: string;
        baseCallback: string;
      };
    };

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

    const { url } = await this.sendAuthEmail({
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
          });

          if (!veriftoken) throw new BadTokenError(dto.token);

          const { email, name, referralCode } = veriftoken.metadata as {
            email: string;
            name: string;
            referralCode?: string;
          };

          let referredById = undefined;
          if (referralCode) {
            // TODO:
            // - find referred with this referral code
            // - add voucher
            // - assign referredById to the id of referred
          }

          const { token, user } = await auth.api.signUpEmail({
            body: {
              role: dto.role,
              email: email,
              password: dto.password,
              name: name,
              signupMethod: [dto.signupMethod],
              referralCode: await genReferralCode(),
              referredById: referredById,
            },
            headers: fromNodeHeaders(req.headers),
          });

          await prismaclient.user.update({
            where: {
              id: user.id,
            },
            data: {
              emailVerified: true,
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

    const { url } = await this.sendAuthEmail({
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

            const { url } = await this.sendAuthEmail({
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
            };
          } catch (error: any) {
            throw new InternalSeverError(
              new Error(`should be valid login, got error instead ${error}`),
            );
          }
        } else {
          const veriftoken = await prismaclient.verification.findFirst({
            where: {
              identifier: VerificationIdentifier.SigninConfirmation,
              value: dto.token,
              expiresAt: {
                gt: currentDate(),
              },
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

    const { url } = await this.sendAuthEmail({
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

        const { url } = await this.sendAuthEmail({
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
    }
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

  private async sendAuthEmail(param: SendAuthEmailParam) {
    switch (param.type) {
      case AuthEmailType.SignupConfirmation: {
        const satuJamKedepan = addHours(currentDate(), 1);
        const token = genRandomString(25);
        const exchangetoken = aesEncrypt(token, CRYPTO_SECRET);

        const verifrecord = await prismaclient.verification.findMany({
          where: {
            metadata: {
              path: ['email'],
              equals: param.data.receiverEmail,
            },
          },
        });
        if (verifrecord.length >= 3) {
          throw new TooManyRequestError();
        }

        await prismaclient.verification.create({
          data: {
            expiresAt: satuJamKedepan,
            identifier: VerificationIdentifier.SignupConfirmation,
            value: token,
            metadata: {
              email: param.data.receiverEmail,
              name: param.data.name,
              referralCode: param.data.referralCode,
            },
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}`;

        this.smtpService.sendMail({
          tmplname: 'signup-confirmation',
          to: param.data.receiverEmail,
          subject: 'Signup Confirmation',
          data: {
            url: url,
            expiredAt: format(satuJamKedepan, 'yyyy-MM-dd HH:mm:ss'),
            currentYear: currentDate().getFullYear(),
          },
        });
        return { url };
      }

      case AuthEmailType.SigninConfirmation: {
        const veriftokens = await prismaclient.verification.findMany({
          where: {
            identifier: VerificationIdentifier.SigninConfirmation,
            metadata: {
              path: ['email'],
              equals: param.data.receiverEmail,
            },
            expiresAt: {
              gt: currentDate(),
            },
          },
        });
        if (veriftokens.length >= 3) {
          throw new TooManyRequestError();
        }

        const satuJamKedepan = addHours(currentDate(), 1);
        const token = genRandomString(25);
        const exchangetoken = aesEncrypt(token, CRYPTO_SECRET);

        await prismaclient.verification.create({
          data: {
            expiresAt: satuJamKedepan,
            identifier: VerificationIdentifier.SigninConfirmation,
            metadata: {
              email: param.data.receiverEmail,
              password: param.data.password,
              role: param.data.role,
            },
            value: token,
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}`;

        this.smtpService.sendMail({
          tmplname: 'signin-confirmation',
          subject: 'Signin Confirmation',
          to: param.data.receiverEmail,
          data: {
            receiver: param.data.receiverEmail,
            url: url,
            expiredAt: format(satuJamKedepan, 'yyyy-MM-dd HH:mm:ss'),
            currentYear: currentDate().getFullYear(),
          },
        });
        return { url };
      }

      case AuthEmailType.SigninNotification: {
        const session = await prismaclient.session.findUnique({
          where: {
            token: param.data.sessionToken,
          },
        });

        const uainfo = UAParser(session?.userAgent || '');
        const satuJamKedepan = addHours(currentDate(), 1);
        const token = genRandomString(25);
        const exchangetoken = aesEncrypt(token, CRYPTO_SECRET);

        await prismaclient.verification.create({
          data: {
            expiresAt: satuJamKedepan,
            identifier: VerificationIdentifier.AnonymusSignin,
            metadata: {
              userId: param.data.userId,
            },
            value: token,
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}&intend=${VerificationIdentifier.AnonymusSignin}`;

        this.smtpService.sendMail({
          tmplname: 'signin-notification',
          subject: 'Signin Notification',
          to: param.data.receiverEmail,
          data: {
            receiver: param.data.receiverEmail,
            signinAt: session?.createdAt,
            device: `${uainfo.os.name}/${uainfo.browser.name}`,
            url: url,
            expiredAt: format(satuJamKedepan, 'yyyy-MM-dd HH:mm:ss'),
            currentYear: currentDate().getFullYear(),
          },
        });
        return { url };
      }

      case AuthEmailType.ResetPassword: {
        const verifTokenExist = await prismaclient.verification.findMany({
          where: {
            identifier: VerificationIdentifier.ResetPassword,
            metadata: {
              path: ['userId'],
              equals: param.data.userId,
            },
            expiresAt: {
              gt: currentDate(),
            },
          },
        });

        if (verifTokenExist.length >= 3) {
          throw new TooManyRequestError();
        }

        const satuJamKedepan = addHours(currentDate(), 1);
        const token = genRandomString(25);
        const exchangetoken = aesEncrypt(token, CRYPTO_SECRET);

        await prismaclient.verification.create({
          data: {
            expiresAt: satuJamKedepan,
            identifier: VerificationIdentifier.ResetPassword,
            metadata: {
              userId: param.data.userId,
            },
            value: token,
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}&intend=${VerificationIdentifier.ResetPassword}`;

        this.smtpService.sendMail({
          tmplname: 'reset-password',
          subject: 'Reset Password',
          to: param.data.receiverEmail,
          data: {
            receiver: param.data.receiverEmail,
            url: url,
            expiredAt: format(satuJamKedepan, 'yyyy-MM-dd HH:mm:ss'),
            currentYear: currentDate().getFullYear(),
          },
        });
        return { url };
      }

      case AuthEmailType.NewPassword: {
        const verifTokenExist = await prismaclient.verification.findMany({
          where: {
            identifier: VerificationIdentifier.NewPassword,
            metadata: {
              path: ['userId'],
              equals: param.data.userId,
            },
            expiresAt: {
              gt: currentDate(),
            },
          },
        });

        if (verifTokenExist.length >= 3) {
          throw new TooManyRequestError();
        }

        const satuJamKedepan = addHours(currentDate(), 1);
        const token = genRandomString(25);
        const exchangetoken = aesEncrypt(token, CRYPTO_SECRET);

        await prismaclient.verification.create({
          data: {
            expiresAt: satuJamKedepan,
            identifier: VerificationIdentifier.NewPassword,
            metadata: {
              userId: param.data.userId,
            },
            value: token,
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}&intend=${VerificationIdentifier.NewPassword}`;

        this.smtpService.sendMail({
          tmplname: 'new-password',
          subject: 'Set New Password',
          to: param.data.receiverEmail,
          data: {
            receiver: param.data.receiverEmail,
            url: url,
            expiredAt: format(satuJamKedepan, 'yyyy-MM-dd HH:mm:ss'),
            currentYear: currentDate().getFullYear(),
          },
        });
        return { url };
      }
    }
  }
}
