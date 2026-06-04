import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
  response.cookies.set('role', '', { httpOnly: false, path: '/', maxAge: 0 });
  return response;
}
