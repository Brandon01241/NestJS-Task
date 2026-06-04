import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const page = url.searchParams.get('page') ?? '1';
  const limit = url.searchParams.get('limit') ?? '10';
  const q = url.searchParams.get('q') ?? '';

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const qs = new URLSearchParams({ page, limit });
  if (q.trim()) qs.set('q', q);
  const res = await fetch(`${apiBaseUrl}/users?${qs.toString()}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'Upstream error' }, { status: res.status });
}

export async function POST(request: Request) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid body' }, { status: 400 });

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const res = await fetch(`${apiBaseUrl}/users`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'Upstream error' }, { status: res.status });
}
