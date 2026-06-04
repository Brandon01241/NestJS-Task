'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

type UserItem = { id: number; name: string; age: number };
type Envelope<T> = { total: number; page: number; limit: number; data: T[] };

type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  age: number;
  hkidNumber: string;
  role?: 'ADMIN' | 'USER';
};

type UserDetail = {
  id: number;
  email?: string;
  name: string;
  age: number;
  hkidNumber: string;
  role?: 'ADMIN' | 'USER';
};

type UpdateUserInput = {
  name?: string;
  age?: number;
  hkidNumber?: string;
  role?: 'ADMIN' | 'USER';
  password?: string;
};

function getCookieValue(name: string) {
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

async function fetchUsers(page: number, limit: number, q: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q.trim()) qs.set('q', q.trim());
  const res = await fetch(`/api/users?${qs.toString()}`, { cache: 'no-store' });
  const data = (await res.json()) as Envelope<UserItem>;
  if (!res.ok) throw new Error((data as any)?.message ?? 'Fetch failed');
  return data;
}

async function createUser(input: CreateUserInput) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message ?? 'Create failed');
  return data;
}

async function fetchUserById(id: number) {
  const res = await fetch(`/api/users/${id}`, { cache: 'no-store' });
  const data = (await res.json()) as Envelope<UserDetail>;
  if (!res.ok) throw new Error((data as any)?.message ?? 'Fetch failed');
  const user = data.data?.[0];
  if (!user) throw new Error('User not found');
  return user;
}

async function updateUser(id: number, input: UpdateUserInput) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message ?? 'Update failed');
  return data;
}

async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message ?? 'Delete failed');
  return data;
}

export default function UserListClient() {
  const limit = 10;
  const [items, setItems] = useState<UserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [role, setRole] = useState<string>('USER');
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editFetching, setEditFetching] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [form] = Form.useForm<CreateUserInput>();
  const [editForm] = Form.useForm<UpdateUserInput>();
  const inFlightRef = useRef(false);
  const pageRef = useRef(1);
  const qRef = useRef('');

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function loadPage(p: number, qValue: string) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const next = await fetchUsers(p, limit, qValue);
      setTotal(next.total);
      setPage(next.page);
      setItems(next.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }

  useEffect(() => {
    setRole(getCookieValue('role') ?? 'USER');
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadPage(pageRef.current, qRef.current);
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    qRef.current = debouncedQ;
    loadPage(1, debouncedQ);
  }, [debouncedQ]);

  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(id);
  }, [success]);

  const columns: ColumnsType<UserItem> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age', width: 100 },
    {
      title: '',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button type="link" href={`/user/${record.id}`}>
            查看
          </Button>
          {isAdmin ? (
            <Button
              type="link"
              onClick={async () => {
                setEditError(null);
                setEditingId(record.id);
                setEditOpen(true);
                setEditFetching(true);
                try {
                  const user = await fetchUserById(record.id);
                  editForm.setFieldsValue({
                    name: user.name,
                    age: user.age,
                    hkidNumber: user.hkidNumber,
                    role: user.role ?? 'USER',
                    password: '',
                  });
                } catch (e) {
                  const msg = e instanceof Error ? e.message : '載入失敗';
                  setEditError(msg);
                  message.error(msg);
                } finally {
                  setEditFetching(false);
                }
              }}
            >
              修改
            </Button>
          ) : null}
          {isAdmin && record.name !== 'Admin' ? (
            <Popconfirm
              title="確認刪除？"
              description={`刪除 ID=${record.id}（不可復原）`}
              okText="刪除"
              cancelText="取消"
              onConfirm={async () => {
                try {
                  await deleteUser(record.id);
                  message.success('刪除成功');
                  loadPage(pageRef.current, qRef.current);
                } catch (e) {
                  const msg = e instanceof Error ? e.message : '刪除失敗';
                  setError(msg);
                  message.error(msg);
                }
              }}
            >
              <Button type="link" danger>
                刪除
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      {error ? <Alert type="error" showIcon message={error} /> : null}
      {success ? <Alert type="success" showIcon message={success} /> : null}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Input.Search
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={(value) => {
              setQ(value);
              setDebouncedQ(value.trim());
            }}
            allowClear
            placeholder="模糊查詢（Name / Email / ID）"
          />
        </div>
        {isAdmin ? (
          <Button
            type="primary"
            onClick={() => {
              setCreateError(null);
              form.resetFields();
              form.setFieldsValue({ role: 'USER' });
              setCreateOpen(true);
            }}
          >
            新增使用者
          </Button>
        ) : null}
      </div>

      {mounted ? (
        <Modal
          title="新增使用者"
          open={createOpen}
          okText="建立"
          cancelText="取消"
          forceRender
          confirmLoading={createLoading}
          onOk={() => form.submit()}
          onCancel={() => setCreateOpen(false)}
        >
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            {createError ? <Alert type="error" showIcon message={createError} /> : null}
            <Form
              form={form}
              layout="vertical"
              onFinish={async (values) => {
                setCreateLoading(true);
                setCreateError(null);
                try {
                  await createUser(values);
                  setCreateOpen(false);
                  setSuccess('已新增使用者');
                  message.success('新增成功');
                  loadPage(1, qRef.current);
                } catch (e) {
                  setCreateError(e instanceof Error ? e.message : '建立失敗');
                } finally {
                  setCreateLoading(false);
                }
              }}
            >
              <Form.Item name="email" label="Email" rules={[{ required: true, message: '請輸入 Email' }]}>
                <Input autoComplete="off" />
              </Form.Item>

              <Form.Item name="password" label="密碼" rules={[{ required: true, message: '請輸入密碼' }]}>
                <Input.Password autoComplete="new-password" />
              </Form.Item>

              <Form.Item name="name" label="Name" rules={[{ required: true, message: '請輸入名稱' }]}>
                <Input autoComplete="off" />
              </Form.Item>

              <Form.Item name="age" label="Age" rules={[{ required: true, message: '請輸入年齡' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="hkidNumber"
                label="HKID"
                rules={[{ required: true, message: '請輸入 HKID' }]}
              >
                <Input autoComplete="off" />
              </Form.Item>

              <Form.Item name="role" label="Role">
                <Select
                  options={[
                    { label: 'USER', value: 'USER' },
                    { label: 'ADMIN', value: 'ADMIN' },
                  ]}
                />
              </Form.Item>
            </Form>
          </Space>
        </Modal>
      ) : null}

      {mounted ? (
        <Modal
          title="修改使用者"
          open={editOpen}
          okText="保存"
          cancelText="取消"
          forceRender
          confirmLoading={editSubmitting}
          onOk={() => editForm.submit()}
          onCancel={() => {
            setEditOpen(false);
            setEditingId(null);
          }}
        >
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            {editError ? <Alert type="error" showIcon message={editError} /> : null}
            {editFetching ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : (
              <Form
                form={editForm}
                layout="vertical"
                onFinish={async (values) => {
                  if (!editingId) return;
                  setEditSubmitting(true);
                  setEditError(null);
                  try {
                    const payload: UpdateUserInput = {
                      name: values.name,
                      age: values.age,
                      hkidNumber: values.hkidNumber,
                      role: values.role,
                      ...(values.password?.trim() ? { password: values.password } : {}),
                    };
                    await updateUser(editingId, payload);
                    setEditOpen(false);
                    setEditingId(null);
                    setSuccess('已修改使用者');
                    message.success('修改成功');
                    loadPage(pageRef.current, qRef.current);
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : '修改失敗';
                    setEditError(msg);
                    message.error(msg);
                  } finally {
                    setEditSubmitting(false);
                  }
                }}
              >
                <Form.Item name="name" label="Name" rules={[{ required: true, message: '請輸入名稱' }]}>
                  <Input autoComplete="off" />
                </Form.Item>

                <Form.Item name="age" label="Age" rules={[{ required: true, message: '請輸入年齡' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="hkidNumber"
                  label="HKID"
                  rules={[{ required: true, message: '請輸入 HKID' }]}
                >
                  <Input autoComplete="off" />
                </Form.Item>

                <Form.Item name="role" label="Role">
                  <Select
                    options={[
                      { label: 'USER', value: 'USER' },
                      { label: 'ADMIN', value: 'ADMIN' },
                    ]}
                  />
                </Form.Item>

                <Form.Item name="password" label="重設密碼（可選）">
                  <Input.Password autoComplete="new-password" />
                </Form.Item>
              </Form>
            )}
          </Space>
        </Modal>
      ) : null}

      <Table<UserItem>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: false,
          onChange: (nextPage) => {
            loadPage(nextPage, debouncedQ);
          },
        }}
        size="middle"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text type="secondary">第 {page} / {totalPages} 頁</Typography.Text>
        <Typography.Text type="secondary">總共 {total} 筆</Typography.Text>
      </div>
    </Space>
  );
}
