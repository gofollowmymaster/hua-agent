import { App } from 'antd';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeAgentA2uiAction } from '@/api/business-agent/chat';
import { AgentA2uiOrderCards } from './a2ui-order-cards';

vi.mock('@/api/business-agent/chat', () => ({
  executeAgentA2uiAction: vi.fn(),
}));

vi.mock('@ant-design/x-card', () => ({
  registerCatalog: vi.fn(),
  XCard: {
    Box: ({
      commands,
      components,
      onAction,
    }: {
      commands: Record<string, any>[];
      components: Record<string, ComponentType<any>>;
      onAction: (action: { name: string }) => void;
      children: ReactNode;
    }) => {
      const componentName = commands
        .flatMap((command) => command.updateComponents?.components || [])
        .at(-1)?.component;
      const value = commands
        .filter((command) => command.updateDataModel?.path === '/order')
        .at(-1)?.updateDataModel?.value;
      const Component = components[componentName];
      return Component ? (
        <Component
          value={value}
          onAction={(name: string) => onAction({ name })}
        />
      ) : null;
    },
    Card: () => null,
  },
}));

const actionMock = vi.mocked(executeAgentA2uiAction);
const messageApi = { error: vi.fn(), success: vi.fn() };

function orderCard(status: string, extra: Record<string, unknown> = {}) {
  return {
    surfaceId: 'order-1',
    conversationId: 'conversation-1',
    commands: [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'order-1',
          catalogId: 'local://aplus-agent-order-v0.9',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'order-1',
          components: [
            { id: 'root', component: 'OrderDetail', value: { path: '/order' } },
          ],
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'order-1',
          path: '/order',
          value: { dsOrderNo: 'DS-001', status, ...extra },
        },
      },
    ],
  };
}

function renderCard(status: string, extra?: Record<string, unknown>) {
  return render(
    <App>
      <AgentA2uiOrderCards data={orderCard(status, extra)} />
    </App>,
  );
}

describe('AgentA2uiOrderCards', () => {
  beforeEach(() => {
    actionMock.mockReset();
    vi.spyOn(App, 'useApp').mockReturnValue({ message: messageApi } as never);
  });
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('keeps the audit form visible and merges a successful action update', async () => {
    actionMock.mockResolvedValue({
      surfaceId: 'order-1',
      commands: [
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'order-1',
            path: '/order',
            value: { dsOrderNo: 'DS-001', status: 'REJECTED' },
          },
        },
      ],
    });
    renderCard('PENDING_AUDIT');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /驳\s*回/ }));
    expect(await screen.findByText('请填写操作原因')).toBeInTheDocument();
    expect(actionMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('审核意见（驳回时必填）'), {
      target: { value: '资料不完整' },
    });
    fireEvent.click(screen.getByRole('button', { name: /驳\s*回/ }));

    await waitFor(() =>
      expect(actionMock).toHaveBeenCalledWith({
        conversationId: 'conversation-1',
        surfaceId: 'order-1',
        action: 'reject',
        reason: '资料不完整',
      }),
    );
    await waitFor(() =>
      expect(
        screen.queryByLabelText('审核意见（驳回时必填）'),
      ).not.toBeInTheDocument(),
    );
  });

  it('retains cancellation input and state when the action fails', async () => {
    actionMock.mockImplementation(() => {
      throw new Error('状态已变化');
    });
    renderCard('PROCESSING');
    const input = screen.getByLabelText('取消原因');

    fireEvent.change(input, { target: { value: '客户要求取消' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '申请取消' }));
    });

    await waitFor(() => expect(actionMock).toHaveBeenCalledTimes(1));
    expect(messageApi.error).toHaveBeenCalledWith('状态已变化');
    expect(input).toHaveValue('客户要求取消');
    expect(screen.getByRole('button', { name: /申请取消/ })).toBeVisible();
  });

  it('shows the original cancellation reason in the cancellation audit form', () => {
    renderCard('CANCEL_PENDING_AUDIT', { cancelMsg: '客户不再需要' });

    expect(screen.getByText('取消原因：客户不再需要')).toBeVisible();
    expect(screen.getByRole('button', { name: '同意取消' })).toBeVisible();
    expect(screen.getByRole('button', { name: '驳回取消' })).toBeVisible();
  });

  it('renders completed orders without a write form', () => {
    renderCard('COMPLETED');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
