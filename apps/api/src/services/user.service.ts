import { prismaclient } from '@/prisma';

export class UserService {
  getByEmail = async (email: string) => {
    const user = await prismaclient.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  };

  getByReferralCode = async (code: string) => {
    const user = await prismaclient.user.findUnique({
      where: {
        referralCode: code,
      },
    });
    return user;
  };
}
