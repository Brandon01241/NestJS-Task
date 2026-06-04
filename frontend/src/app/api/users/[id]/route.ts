import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const res = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'Upstream error' }, { status: res.status });
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const res = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'Upstream error' }, { status: res.status });
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid body' }, { status: 400 });

  const { id } = await context.params;

  const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3002';
  const res = await fetch(`${apiBaseUrl}/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { message: 'Upstream error' }, { status: res.status });
}
