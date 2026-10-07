import { createContext, useContext, useEffect, useState } from 'react';
import { XCard, registerCatalog } from '@ant-design/x-card';
import { App, Button, Card, Flex, Form, Input, Space, Typography } from 'antd';
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
  cancelMsg?: string;
  tipMsg?: string;
}

interface CardActionProps {
  value?: Order | Order[];
  onAction?: (name: OrderAction) => void;
}

const catalogId = 'local://aplus-agent-order-v0.9';

interface OrderActionContextValue {
  reason: string;
  validationError?: string;
  submittingAction?: OrderAction;
  setReason: (value: string) => void;
}

const OrderActionContext = createContext<OrderActionContextValue>({
  reason: '',
  setReason: () => undefined,
});

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
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const [submittingAction, setSubmittingAction] = useState<OrderAction>();

  useEffect(() => setCommands(data.commands), [data.commands]);

  const submit = async (action: OrderAction) => {
    if (!data.conversationId) return;
    const needsReason =
      action === 'reject' || action === 'cancel' || action === 'reject_cancel';
    if (needsReason && !reason.trim()) {
      setValidationError('请填写操作原因');
      return;
    }
    setValidationError(undefined);
    setSubmittingAction(action);
    try {
      const result = await executeAgentA2uiAction({
        conversationId: data.conversationId,
        surfaceId: data.surfaceId,
        action,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      setCommands((current) => [...current, ...result.commands]);
      setReason('');
      message.success('订单状态已更新');
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : '操作失败，请刷新后重试',
      );
    } finally {
      setSubmittingAction(undefined);
    }
  };

  return (
    <OrderActionContext.Provider
      value={{
        reason,
        validationError,
        submittingAction,
        setReason: (value) => {
          setReason(value);
          if (validationError) setValidationError(undefined);
        },
      }}
    >
      <XCard.Box
        commands={commands as never}
        components={{ OrderList, OrderDetail, OrderMutation }}
        onAction={({ name }) => void submit(name as OrderAction)}
      >
        <XCard.Card id={data.surfaceId} />
      </XCard.Box>
    </OrderActionContext.Provider>
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
        {order.status === 'CANCEL_PENDING_AUDIT' && order.cancelMsg && (
          <Typography.Text>取消原因：{order.cancelMsg}</Typography.Text>
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
  const { reason, validationError, submittingAction, setReason } =
    useContext(OrderActionContext);
  if (!onAction) return null;
  const disabled = Boolean(submittingAction);
  const reasonInput = (label: string, placeholder: string) => (
    <Form.Item
      label={label}
      validateStatus={validationError ? 'error' : undefined}
      help={validationError}
      style={{ marginBottom: 8 }}
    >
      <Input.TextArea
        aria-label={label}
        disabled={disabled}
        maxLength={500}
        placeholder={placeholder}
        rows={2}
        showCount
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
    </Form.Item>
  );
  if (status === 'PENDING_AUDIT') {
    return (
      <Form layout="vertical" size="small" requiredMark={false}>
        {reasonInput('审核意见（驳回时必填）', '请输入审核意见')}
        <Space wrap>
          <Button
            type="primary"
            size="small"
            disabled={disabled}
            loading={submittingAction === 'approve'}
            onClick={() => onAction('approve')}
          >
            审核通过
          </Button>
          <Button
            danger
            size="small"
            disabled={disabled}
            loading={submittingAction === 'reject'}
            onClick={() => onAction('reject')}
          >
            驳回
          </Button>
        </Space>
      </Form>
    );
  }
  if (status === 'PROCESSING' || status === 'IN_DISTRIBUTION') {
    return (
      <Form layout="vertical" size="small" requiredMark={false}>
        {reasonInput('取消原因', '请输入取消原因')}
        <Button
          danger
          size="small"
          disabled={disabled}
          loading={submittingAction === 'cancel'}
          onClick={() => onAction('cancel')}
        >
          申请取消
        </Button>
      </Form>
    );
  }
  if (status === 'CANCEL_PENDING_AUDIT') {
    return (
      <Form layout="vertical" size="small" requiredMark={false}>
        {reasonInput('审核意见（驳回时必填）', '请输入审核意见')}
        <Space wrap>
          <Button
            type="primary"
            size="small"
            disabled={disabled}
            loading={submittingAction === 'approve_cancel'}
            onClick={() => onAction('approve_cancel')}
          >
            同意取消
          </Button>
          <Button
            danger
            size="small"
            disabled={disabled}
            loading={submittingAction === 'reject_cancel'}
            onClick={() => onAction('reject_cancel')}
          >
            驳回取消
          </Button>
        </Space>
      </Form>
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
