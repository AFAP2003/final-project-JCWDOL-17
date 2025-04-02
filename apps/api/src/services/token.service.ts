import { CRYPTO_SECRET } from '@/config';
import { ExchangeTokenDTO } from '@/dtos/exchange-token.dto';
import { BadRequestError } from '@/errors';
import { currentDate } from '@/helpers/datetime';
import { aesDecrypt } from '@/helpers/encrypt-decrypt';
import { prismaclient } from '@/prisma';
import { z } from 'zod';

export class TokenService {
  exchange = async (dto: z.infer<typeof ExchangeTokenDTO>) => {
    const realtoken = aesDecrypt(dto.token, CRYPTO_SECRET);
    const valid = await prismaclient.verification.findFirst({
      where: {
        identifier: dto.identifier,
        value: realtoken,
        expiresAt: {
          gt: currentDate(),
        },
      },
    });

    if (!valid) throw new BadRequestError(`Bad token ${dto.token}`);
    return realtoken;
  };
}
