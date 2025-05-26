import { auth } from '@/auth';
import { BASE_FRONTEND_URL } from '@/config';
import { UserUpdateBioDTO } from '@/dtos/user-update-bio-dto';
import { UserUpdateEmailDTO } from '@/dtos/user-update-email.dto';
import { AuthEmailType } from '@/enums/auth-email-type';
import { NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import { z } from 'zod';
import { SMTPService } from './smtp.service';

export class UserService {
  private smtpService = new SMTPService();

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

  updateImage = async ({
    userId,
    image,
  }: {
    userId: string;
    image: string;
  }) => {
    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundError();

    const updated = await prismaclient.user.update({
      where: {
        id: user.id,
      },
      data: {
        image: image,
      },
    });
    return { user: updated };
  };

  updateBio = async (dto: z.infer<typeof UserUpdateBioDTO>, userId: string) => {
    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundError();

    const updated = await prismaclient.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: dto.name,
        dateOfBirth: dto.dateOfBirth ? dto.dateOfBirth : null,
        gender: dto.gender ? dto.gender : null,
        phone: dto.phone ? dto.phone : null,
      },
    });
    return { user: updated };
  };

  updateEmail = async (
    dto: z.infer<typeof UserUpdateEmailDTO>,
    userId: string,
  ) => {
    const user = await prismaclient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundError();

    await prismaclient.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: dto.newEmail,
        emailVerified: false,
      },
    });

    const { url } = await this.smtpService.sendAuthEmail({
      type: AuthEmailType.ResetEmail,
      data: {
        baseCallback: `${BASE_FRONTEND_URL}/auth/confirm-email`,
        receiverEmail: user.email,
        userId: user.id,
        password: dto.password,
      },
    });

    const ctx = await auth.$context;
    await ctx.internalAdapter.deleteSessions(userId); // remove all session

    return { url };
  };

  getAvailableAdmin = async () => {
    const admins = prismaclient.user.findMany({
      where: {
        role: 'ADMIN',
        storeId: null,
      },
    });
    return admins;
  };
}
