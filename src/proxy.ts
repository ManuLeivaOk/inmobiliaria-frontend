import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PROTECTED_PREFIX, REFRESH_COOKIE_NAME } from '@/lib/auth/constants';

/**
 * Cambio de convención: ahora se exporta la función 'proxy'
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith(PROTECTED_PREFIX) &&
    !request.cookies.has(REFRESH_COOKIE_NAME)
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// El config matcher se mantiene igual
export const config = {
  matcher: ['/dashboard/:path*'],
};