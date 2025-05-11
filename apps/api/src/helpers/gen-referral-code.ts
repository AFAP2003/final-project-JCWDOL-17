import { prismaclient } from '@/prisma';
import { genRandomString } from './gen-random-string';

async function isCodeUnique(code: string) {
  const exist = await prismaclient.user.findUnique({
    where: {
      referralCode: code,
    },
  });
  return !exist;
}

type Option = {
  length: number;
  maxRetries: number;
};

const defaultopt = {
  length: 10,
  maxRetries: 10,
};

export async function genReferralCode(
  opt: Option = defaultopt,
): Promise<string> {
  for (let attempt = 0; attempt < opt.maxRetries; attempt++) {
    const code = genRandomString(opt.length).toUpperCase();
    if (await isCodeUnique(code)) {
      return `REFFCODE-${code}`;
    }
  }

  throw new Error('Failed to generate a unique referral code.');
}
