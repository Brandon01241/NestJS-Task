import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email ?? '';
  const password = body.password ?? '';

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(data ?? { message: 'Login failed' }, { status: res.status });
  }

  const accessToken = data?.accessToken as string | undefined;
  const role = data?.user?.role as string | undefined;

  if (!accessToken || !role) {
    return NextResponse.json({ message: 'Invalid login response' }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set('role', role, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
