import {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { App } from 'antd';
import {
  createUserSkill,
  updateUserSkill,
  type SaveUserSkillParams,
  type UserSkillItem,
} from '@/api/business-agent/skills';

export function SkillFormModal({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item?: UserSkillItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { message } = App.useApp();
  return (
    <ModalForm<SaveUserSkillParams>
      key={item?.id ?? 'new'}
      title={item ? '编辑用户 Skill' : '新建用户 Skill'}
      open={open}
      width={720}
      initialValues={{
        name: item?.name || '',
        description: item?.description || '',
        instruction: item?.instruction || '',
        isEnabled: item?.isEnabled ?? true,
      }}
      modalProps={{ destroyOnHidden: true, onCancel: onClose }}
      onFinish={async (values) => {
        if (item) await updateUserSkill(item.id, values);
        else await createUserSkill(values);
        message.success(item ? '用户 Skill 已更新' : '用户 Skill 已创建');
        onSaved();
        onClose();
        return true;
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        fieldProps={{ maxLength: 64, showCount: true }}
        rules={[
          { required: true, message: '请输入 Skill 名称' },
          { max: 64, message: '名称不能超过 64 个字符' },
        ]}
      />
      <ProFormTextArea
        name="description"
        label="描述"
        fieldProps={{ maxLength: 500, showCount: true, rows: 3 }}
        rules={[{ max: 500, message: '描述不能超过 500 个字符' }]}
      />
      <ProFormTextArea
        name="instruction"
        label="Markdown 指令"
        fieldProps={{ maxLength: 12000, showCount: true, rows: 10 }}
        rules={[
          { required: true, message: '请输入 Skill 指令' },
          { max: 12000, message: '指令不能超过 12000 个字符' },
        ]}
      />
      <ProFormSwitch name="isEnabled" label="启用" />
    </ModalForm>
  );
}
