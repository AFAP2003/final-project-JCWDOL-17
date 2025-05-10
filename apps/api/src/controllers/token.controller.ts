import { ExchangeTokenDTO } from '@/dtos/exchange-token.dto';
import {
  ApiError,
  InternalSeverError,
  UnprocessableEntityError,
} from '@/errors';
import { formatZodError } from '@/helpers/format-zod-error';
import { TokenService } from '@/services/token.service';
import { Request, Response } from 'express';

export class TokenController {
  private tokenService = new TokenService();

  exchange = async (req: Request, res: Response) => {
    const { data: dto, error } = ExchangeTokenDTO.safeParse(req.body);
    if (error) {
      throw new UnprocessableEntityError(formatZodError(error));
    }

    try {
      const realtoken = await this.tokenService.exchange(dto);
      res.json({ token: realtoken });
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
