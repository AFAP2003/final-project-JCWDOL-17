import cors from 'cors';
import express, { Express, json, urlencoded } from 'express';
import { FRONTEND_URL, PORT } from './config';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/errors.middleware';
import { HealthRouter } from './routers/health.router';

export default class App {
  static VERSION = '1.0.0';
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(
      cors({
        origin: FRONTEND_URL,
      }),
    );
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }

  private routes(): void {
    const healthRouter = new HealthRouter();

    this.app.use('/api', healthRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/api`);
    });
  }
}
