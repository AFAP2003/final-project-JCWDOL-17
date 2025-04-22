import { toNodeHandler } from 'better-auth/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, json, urlencoded } from 'express';
import { auth } from './auth';
import { BASE_FRONTEND_URL, PORT } from './config';
import { withError, withNotFound } from './middlewares/errors.middleware';
import { AuthRouter } from './routers/auth.router';
import { HealthRouter } from './routers/health.router';
import { TokenRouter } from './routers/token.router';
import { UserRouter } from './routers/user.router';
import apiRouter from './routers/dashboardApi.router';

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
        origin: BASE_FRONTEND_URL,
        credentials: true,
      }),
    );
    this.app.all('/api/better/auth/*', toNodeHandler(auth));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private handleError(): void {
    this.app.use(withNotFound);
    this.app.use(withError);
  }

  private routes(): void {
    const healthRouter = new HealthRouter();
    const authRouter = new AuthRouter();
    const userRouter = new UserRouter();
    const tokenRouter = new TokenRouter();

    this.app.use('/api', healthRouter.getRouter());
    this.app.use('/api/auth', authRouter.getRouter());
    this.app.use('/api/user', userRouter.getRouter());
    this.app.use('/api/token', tokenRouter.getRouter());
    this.app.use('/api/dashboard', apiRouter)

  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/api`);
    });
  }
}
