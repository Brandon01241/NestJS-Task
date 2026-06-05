'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? '登入失敗');
      return;
    }

    router.replace('/user');
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 24 }}>
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            登入
          </Typography.Title>
          <Typography.Text type="secondary">
            請輸入 Email 與密碼，登入成功後會自動跳轉到 /user。
          </Typography.Text>
        </div>

        <Card>
          <Form layout="vertical" onFinish={onSubmit}>
            <Form.Item label="Email" required>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item label="密碼" required>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Form.Item>

            {error ? <Alert type="error" showIcon title={error} /> : null}

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', marginTop: 12 }}
            >
              登入
            </Button>
          </Form>
        </Card>

        <Card size="small">
          <Typography.Text type="secondary">
            ADMIN: admin@example.com / admin123
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">USER: user@example.com / user123</Typography.Text>
        </Card>
      </Space>
    </div>
  );
}
