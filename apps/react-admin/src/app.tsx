import type { ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { reactAdminTheme, themeCssVariables } from './theme';
import './styles/global.css';

export function rootContainer(container: ReactNode) {
  if (typeof document !== 'undefined') {
    document.body.classList.add('react-admin-body');
    Object.entries(themeCssVariables).forEach(([name, value]) => {
      document.documentElement.style.setProperty(name, String(value));
    });
  }
  return (
    <ConfigProvider locale={zhCN} theme={reactAdminTheme}>
      <App>
        <div className="react-admin-theme" style={themeCssVariables}>
          {container}
        </div>
      </App>
    </ConfigProvider>
  );
}
