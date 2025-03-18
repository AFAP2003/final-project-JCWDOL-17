import { ApiError, InternalSeverError } from '@/errors';
import { HealthServices } from '@/services/health.services';
import { Request, Response } from 'express';

export class HealthController {
  private healthService = new HealthServices();

  healthcheck = async (req: Request, res: Response) => {
    try {
      const result = await this.healthService.healthcheck();
      res.json(result);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        const err = error as Error;
        throw new InternalSeverError(err);
      }
      throw error;
    }
  };
}
