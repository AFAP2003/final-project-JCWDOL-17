import { Category, PrismaClient, Product, Store, User } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { add } from 'date-fns/add';
import { config } from 'dotenv';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
});

async function SEED_SUPER_ADMIN() {
  const ctx = await auth.$context;

  const superemail = process.env.SUPER_ADMIN_EMAIL;
  if (!superemail) {
    throw new Error('No super admin email was provided on evironment');
  }
  const superpassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!superpassword) {
    throw new Error('No super admin password was provided on evironment');
  }
  // Seed Super Admin
  const superadmin = await prisma.user.create({
    data: {
      email: superemail,
      emailVerified: true,
      name: 'John Doe',
      role: 'SUPER',
      signupMethod: {
        set: ['CREDENTIAL'],
      },
    },
  });

  await prisma.account.create({
    data: {
      accountId: superadmin.id,
      userId: superadmin.id,
      providerId: 'credential',
      password: await ctx.password.hash(superpassword),
    },
  });

  return { superId: superadmin.id };
}

async function SEED_STORE_ADMIN() {
  const ctx = await auth.$context;

  const admins: User[] = [];
  for (const data of datas) {
    const admin = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: true,
        name: data.name,
        role: 'ADMIN',
        signupMethod: {
          set: ['CREDENTIAL'],
        },
      },
    });
    await prisma.account.create({
      data: {
        accountId: admin.id,
        userId: admin.id,
        providerId: 'credential',
        password: await ctx.password.hash('@Password123'),
      },
    });
    admins.push(admin);
  }

  return admins;
}

async function SEED_USER() {
  const datas = [
    {
      email: 'luffy.gogrocery@mailinator.com',
      name: 'Monkey D. Luffy',
    },
    {
      email: 'naruto.gogrocery@mailinator.com',
      name: 'Uzumaki Naruto',
    },
  ];

  const ctx = await auth.$context;

  const email = process.env.DUMMY_USER_EMAIL;
  if (!email) {
    return { userId: null };
  }
  const password = process.env.DUMMY_USER_PASSWORD;
  if (!password) {
    return { userId: null };
  }
  // Seed Super Admin
  const user = await prisma.user.create({
    data: {
      email: email,
      emailVerified: true,
      firstName: 'Loki',
      lastName: 'Doe',
      fullName: 'Loki Doe',
      role: 'USER',
      signupMethod: 'CREDENTIAL',
    },
  });

  await prisma.account.create({
    data: {
      accountId: user.id,
      userId: user.id,
      providerId: 'credential',
      password: await ctx.password.hash(password),
    },
  });

  return { userId: user.id };
}

async function main() {
  ['.env', 'env.local'].forEach((envfile) =>
    config({ path: resolve(__dirname, `../${envfile}`), override: true }),
  );

  // SEED HERE
  const { superId } = await SEED_SUPER_ADMIN();
  const { adminId } = await SEED_STORE_ADMIN();
  const { userId } = await SEED_USER();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
