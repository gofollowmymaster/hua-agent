import type { DynamicStructuredTool } from '@langchain/core/tools';

export type AgentChatTool = DynamicStructuredTool<any, any, any, string>;
