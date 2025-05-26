import { auth } from '@/auth';
import { pagination } from '@/helpers/pagination';
import { User } from '@/interfaces/userManagement.interface';
import { prismaclient } from '@/prisma';

class UserManagementRepository {
  async getUsers(page = 1, take = 1, search = '', role = '', verified = '') {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    if (role && role !== 'all') {
    (where as any).role = role;
    }
    if (verified && verified !== 'all') {
      (where as any).emailVerified = verified === 'true';
    }
    const total = await prismaclient.user.count({ where });
    const { skip, take: realTake } = pagination(page, take);
    const data = await prismaclient.user.findMany({
      where,
      include: {
        store: true,
        addresses: true,
        managedStore: true,
      },
      skip,
      take: realTake,
    });

    return { total, data };
  }

  async getUserById(id: string) {
    return await prismaclient.user.findUnique({
      where: {
        id,
      },
      select: {
        managedStore: true,
        addresses: true,
        image: true,
      },
    });
  }

  async createUser(userData: User) {
    const existingUser = await prismaclient.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      const error = new Error('Email already exist');
      error.name = 'DuplicateEmailError';
      throw error;
    }

    if (!userData.password) {
      const error = new Error('Password not provided');
      error.name = 'NoPasswordProvided';
      throw error;
    }

    const ctx = await auth.$context;
    const { password, image, ...data } = userData;

    const user = await prismaclient.user.create({
      data: {
        email: data.email,
        emailVerified: true,
        name: data.name,
        role: 'ADMIN',
        image,
        signupMethod: {
          set: ['CREDENTIAL'],
        },
        storeId: data.storeId,
      },
    });

    // creating account
    await prismaclient.account.create({
      data: {
        accountId: user.id,
        userId: user.id,
        providerId: 'credential',
        password: await ctx.password.hash(password),
      },
    });

    if (data.storeId) {
      await prismaclient.store.update({
        where: {
          id: data.storeId,
        },
        data: {
          adminId: user.id,
        },
      });
    }
    return user;
  }

  async updateUser(id: string, userData: User) {
    const ctx = await auth.$context;
    const { password, ...data } = userData;

    const user = await prismaclient.user.update({
      where: {
        id,
      },
      data: {
        ...data,
        emailVerified: true,
      },
    });

    if (password) {
      const account = await prismaclient.account.findFirst({
        where: {
          userId: user.id,
        },
      });
      if (!account) {
        const error = new Error(
          `Fatal, no account found for userId ${user.id}`,
        );
        error.name = 'NoAccountConnected';
        throw error;
      }

      await prismaclient.account.update({
        where: {
          id: account.id,
        },
        data: {
          password: await ctx.password.hash(password),
        },
      });
    }

    return user;
  }

  async deleteUser(id: string) {
    return await prismaclient.user.delete({
      where: { id },
    });
  }
}

export default new UserManagementRepository();
