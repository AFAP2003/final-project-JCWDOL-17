import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { config } from 'dotenv';
import { resolve } from 'path';

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
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'SUPER',
      signupMethod: 'CREDENTIAL',
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

  const email = process.env.DUMMY_STORE_ADMIN_EMAIL;
  if (!email) {
    return { adminId: null };
  }
  const password = process.env.DUMMY_STORE_ADMIN_PASSWORD;
  if (!password) {
    return { adminId: null };
  }
  // Seed Super Admin
  const user = await prisma.user.create({
    data: {
      email: email,
      emailVerified: true,
      firstName: 'Alice',
      lastName: 'Doe',
      fullName: 'Alice Doe',
      role: 'ADMIN',
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

  return { adminId: user.id };
}

async function SEED_USER() {
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
