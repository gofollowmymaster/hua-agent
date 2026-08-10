export interface AgentChatSdkOptions {
  baseUrl?: string;
  chatApi?: string;
  authType?: 'jwt' | 'secret';
  token?: string;
  supplier?: string;
  participantId?: string;
  channel?: string;
  conversationType?: string;
  options?: {
    assistantName?: string;
    userLabel?: string;
    historyTitle?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  getToken?: () => string;
}

export declare class AplusAgentChatElement extends HTMLElement {
  setTokenProvider(provider: () => string): void;
}

export declare function defineAplusAgentChatElement(): void;
export declare function createAgentChatAdapter(
  config: AgentChatSdkOptions,
): unknown;

export {};
