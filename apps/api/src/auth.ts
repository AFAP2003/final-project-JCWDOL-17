import { APIError, betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, customSession } from 'better-auth/plugins';
import { v4 as uuid } from 'uuid';

import { User } from '@prisma/client';
import {
  BASE_API_URL,
  BASE_FRONTEND_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from './config';
import { genReferralCode } from './helpers/gen-referral-code';
import { prismaclient } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prismaclient, {
    provider: 'postgresql',
  }),
  trustedOrigins: [BASE_FRONTEND_URL],
  baseURL: `${BASE_API_URL}/api/better/auth`,
  advanced: {
    generateId: (opt) => {
      return uuid();
    },
  },

  user: {
    fields: {
      name: 'fullName',
    },
    additionalFields: {
      role: {
        type: 'string',
        fieldName: 'role',
        required: true,
      },
      firstName: {
        type: 'string',
        fieldName: 'firstName',
        required: true,
      },
      lastName: {
        type: 'string',
        fieldName: 'lastName',
        required: true,
      },
      signupMethod: {
        type: 'string[]',
        fieldName: 'signupMethod',
        required: true,
      },
      referralCode: {
        type: 'string',
        fieldName: 'referralCode',
        required: false,
      },
      referredById: {
        type: 'string',
        fieldName: 'referredById',
        required: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: false,
      allowDifferentEmails: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      mapProfileToUser: async (profile) => {
        const names = profile.name.split(' ');
        return {
          role: 'USER',
          firstName: names[0],
          lastName: names.length > 1 ? names.slice(1).join(' ') : '',
          fullName: profile.name,
          email: profile.email,
          emailVerified: true,
          image: profile.picture,
          signupMethod: ['SOCIAL'],
          referralCode: await genReferralCode(),
        };
      },
    },
  },

  databaseHooks: {
    account: {
      create: {
        after: async (account, context) => {
          const user = await prismaclient.user.findUnique({
            where: {
              id: account.userId,
            },
          });
          if (!user) {
            // Imposible Path
            throw new APIError('INTERNAL_SERVER_ERROR', {
              code: '',
              message: 'Account created without user id',
            });
          }

          if (account.providerId === 'credential') {
            if (!user.signupMethod.includes('CREDENTIAL')) {
              await prismaclient.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  signupMethod: {
                    push: 'CREDENTIAL',
                  },
                },
              });
            }
          } else {
            if (!user.signupMethod.includes('SOCIAL')) {
              await prismaclient.user.update({
                where: {
                  id: user.id,
                },
                data: {
                  signupMethod: {
                    push: 'SOCIAL',
                  },
                },
              });
            }
          }
        },
      },
    },
  },

  logger: {
    disabled: true,
  },

  plugins: [
    customSession(async ({ user, session }) => {
      const { name, ...rest } = user;
      return {
        user: { fullName: name, ...rest } as unknown as User,
        session,
      };
    }),
    bearer(),
  ],
});
