import { cookies } from 'next/headers';
import UserDetailClient from './user-detail-client';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const role = (await cookies()).get('role')?.value ?? 'USER';
  const { id } = await params;
  return <UserDetailClient id={id} role={role} />;
}
