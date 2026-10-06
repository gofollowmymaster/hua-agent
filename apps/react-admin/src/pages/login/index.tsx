import { useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { App, Card } from 'antd';
import { history, useModel, useSearchParams } from '@umijs/max';
import { resolveTenantAuthConfig } from '@/auth/tenant';
import type { LoginParams } from '@/api/auth';

export default function LoginPage() {
  const auth = useModel('auth');
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const tenant = resolveTenantAuthConfig(window.location.hostname);
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    document.title = `登录 - ${tenant.displayName} 管理后台`;
    if (auth.isLoggedIn) {
      history.replace(
        redirect.startsWith('/') && redirect !== '/login'
          ? redirect
          : '/knowledge/documents',
      );
    }
  }, [auth.isLoggedIn, redirect, tenant.displayName]);

  async function submit(values: LoginParams) {
    try {
      await auth.login(values);
      history.replace(
        redirect.startsWith('/') && redirect !== '/login'
          ? redirect
          : '/knowledge/documents',
      );
      return true;
    } catch {
      message.error('用户名或密码错误');
      return false;
    }
  }

  return (
    <main
      style={{
        display: 'grid',
        minHeight: '100vh',
        padding: 24,
        background: '#f5f7fa',
        placeItems: 'center',
      }}
    >
      <Card style={{ width: 'min(100%, 480px)' }}>
        <LoginForm<LoginParams>
          title={`${tenant.displayName} 管理后台`}
          subTitle="知识库与业务 Agent 管理"
          logo={
            <div
              style={{
                display: 'grid',
                width: 44,
                height: 44,
                borderRadius: 8,
                background: '#1677ff',
                color: '#fff',
                placeItems: 'center',
              }}
            >
              {tenant.supplierCode}
            </div>
          }
          onFinish={submit}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
              autoComplete: 'username',
            }}
            placeholder="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
              autoComplete: 'current-password',
            }}
            placeholder="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
        </LoginForm>
      </Card>
    </main>
  );
}
