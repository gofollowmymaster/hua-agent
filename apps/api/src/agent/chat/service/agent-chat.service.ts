import { Injectable, BadRequestException } from '@nestjs/common';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { createUIMessageStream } from 'ai';
import { randomUUID } from 'node:crypto';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { AgentChatAgentService } from './agent-chat-agent.service';
import { AgentChatMemoryService } from './agent-chat-memory.service';
import type {
  AgentChatRequest,
  AgentChatToolCallRecord,
  AgentChatWriter,
} from '../type/agent-chat.type';

/** 编排业务 Agent 的请求解析、Deep Agents 运行和会话记忆持久化。 */
@Injectable()
export class AgentChatService {
  /** 注入 deepagents 运行时和会话记忆服务。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly memoryService: AgentChatMemoryService,
    private readonly agentService: AgentChatAgentService,
  ) {
    this.logger.setContext(AgentChatService.name);
  }

  /** 将 AGUI 聊天请求转换为 Deep Agents 流式响应。 */
  createChatStream(params: AgentChatRequest) {
    const question = this.extractLatestUserQuestion(params);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        const streamWriter = writer as AgentChatWriter;
        const session = this.memoryService.resolveSession({
          channel: 'agent-web',
          conversationId,
          conversationType: 'agent-chat',
          participantId,
          messageId: question.id,
          metadata: { source: 'agent-demo' },
        });

        streamWriter.write({
          type: 'data-status',
          data: { stage: 'analyze_start', message: '开始分析问题' },
        });

        const history = await this.memoryService.loadRecentMessages(
          session,
          10,
        );
        const messages: BaseMessage[] = [
          ...history.map((message) =>
            message.role === 'user'
              ? new HumanMessage(message.content)
              : new AIMessage(message.content),
          ),
          new HumanMessage(question.text),
        ];

        let answer = '';
        const toolCalls: AgentChatToolCallRecord[] = [];
        let textStarted = false;
        const startText = () => {
          if (textStarted) return;
          streamWriter.write({
            type: 'data-status',
            data: { stage: 'generate_start', message: '开始生成答案' },
          });
          streamWriter.write({ type: 'text-start', id: textId });
          textStarted = true;
        };

        for await (const event of this.agentService.stream(messages)) {
          if (event.type === 'tool_start') {
            streamWriter.write({
              type: 'data-status',
              data: {
                stage: 'tool_call',
                message: `调用工具：${event.name}`,
                tool: event.name,
              },
            });
            continue;
          }
          if (event.type === 'tool_end') {
            toolCalls.push({
              name: event.name,
              arguments: event.arguments,
              result: event.result,
            });
            continue;
          }
          if (event.type === 'text_delta') {
            answer += event.delta;
            startText();
            streamWriter.write({
              type: 'text-delta',
              id: textId,
              delta: event.delta,
            });
            continue;
          }
          if (event.type === 'done') {
            answer = event.answer;
            toolCalls.length = 0;
            toolCalls.push(...event.toolCalls);
          }
        }

        if (!answer) {
          answer = '抱歉，我暂时无法生成回答，请稍后重试。';
          startText();
          streamWriter.write({
            type: 'text-delta',
            id: textId,
            delta: answer,
          });
        }
        if (!textStarted) {
          startText();
          streamWriter.write({
            type: 'text-delta',
            id: textId,
            delta: answer,
          });
        }
        streamWriter.write({ type: 'text-end', id: textId });

        await this.memoryService.appendUserMessage(
          session,
          question.text,
          question.id,
        );
        await this.memoryService.appendAssistantMessage(
          session,
          answer,
          toolCalls,
        );

        streamWriter.write({
          type: 'data-status',
          data: { stage: 'done', message: '生成完成' },
        });
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }

  /** 从 AGUI 消息中提取最近一条有效用户文本问题。 */
  private extractLatestUserQuestion(params: AgentChatRequest) {
    if (!Array.isArray(params?.messages) || params.messages.length === 0) {
      throw new BadRequestException('messages is required');
    }

    const latestUserMessage = [...params.messages]
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
