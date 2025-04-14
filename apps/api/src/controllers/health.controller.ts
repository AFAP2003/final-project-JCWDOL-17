import { ApiError, InternalSeverError } from '@/errors';
import { HealthService } from '@/services/health.service';
import { Request, Response } from 'express';

export class HealthController {
  private healthService = new HealthService();

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
