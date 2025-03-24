import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, json, urlencoded } from 'express';
import { FRONTEND_URL, PORT } from './config';
import {
  errorMiddleware,
  notFoundMiddleware,
} from './middlewares/errors.middleware';
import { AuthRouter } from './routers/auth.router';
import { HealthRouter } from './routers/health.router';
import { createSupabaseClient } from './supabase';

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
        credentials: true,
      }),
    );
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private handleError(): void {
    this.app.use(notFoundMiddleware);
    this.app.use(errorMiddleware);
  }

  private routes(): void {
    const healthRouter = new HealthRouter();
    const authRouter = new AuthRouter();

    this.app.use('/api', healthRouter.getRouter());
    this.app.get('/auth/confirm', async function (req, res) {
      const token_hash = req.query.token_hash as any;
      const type = req.query.type as any;
      const next = req.query.next ?? ('/' as any);
      console.log({ token_hash, type, next });
      if (token_hash && type) {
        const supabase = createSupabaseClient(req, res);
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });
        if (!error) {
          res.redirect(303, `/${next.slice(1)}`);
        }
      }
      // return the user to an error page with some instructions
      res.redirect(303, '/auth/auth-code-error');
    });
    this.app.use('/api/auth', authRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/api`);
    });
  }
}
