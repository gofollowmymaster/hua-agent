import { useEffect, useMemo, useState } from 'react';
import {
  BookOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { App, ConfigProvider, Dropdown, Space } from 'antd';
import { history, Link, Outlet, useLocation, useModel } from '@umijs/max';
import { proLayoutTheme, reactAdminWorkspaceTheme } from '@/theme';
import { GlobalDrawer } from './global-drawer';

const COLLAPSED_KEY = 'react-admin:sider-collapsed';

const menuRoutes = [
  {
    path: '/knowledge',
    name: '知识问答',
    icon: <BookOutlined />,
    routes: [
      {
        path: '/knowledge/documents',
        name: '文档管理',
        icon: <FileTextOutlined />,
      },
      {
        path: '/knowledge/sessions',
        name: '消息对话记录',
        icon: <MessageOutlined />,
      },
      {
        path: '/knowledge/assistant',
        name: '问答助手',
        icon: <RobotOutlined />,
      },
    ],
  },
  {
    path: '/business-agent',
    name: '业务Agent',
    icon: <RobotOutlined />,
    routes: [
      {
        path: '/business-agent/knowledge',
        name: '业务知识库管理',
        icon: <DatabaseOutlined />,
      },
      {
        path: '/business-agent/skills',
        name: 'Skill 管理',
        icon: <ThunderboltOutlined />,
      },
      {
        path: '/business-agent/sessions',
        name: '会话管理',
        icon: <MessageOutlined />,
      },
      {
        path: '/business-agent/config',
        name: '配置中心',
        icon: <SettingOutlined />,
      },
      {
        path: '/business-agent/demo',
        name: '演示 Demo',
        icon: <PlayCircleOutlined />,
      },
    ],
  },
  {
    path: '/digital-avatar',
    name: '数字分身',
    icon: <UserOutlined />,
    routes: [
      {
        path: '/digital-avatar/documents',
        name: '文档管理',
        icon: <FileTextOutlined />,
      },
    ],
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/knowledge/documents': {
    title: '文档管理',
    subtitle: '查看、维护或删除已索引文档，也可触发 raw 目录重新入库。',
  },
  '/knowledge/sessions': {
    title: '消息对话记录',
    subtitle: '按会话查看用户提问与助手回答。',
  },
  '/knowledge/assistant': {
    title: '问答助手',
    subtitle: '基于当前 RAG 文档索引的 AGUI 协议演示会话。',
  },
  '/business-agent/knowledge': {
    title: '业务知识库管理',
    subtitle: '查看、维护已入库的业务 Agent 文档，并可触发 docs 目录重新入库。',
  },
  '/business-agent/skills': {
    title: 'Skill 管理',
    subtitle: '查看系统 Skill，并维护当前用户自动装载的个人 Skill。',
  },
  '/business-agent/sessions': {
    title: '会话管理',
    subtitle: '业务 Agent 模块骨架。',
  },
  '/business-agent/config': {
    title: '配置中心',
    subtitle: '业务 Agent 模块骨架。',
  },
  '/business-agent/demo': {
    title: '演示 Demo',
    subtitle: '体验业务 Agent 多工具对话与历史会话。',
  },
  '/digital-avatar/documents': {
    title: '数字分身文档管理',
    subtitle: '管理全局共享的 TXT 文档、章节切片和摘要。',
  },
};

export default function AdminLayout() {
  const location = useLocation();
  const auth = useModel('auth');
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem(COLLAPSED_KEY) === 'true',
  );
  const meta = pageMeta[location.pathname] || {
    title: `${auth.tenantDisplayName} 管理后台`,
    subtitle: 'RAG 文档与对话运营后台',
  };
  const brand = useMemo(
    () => `${auth.tenantDisplayName}管理后台`,
    [auth.tenantDisplayName],
  );

  useEffect(() => {
    document.title = `${meta.title} - ${auth.tenantDisplayName} 管理后台`;
  }, [auth.tenantDisplayName, meta.title]);

  return (
    <ConfigProvider theme={reactAdminWorkspaceTheme}>
      <App component={false}>
        <ProLayout
          className="admin-layout"
          token={proLayoutTheme}
          siderWidth={200}
          stylish={{
            header: () => ({
              borderBlockEnd: 0,
              boxShadow: 'none',
            }),
          }}
          title={brand}
          logo={<div className="admin-brand-mark">{auth.supplierCode}</div>}
          route={{ routes: menuRoutes }}
          location={{ pathname: location.pathname }}
          collapsed={collapsed}
          onCollapse={(next) => {
            setCollapsed(next);
            window.localStorage.setItem(COLLAPSED_KEY, String(next));
          }}
          menuItemRender={(item, dom) =>
            item.path ? <Link to={item.path}>{dom}</Link> : dom
          }
          avatarProps={{
            title: auth.displayName,
            src: auth.userInfo.avatar,
            render: (_props, dom) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                    },
                  ],
                  onClick: ({ key }) => {
                    if (key === 'logout') {
                      auth.logout();
                      history.replace('/login');
                    }
                  },
                }}
              >
                <Space>{dom}</Space>
              </Dropdown>
            ),
          }}
          layout="mix"
          fixedHeader
          fixSiderbar
          contentStyle={{ padding: 0, minHeight: 'calc(100vh - 48px)' }}
        >
          <PageContainer
            className="admin-page-container"
            title={meta.title}
            subTitle={meta.subtitle}
            header={{ style: { paddingBlock: 8 } }}
            token={{
              paddingInlinePageContainerContent: 12,
              paddingBlockPageContainerContent: 12,
            }}
          >
            <Outlet />
          </PageContainer>
          <GlobalDrawer />
        </ProLayout>
      </App>
    </ConfigProvider>
  );
}
