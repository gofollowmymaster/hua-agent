import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { createUIMessageStream, type UIMessage } from 'ai';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '../prisma/rag-prisma.service';
import { RagMemoryService } from './rag-memory.service';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import { RagBaseService } from './rag-base.service';
import { RagQueryRewriteService } from './rag-query-rewrite.service';
import type {
  RagQueryOptions,
  RagStreamEvent,
  RagChatRequest,
} from '../../types/rag.type';

/**
 * 流式 RAG 问答服务
 *
 * 继承 RagBaseService，提供流式问答能力：
 * - streamAnswer()    SSE 流式问答（AsyncGenerator）
 * - createChatStream() AGUI 协议流式问答
 *
 * 带 fallback：若 stream 失败或返回空文本，自动切换到 invoke 模式。
 */
@Injectable()
export class RagStreamService extends RagBaseService {
  constructor(
    ragPrisma: RagPrismaService,
    logger: LoggerService,
    tenantContext: TenantContext,
    ragMemoryService: RagMemoryService,
    promptRegistry: PromptRegistryService,
    private readonly queryRewriteService: RagQueryRewriteService,
  ) {
    super(ragPrisma, logger, tenantContext, ragMemoryService, promptRegistry);
  }

  async *streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagStreamEvent> {
    this.assertQuestion(question);
    const session = this.ragMemoryService.resolveSession(options);
    const memory = await this.ragMemoryService.loadShortTermMemory(session);
    await this.ragMemoryService.appendUserMessage(session, question);
    yield {
      type: 'status',
      data: {
        stage: 'analyzing_start',
        message: '开始分析问题',
        sessionKey: session.sessionKey,
        topK: options.topK,
      },
    };

    const rewrite = await this.queryRewriteService.rewrite({
      question,
      memory,
      session,
      topK: options.topK,
    });
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_start',
        message: '开始检索知识库',
        sessionKey: session.sessionKey,
        topK: options.topK,
      },
    };
    const chunks = await this.retrieve(rewrite.rewrittenQuestion, options.topK);
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_done',
        message: `检索完成，命中 ${chunks.length} 个片段`,
        sessionKey: session.sessionKey,
        topK: options.topK,
        chunks: chunks.length,
      },
    };

    const prompt = await this.promptRegistry.buildPrompt('qa', {
      question,
      chunks,
      memory: this.promptRegistry.formatMemory(memory),
    });
    yield {
      type: 'status',
      data: {
        stage: 'generate_start',
        message: '开始生成答案',
        sessionKey: session.sessionKey,
        topK: options.topK,
        chunks: chunks.length,
      },
    };

    let hasText = false;
    let answerContent = '';

    try {
      const stream = await this.model.stream(prompt);

      for await (const chunk of stream) {
        const text = this.extractContentText(chunk.content);
        if (text) {
          hasText = true;
          answerContent += text;
          yield { type: 'answer', data: text };
        }
      }
    } catch (error) {
      this.logger.warn('RAG stream failed, fallback to invoke', undefined, {
        stage: 'rag_stream_failed_fallback',
        tenantCode: this.tenantContext.tenant,
        sessionKey: session.sessionKey,
        topK: options.topK,
        chunks: chunks.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (!hasText) {
      this.logger.warn(
        'RAG stream returned no text, fallback to invoke',
        undefined,
        {
          stage: 'rag_stream_empty_fallback',
          tenantCode: this.tenantContext.tenant,
          sessionKey: session.sessionKey,
          topK: options.topK,
          chunks: chunks.length,
        },
      );
      yield {
        type: 'status',
        data: {
          stage: 'fallback_start',
          message: '流式生成未返回文本，切换为普通生成',
          sessionKey: session.sessionKey,
          topK: options.topK,
          chunks: chunks.length,
        },
      };

      const response = await this.model.invoke(prompt);
      const text =
        this.extractContentText(response.content) ||
        JSON.stringify(response.content);
      if (text) {
        answerContent += text;
        yield { type: 'answer', data: text };
      }
    }

    await this.ragMemoryService.appendAssistantMessage(session, answerContent);

    yield {
      type: 'done',
      data: {
        stage: 'done',
        message: '生成完成',
      },
    };
  }

  createChatStream(params: RagChatRequest) {
    const question = this.extractLatestUserQuestion(params?.messages);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: 'text-start',
          id: textId,
        });

        try {
          for await (const event of this.streamAnswer(question.text, {
            session: {
              channel: 'web',
              conversationId,
              conversationType: 'rag-chat',
              participantId,
              messageId: question.id,
              metadata: {
                source: 'rag-chat',
              },
            },
          })) {
            if (event.type === 'answer') {
              writer.write({
                type: 'text-delta',
                id: textId,
                delta: event.data,
              });
              continue;
            }

            writer.write({
              type: 'data-status',
              data: event.data,
            });
          }
        } finally {
          writer.write({
            type: 'text-end',
            id: textId,
          });
        }
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }
}
