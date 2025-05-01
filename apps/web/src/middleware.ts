import { betterFetch } from '@better-fetch/fetch';
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { authClient } from './lib/auth/client';
import { Session } from './lib/types/session';

// list of public route, Unauthenticated user can safely access.
const publicRoutes = [
  '/',
  '/auth/signup',
  '/auth/signup/set-password',
  '/auth/signin',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/admin/auth/signin',
  '/admin/auth/signin/confirm',
];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {});
  const currentPath = request.nextUrl.pathname;
  const pathIsPublic = publicRoutes.find((route) => route === currentPath);

  const isAuthenticated = sessionCookie != null;

  if (!isAuthenticated && !pathIsPublic) {
    const url = request.nextUrl.clone();
    if (currentPath.startsWith('/admin')) {
      url.pathname = '/admin/auth/signin';
    } else {
      url.pathname = '/auth/signin';
    }
    return NextResponse.redirect(url);
  }

  if (isAuthenticated) {
    try {
      const { data: session, error } = await betterFetch<
        typeof authClient.$Infer.Session
      >('/api/better/auth/get-session', {
        baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
        headers: {
          cookie: request.headers.get('cookie') || '', // Forward the cookies from the request
        },
      });

      if (error) {
        console.error('Session fetch error:', error);
        return NextResponse.error(); // This triggers the default Next.js error page (500 error)
      }

      // Posible case when user revoke other session, or reset password
      if (!session) {
        const url = request.nextUrl.clone();
        if (currentPath.startsWith('/admin')) {
          url.pathname = '/admin/auth/signin';
        } else {
          url.pathname = '/auth/signin';
        }
        const response = NextResponse.redirect(url);
        response.cookies.set('better-auth.session_token', '', {
          path: '/',
          maxAge: 0,
        });
        return response;
      }

      const { user } = session as unknown as Session;

      const role = user?.role;
      switch (role) {
        case 'USER': {
          if (currentPath.startsWith('/admin') && !pathIsPublic) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/auth/signin';
            return NextResponse.redirect(url);
          }
          break;
        }

        default: {
          if (!currentPath.startsWith('/admin') && !pathIsPublic) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/signin';
            return NextResponse.redirect(url);
          }
          break;
        }
      }
    } catch (error) {
      return NextResponse.next({
        request,
      });
    }
  }

  return NextResponse.next({
    request,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
