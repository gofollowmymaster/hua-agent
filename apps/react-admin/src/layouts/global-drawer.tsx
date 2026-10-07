import { Drawer } from 'antd';
import { useDrawerQuery } from './drawer-query';
import { DocumentChunks } from '@/components/drawers/document-chunks';
import { SessionMessages } from '@/components/drawers/session-messages';

const titles = {
  'document-chunks': '文档切片实况',
  'session-messages': '消息记录',
  'agent-knowledge-chunks': '业务知识切片实况',
  'digital-avatar-chunks': '数字分身文档切片',
};

export function GlobalDrawer() {
  const query = useDrawerQuery();
  const valid = Boolean(query.drawer && titles[query.drawer]);
  return (
    <Drawer
      open={valid && Boolean(query.drawerCode)}
      title={query.drawer ? titles[query.drawer] : ''}
      size="min(760px, calc(100vw - 24px))"
      onClose={query.close}
      destroyOnHidden
    >
      {query.drawer === 'document-chunks' && (
        <DocumentChunks id={query.drawerCode} source="rag" />
      )}
      {query.drawer === 'agent-knowledge-chunks' && (
        <DocumentChunks id={query.drawerCode} source="agent" />
      )}
      {query.drawer === 'digital-avatar-chunks' && (
        <DocumentChunks id={query.drawerCode} source="digital-avatar" />
      )}
      {query.drawer === 'session-messages' && (
        <SessionMessages id={query.drawerCode} />
      )}
    </Drawer>
  );
}
