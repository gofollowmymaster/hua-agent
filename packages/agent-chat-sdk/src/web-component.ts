import { createApp, type App } from 'vue';
import { createAgentChatAdapter, type AgentChatSdkOptions } from './agent-chat-adapter';
import AgentChatHost from './agent-chat-host.vue';

const OBSERVED_ATTRIBUTES = [
  'base-url',
  'chat-api',
  'auth-type',
  'token',
  'supplier',
  'participant-id',
  'channel',
  'conversation-type',
  'assistant-name',
  'user-label',
  'history-title',
  'empty-title',
  'empty-description',
];

/** Framework-agnostic Agent Chat Web Component. */
export class AplusAgentChatElement extends HTMLElement {
  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  private app: App | null = null;
  private tokenProvider?: () => string;

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
  }

  attributeChangedCallback() {
    this.mount();
  }

  /** 动态提供 JWT 或 Secret token，避免硬编码。 */
  setTokenProvider(provider: () => string) {
    this.tokenProvider = provider;
    this.mount();
  }

  private mount() {
    this.unmount();
    const config: AgentChatSdkOptions = {
      baseUrl: this.getAttribute('base-url') || '',
      chatApi: this.getAttribute('chat-api') || '/agent/chat',
      authType: (this.getAttribute('auth-type') as 'jwt' | 'secret') || 'secret',
      token: this.getAttribute('token') || undefined,
      supplier: this.getAttribute('supplier') || undefined,
      participantId: this.getAttribute('participant-id') || undefined,
      channel: this.getAttribute('channel') || 'agent-web',
      conversationType:
        this.getAttribute('conversation-type') || 'agent-chat',
      getToken: this.tokenProvider,
      options: {
        assistantName: this.getAttribute('assistant-name') || 'Agent',
        userLabel: this.getAttribute('user-label') || '你',
        historyTitle: this.getAttribute('history-title') || '历史会话',
        emptyTitle: this.getAttribute('empty-title') || '开始 Agent 演示',
        emptyDescription:
          this.getAttribute('empty-description') ||
          'Agent 会调用知识库和通用工具，以流式方式返回答案。',
        collapseProcessAfterAnswer: true,
      },
    };
    this.app = createApp(AgentChatHost, {
      adapter: createAgentChatAdapter(config),
      options: config.options,
    });
    this.app.mount(this);
  }

  private unmount() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }
}

/** 注册全局自定义元素，重复调用不会报错。 */
export function defineAplusAgentChatElement() {
  if (!customElements.get('aplus-agent-chat')) {
    customElements.define('aplus-agent-chat', AplusAgentChatElement);
  }
}
