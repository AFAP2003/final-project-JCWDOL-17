import { UserSession } from './src/types/user-session.type';

declare global {
  namespace Express {
    interface Request {
      session?: UserSession;
    }
  }
}

export {};
