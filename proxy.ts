import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { VARIANT_COOKIE_NAME, VARIANT_COOKIE_MAX_AGE } from '@/lib/constants';

const VARIANTS = ['A', 'B', 'C', 'D', 'E'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== '/') return NextResponse.next();

  const response = NextResponse.next();

  if (!request.cookies.get(VARIANT_COOKIE_NAME)) {
    const id = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    response.cookies.set(VARIANT_COOKIE_NAME, id, {
      maxAge: VARIANT_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: '/',
};
