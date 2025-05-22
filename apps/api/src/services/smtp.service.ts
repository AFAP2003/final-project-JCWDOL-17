import { CRYPTO_SECRET } from '@/config';
import { AuthEmailType } from '@/enums/auth-email-type';
import { VerificationIdentifier } from '@/enums/verification-identifier';
import { TooManyRequestError } from '@/errors/400-too-many-request.error';
import { currentDate } from '@/helpers/datetime';
import { aesEncrypt } from '@/helpers/encrypt-decrypt';
import { genRandomString } from '@/helpers/gen-random-string';
import { prismaclient } from '@/prisma';
import { mailerclient } from '@/smtp';
import { TemplateName } from '@/types/template.type';
import { addHours, format } from 'date-fns';
import fs from 'fs';
import hb from 'handlebars';
import path from 'path';
import { UAParser } from 'ua-parser-js';
// import { SMTPService } from './smtp.service';

let TEMPLATE_CONTAINER: Record<string, ReturnType<typeof hb.compile>> | null =
  null;

type SendParams = {
  tmplname: TemplateName;
  to: string;
  subject: string;
  data?: Record<string, any>;
};

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
    }
  | {
      type: AuthEmailType.ResetEmail;
      data: {
        receiverEmail: string;
        userId: string;
        password?: string;
        baseCallback: string;
      };
    };

export class SMTPService {
  constructor() {
    if (!TEMPLATE_CONTAINER) SMTPService.compileTemplate();
  }

  /**
   * Sends an email using the specified template and parameters.
   *
   * @param {SendParams} param - The parameters required to send an email.
   * @param {string} param.to - Recipient's email address.
   * @param {string} param.subject - Email subject line.
   * @param {TemplateName} param.tmplname - The name of the email template to use.
   * @param {Record<string, any>} param.data - Data to populate the template.
   *
   * @throws {Error} If the template does not exist.
   */
  public sendMail = async (param: SendParams) => {
    const template = TEMPLATE_CONTAINER![param.tmplname];
    const html = template(param.data);
    return await mailerclient.sendMail({
      to: param.to,
      subject: param.subject,
      html: html,
    });
  };

  private static compileTemplate = () => {
    if (TEMPLATE_CONTAINER !== null) return;

    TEMPLATE_CONTAINER = {};
    const dirpath = path.resolve(__dirname, '../templates');

    try {
      const files = fs.readdirSync(dirpath);
      const hbsFiles = files.filter((file) => path.extname(file) === '.hbs');

      hbsFiles.forEach((filename) => {
        const key = path.basename(filename, '.hbs');
        const fileContent = fs.readFileSync(
          path.join(dirpath, filename),
          'utf-8',
        );
        const compiledtmpl = hb.compile(fileContent);

        TEMPLATE_CONTAINER![key] = compiledtmpl;
      });
    } catch (error: any) {
      throw new Error(
        `SMTPService: error compiling template: ${error.toString()}`,
      );
    }
  };

  public async sendAuthEmail(param: SendAuthEmailParam) {
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

        this.sendMail({
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

        this.sendMail({
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

        this.sendMail({
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

        this.sendMail({
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

        this.sendMail({
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

      case AuthEmailType.ResetEmail: {
        const verifTokenExist = await prismaclient.verification.findMany({
          where: {
            identifier: VerificationIdentifier.ResetEmail,
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
            identifier: VerificationIdentifier.ResetEmail,
            metadata: {
              userId: param.data.userId,
              password: param.data.password || null,
            },
            value: token,
          },
        });

        // TODO: Setup Worker for removing after 1 hour

        const url = `${param.data.baseCallback}?token=${exchangetoken}`;

        this.sendMail({
          tmplname: 'new-email',
          subject: 'Confirm your email',
          to: param.data.receiverEmail,
          data: {
            receiver: param.data.receiverEmail,
            userId: param.data.userId,
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
