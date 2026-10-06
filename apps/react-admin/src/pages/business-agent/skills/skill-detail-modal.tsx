import { Descriptions, Modal, Typography } from 'antd';
import type {
  SystemSkillItem,
  UserSkillItem,
} from '@/api/business-agent/skills';

export function SkillDetailModal({
  item,
  onClose,
}: {
  item?: SystemSkillItem | UserSkillItem;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(item)}
      title="Skill 详情"
      width={720}
      footer={null}
      destroyOnHidden
      onCancel={onClose}
    >
      {item && (
        <>
          <Descriptions
            column={1}
            items={[
              { key: 'name', label: '名称', children: item.name },
              {
                key: 'type',
                label: '类型',
                children: item.type === 'system' ? '系统 Skill' : '用户 Skill',
              },
              {
                key: 'description',
                label: '描述',
                children: item.description || '-',
              },
            ]}
          />
          <Typography.Title level={5}>Markdown 指令</Typography.Title>
          <Typography.Paragraph className="skill-instruction">
            {item.instruction}
          </Typography.Paragraph>
        </>
      )}
    </Modal>
  );
}
