'use client';

import { usePathname } from 'next/navigation';
import { Button, ConfigProvider, Layout } from 'antd';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLogout = pathname === '/login';

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            paddingInline: 16,
          }}
        >
          <div
            style={{
              margin: '0 auto',
              maxWidth: 960,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <a href="/user" style={{ fontWeight: 600 }}>
              User Information
            </a>
            {hideLogout ? null : (
              <form action="/api/logout" method="post">
                <Button htmlType="submit">Logout</Button>
              </form>
            )}
          </div>
        </Layout.Header>
        <Layout.Content style={{ padding: 16 }}>
          <div style={{ margin: '0 auto', maxWidth: 960 }}>{children}</div>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
