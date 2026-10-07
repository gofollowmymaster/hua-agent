import { useEffect, useState } from 'react';
import { XCard, registerCatalog } from '@ant-design/x-card';
import { App, Button, Card, Flex, Input, Modal, Space, Typography } from 'antd';
import { SemanticTag } from '@/components/semantic-tag';
import {
  executeAgentA2uiAction,
  type AgentA2uiActionRequest,
} from '@/api/business-agent/chat';
import type { ChatA2uiData } from '@aplus-sql/react-ui-kit';

type OrderAction = AgentA2uiActionRequest['action'];

interface Order {
  dsOrderNo?: string;
  externalCode?: string;
  status?: string;
  salePlatform?: string;
  warehouseName?: string;
  totalQuantity?: number;
  trackingNo?: string;
  tipMsg?: string;
}

interface CardActionProps {
  value?: Order | Order[];
  onAction?: (name: OrderAction) => void;
}

const catalogId = 'local://aplus-agent-order-v0.9';

registerCatalog({
  $id: catalogId,
  components: {
    OrderList: { type: 'object', required: ['value'] },
    OrderDetail: { type: 'object', required: ['value'] },
    OrderMutation: { type: 'object', required: ['value'] },
  },
});

/** Renders a server-defined A2UI order surface with no remote catalog access. */
export function AgentA2uiOrderCards({ data }: { data: ChatA2uiData }) {
  const { message } = App.useApp();
  const [commands, setCommands] = useState(data.commands);
  const [action, setAction] = useState<OrderAction>();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setCommands(data.commands), [data.commands]);

  const needsReason =
    action === 'reject' || action === 'cancel' || action === 'reject_cancel';
  const submit = async () => {
    if (!action || !data.conversationId) return;
    if (needsReason && !reason.trim()) {
      message.error('请填写操作原因');
      return;
    }
    setSubmitting(true);
    try {
      const result = await executeAgentA2uiAction({
        conversationId: data.conversationId,
        surfaceId: data.surfaceId,
        action,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      setCommands((current) => [...current, ...result.commands]);
      setAction(undefined);
      setReason('');
      message.success('订单状态已更新');
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '操作失败，请刷新后重试',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <XCard.Box
        commands={commands as never}
        components={{ OrderList, OrderDetail, OrderMutation }}
        onAction={({ name }) => setAction(name as OrderAction)}
      >
        <XCard.Card id={data.surfaceId} />
      </XCard.Box>
      <Modal
        open={Boolean(action)}
        title={actionLabel(action)}
        okText="确认"
        confirmLoading={submitting}
        onCancel={() => {
          if (!submitting) setAction(undefined);
        }}
        onOk={() => void submit()}
      >
        <p>确认执行此订单操作？</p>
        {needsReason && (
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            maxLength={500}
            placeholder="请输入操作原因"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        )}
      </Modal>
    </>
  );
}

function OrderList({ value }: CardActionProps) {
  const orders = Array.isArray(value) ? value : [];
  return (
    <Card size="small" title="订单查询结果" className="agent-a2ui-order-card">
      <Flex vertical gap={8}>
        {orders.map((order, index) => (
          <Flex
            key={order.dsOrderNo || index}
            justify="space-between"
            align="center"
          >
            <Flex vertical gap={2}>
              <Typography.Text strong>{order.dsOrderNo || '-'}</Typography.Text>
              <Typography.Text type="secondary">
                {order.externalCode || '-'} · {order.salePlatform || '-'} · 数量{' '}
                {order.totalQuantity || 0}
              </Typography.Text>
            </Flex>
            <OrderStatus status={order.status} />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

function OrderDetail({ value, onAction }: CardActionProps) {
  const order = Array.isArray(value) ? undefined : value;
  if (!order) return null;
  return (
    <Card
      size="small"
      title={order.dsOrderNo || '订单详情'}
      className="agent-a2ui-order-card"
    >
      <Flex vertical gap={8}>
        <OrderStatus status={order.status} />
        <Typography.Text type="secondary">
          {order.externalCode || '-'} · {order.salePlatform || '-'} ·{' '}
          {order.warehouseName || '-'}
        </Typography.Text>
        {order.trackingNo && (
          <Typography.Text>运单号：{order.trackingNo}</Typography.Text>
        )}
        {order.tipMsg && (
          <Typography.Text type="secondary">{order.tipMsg}</Typography.Text>
        )}
        <OrderActions status={order.status} onAction={onAction} />
      </Flex>
    </Card>
  );
}

function OrderMutation({ value }: CardActionProps) {
  return <OrderDetail value={value} />;
}

function OrderActions({
  status,
  onAction,
}: {
  status?: string;
  onAction?: (name: OrderAction) => void;
}) {
  if (!onAction) return null;
  if (status === 'PENDING_AUDIT') {
    return (
      <Space>
        <Button type="primary" size="small" onClick={() => onAction('approve')}>
          审核通过
        </Button>
        <Button danger size="small" onClick={() => onAction('reject')}>
          驳回
        </Button>
      </Space>
    );
  }
  if (status === 'PROCESSING' || status === 'IN_DISTRIBUTION') {
    return (
      <Button danger size="small" onClick={() => onAction('cancel')}>
        申请取消
      </Button>
    );
  }
  if (status === 'CANCEL_PENDING_AUDIT') {
    return (
      <Space>
        <Button
          type="primary"
          size="small"
          onClick={() => onAction('approve_cancel')}
        >
          同意取消
        </Button>
        <Button danger size="small" onClick={() => onAction('reject_cancel')}>
          驳回取消
        </Button>
      </Space>
    );
  }
  return null;
}

function OrderStatus({ status }: { status?: string }) {
  const tone =
    status === 'CANCELLED' || status === 'COMPLETED'
      ? 'success'
      : status === 'REJECTED'
        ? 'error'
        : status?.includes('PENDING')
          ? 'warning'
          : 'info';
  return <SemanticTag tone={tone}>{status || '-'}</SemanticTag>;
}

function actionLabel(action?: OrderAction) {
  return (
    {
      approve: '审核通过',
      reject: '驳回订单',
      cancel: '申请取消',
      approve_cancel: '同意取消',
      reject_cancel: '驳回取消',
    } as const
  )[action || 'approve'];
}
