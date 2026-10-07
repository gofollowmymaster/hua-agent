import { useMemo } from 'react';
import { useModel } from '@umijs/max';
import { ChatWorkspace } from '@aplus-sql/react-ui-kit';
import { createAgentChatAdapter } from './adapter';

export default function AgentDemoPage() {
  const auth = useModel('auth');
  const adapter = useMemo(createAgentChatAdapter, []);
  const participantId =
    auth.userInfo.userId || auth.userInfo.email || auth.displayName;
  return (
    <ChatWorkspace
      adapter={adapter}
      participantId={participantId}
      assistantName="业务 Agent"
      emptyDescription="业务 Agent 会按顺序展示思考、工具调用和回答。"
    />
  );
}
