'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card, Descriptions, Space, Spin, Tag, Typography } from 'antd';

type UserItem = { id: number; name: string; age: number; hkidNumber: string };
type Envelope<T> = { total: number; page: number; limit: number; data: T[] };

async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const data = (await res.json()) as Envelope<UserItem>;
  if (!res.ok) throw new Error((data as any)?.message ?? 'Fetch failed');
  const user = data.data?.[0];
  if (!user) throw new Error('User not found');
  return user;
}

export default function UserDetailClient({ id, role }: { id: string; role: string }) {
  const router = useRouter();
  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHkid, setShowHkid] = useState<boolean>(() => !isAdmin);

  async function load() {
    if (!/^\d+$/.test(id)) {
      setUser(null);
      setError('User ID 必須是整數');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const u = await fetchUser(id);
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setShowHkid(!isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      load();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [id]);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
          使用者詳情
        </Typography.Title>
        <Button onClick={() => router.push('/user')}>返回列表</Button>
      </div>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        每 1 分鐘自動刷新資料。
      </Typography.Paragraph>

      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Descriptions bordered size="middle" column={1}>
          <Descriptions.Item label="ID">{user?.id ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Name">{user?.name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Age">{user?.age ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="HKID">
            <Space>
              <Typography.Text code>{user ? (showHkid ? user.hkidNumber : '••••••••') : '-'}</Typography.Text>
              {isAdmin ? (
                <Button
                  onClick={() => setShowHkid((v) => !v)}
                  disabled={!user || loading}
                  size="small"
                >
                  {showHkid ? '隱藏' : '顯示'}
                </Button>
              ) : null}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={8}>
            <Tag>Role: {role}</Tag>
            {loading ? <Spin size="small" /> : null}
          </Space>
          <Typography.Text type="secondary">{loading ? '更新中…' : '已同步'}</Typography.Text>
        </div>
      </Space>
    </Card>
  );
}
