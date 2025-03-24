import { prismaclient } from '@/prisma';
import crypto from 'crypto';

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
  length: 8,
  maxRetries: 10,
};

/**
 * Generates a unique referral code with minimal duplicates.
 * @param {number} opt.length - The length of the referral code.
 * @param {number} opt.maxRetries - Maximum retries in case of collision.
 * @returns {string} - A unique referral code.
 */
export async function generateReferralCode(
  opt: Option = defaultopt,
): Promise<string> {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let attempt = 0; attempt < opt.maxRetries; attempt++) {
    let code = Array.from(
      { length: opt.length },
      () => charset[crypto.randomInt(0, charset.length)],
    ).join('');

    if (await isCodeUnique(code)) {
      return `REF-${code}`;
    }
  }

  throw new Error('Failed to generate a unique referral code.');
}
