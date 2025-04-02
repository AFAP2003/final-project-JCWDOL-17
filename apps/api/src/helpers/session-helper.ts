import { UnauthorizedError } from '@/errors';
import { Request } from 'express';

export function getSession(req: Request) {
  if (!req.session) throw new UnauthorizedError();
  return req.session;
}

export function getSessionUser(req: Request) {
  const session = getSession(req);
  if (session.user.role !== 'USER') throw new UnauthorizedError();
  return {
    session: session.session,
    user: { ...session.user, role: 'USER' as const },
  };
}

export function getSessionAdmin(req: Request) {
  const session = getSession(req);
  if (session.user.role !== 'ADMIN') throw new UnauthorizedError();
  return {
    session: session.session,
    user: { ...session.user, role: 'ADMIN' as const },
  };
}

export function getSessionSuper(req: Request) {
  const session = getSession(req);
  if (session.user.role !== 'SUPER') throw new UnauthorizedError();
  return {
    session: session.session,
    user: { ...session.user, role: 'SUPER' as const },
  };
}
