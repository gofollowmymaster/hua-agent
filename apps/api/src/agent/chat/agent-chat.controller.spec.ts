import { pipeUIMessageStreamToResponse } from 'ai';
import { AgentChatController } from './agent-chat.controller';

jest.mock('ai', () => ({
  pipeUIMessageStreamToResponse: jest.fn(),
}));

describe('AgentChatController', () => {
  it('prevents response compression from buffering the SSE stream', () => {
    const stream = {};
    const response = {};
    const chatService = {
      createChatStream: jest.fn().mockReturnValue(stream),
    };
    const controller = new AgentChatController(chatService as any, {} as any);

    controller.chat({ messages: [] }, response as any);

    expect(pipeUIMessageStreamToResponse).toHaveBeenCalledWith({
      response,
      stream,
      headers: {
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  });
});
