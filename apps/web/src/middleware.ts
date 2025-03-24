import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// list of public route that unauthenticated user can safely access
const publicRoutes = [
  '/',
  '/auth/signup',
  '/auth/signin',
  '/auth/signup/set-password',
  '/admin/auth/signin',
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const { data } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  const pathIsPublic = publicRoutes.find((route) => route === currentPath);

  const isUnauthenticated = !data.user;
  if (isUnauthenticated && !pathIsPublic) {
    const url = request.nextUrl.clone();
    if (currentPath.startsWith('/admin')) {
      url.pathname = '/admin/auth/signin';
    } else {
      url.pathname = '/auth/signin';
    }
    return NextResponse.redirect(url);
  }

  const isAuthenticated = data.user;
  if (isAuthenticated) {
    const role = data.user.user_metadata.role as 'USER' | 'ADMIN' | 'SUPER';
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
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
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
