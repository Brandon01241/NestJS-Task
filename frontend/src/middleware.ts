import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (pathname === '/') {
    if (token) return NextResponse.redirect(new URL('/user', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/user')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/user', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/user/:path*', '/login'],
};

