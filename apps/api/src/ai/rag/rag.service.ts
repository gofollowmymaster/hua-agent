import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createUIMessageStream } from 'ai';
import { RagQueryService } from './services/qa/rag-workflow.service';
import type {
  RagChatRequest,
  RagQueryOptions,
  RagStreamEvent,
} from './types/rag.type';

// 重导出保持向后兼容
export type { RagChatRequest } from './types/rag.type';

/**
 * RAG 问答 Facade
 *
 * 问答工作流委托给 RagQueryService，AGUI 请求与事件在此完成协议适配。
 */
@Injectable()
export class RagService {
  constructor(private readonly queryService: RagQueryService) {}

  /** 委托问答工作流生成完整答案。 */
  async answerQuestion(question: string, options: RagQueryOptions = {}) {
    return this.queryService.answerQuestion(question, options);
  }

  /** 委托问答工作流按事件流生成状态、推理内容和答案。 */
  streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagStreamEvent> {
    return this.queryService.streamAnswer(question, options);
  }

  /** 将 AGUI 消息转换为问答事件并输出 UI Message 流。 */
  createChatStream(params: RagChatRequest) {
    const question = this.extractLatestUserQuestion(params?.messages);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();
    const reasoningId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        let reasoningStarted = false;
        let textStarted = false;
        const endReasoning = () => {
          if (!reasoningStarted) return;
          writer.write({ type: 'reasoning-end', id: reasoningId });
          reasoningStarted = false;
        };
        const startText = () => {
          if (textStarted) return;
          endReasoning();
          writer.write({ type: 'text-start', id: textId });
          textStarted = true;
        };

        try {
          for await (const event of this.streamAnswer(question.text, {
            session: {
              channel: 'web',
              conversationId,
              conversationType: 'rag-chat',
              participantId,
              messageId: question.id,
              metadata: { source: 'rag-chat' },
            },
          })) {
            if (event.type === 'answer') {
              startText();
              writer.write({
                type: 'text-delta',
                id: textId,
                delta: event.data,
              });
              continue;
            }

            if (event.type === 'reasoning') {
              if (!reasoningStarted) {
                writer.write({ type: 'reasoning-start', id: reasoningId });
                reasoningStarted = true;
              }
              writer.write({
                type: 'reasoning-delta',
                id: reasoningId,
                delta: event.data,
              });
              continue;
            }

            writer.write({ type: 'data-status', data: event.data });
          }
        } finally {
          endReasoning();
          startText();
          writer.write({ type: 'text-end', id: textId });
        }
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }

  /** 从消息历史中提取最近一条有效的用户文本问题。 */
  private extractLatestUserQuestion(messages: RagChatRequest['messages']) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('messages is required');
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message?.role === 'user');
    const question = latestUserMessage?.parts
      ?.filter((part) => part?.type === 'text')
      .map((part) => ('text' in part ? part.text : ''))
      .join('')
      .trim();

    if (!question) {
      throw new BadRequestException('question text is required');
    }

    return { id: latestUserMessage?.id, text: question };
  }
}
