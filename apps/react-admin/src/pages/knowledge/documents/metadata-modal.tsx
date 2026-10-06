import { App } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import {
  updateDocumentMetadata,
  type RagDocumentItem,
} from '@/api/knowledge/documents';

export function DocumentMetadataModal({
  item,
  onClose,
  onSaved,
}: {
  item?: RagDocumentItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  return (
    <ModalForm<{ type: string; tag: string }>
      title="编辑文档元数据"
      open={Boolean(item)}
      initialValues={{ type: item?.type || '', tag: item?.tag || '' }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onFinish={async (values) => {
        if (!item) return false;
        await updateDocumentMetadata(item.id, values);
        message.success('文档元数据已更新');
        onSaved();
        onClose();
        return true;
      }}
    >
      <ProFormText name="type" label="type" placeholder="业务分类" />
      <ProFormText name="tag" label="tag" placeholder="标签" />
    </ModalForm>
  );
}
