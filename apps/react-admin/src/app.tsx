import type { ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './styles/global.css';

export function rootContainer(container: ReactNode) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          colorBgLayout: '#f5f7fa',
        },
      }}
    >
      <App>{container}</App>
    </ConfigProvider>
  );
}
