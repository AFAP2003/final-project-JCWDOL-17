import { UserUpdateBioDTO } from '@/dtos/user-update-bio-dto';
import { NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import { z } from 'zod';

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
