import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr';
import { Request, Response } from 'express';
import { SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY } from './config';

export function createSupabaseClient(req: Request, res: Response) {
  return createServerClient(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie || '') as any;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.append('Set-Cookie', serializeCookieHeader(name, value, options)),
        );
      },
    },
  });
}
