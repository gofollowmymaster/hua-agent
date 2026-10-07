import { App } from 'antd';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import {
  updateDigitalAvatarSummary,
  type DigitalAvatarDocumentItem,
} from '@/api/digital-avatar/documents';

export function DigitalAvatarSummaryModal({
  item,
  onClose,
  onSaved,
}: {
  item?: DigitalAvatarDocumentItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  return (
    <ModalForm<{ summary: string }>
      title="编辑文档摘要"
      open={Boolean(item)}
      initialValues={{ summary: item?.summary || '' }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onFinish={async ({ summary }) => {
        if (!item) return false;
        await updateDigitalAvatarSummary(item.id, summary || '');
        message.success('文档摘要已更新');
        onSaved();
        onClose();
        return true;
      }}
    >
      <ProFormTextArea
        name="summary"
        label="摘要"
        fieldProps={{ rows: 12 }}
        extra="重新入库时会用文档最后一个二级标题章节重新生成摘要。"
      />
    </ModalForm>
  );
}
