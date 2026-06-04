'use client';

import UserListClient from './user-list-client';
import { Card, Typography } from 'antd';

export default function UserListPage() {
  return (
    <Card>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        使用者列表
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        以分頁方式載入資料（點擊下一頁/上一頁），並每 1 分鐘自動刷新目前頁面。
      </Typography.Paragraph>
      <UserListClient />
    </Card>
  );
}
