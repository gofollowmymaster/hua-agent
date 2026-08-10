import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAgentChatAdapter } from '../src/agent-chat-adapter';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createAgentChatAdapter', () => {
  it('sends secret auth and supplier headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 200, body: { list: [], total: 0, page: 1, pageSize: 20 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAgentChatAdapter({
      baseUrl: 'https://api.example.com',
      authType: 'secret',
      token: 'secret-token',
      supplier: 'yurex',
    });
    await adapter.pageSessions({ page: 1, pageSize: 20 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.com/agent/chat/sessions/page');
    expect(init.headers).toMatchObject({
      Authorization: 'secret-token',
      supplier: 'yurex',
      'ignore-supplier-check': 'true',
    });
  });

  it('sends bearer JWT token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 200, body: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const adapter = createAgentChatAdapter({
      baseUrl: 'https://api.example.com',
      authType: 'jwt',
      getToken: () => 'jwt-token',
    });
    await adapter.listMessages('1');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('formats tool status', () => {
    const adapter = createAgentChatAdapter({});
    expect(adapter.formatStatus({ tool: 'search_knowledge' })).toBe(
      '调用工具：search_knowledge',
    );
    expect(
      adapter.formatStatus({
        tool: 'search_knowledge',
        message: '检索到 2 个相关文档',
      }),
    ).toBe('检索到 2 个相关文档');
  });
});
