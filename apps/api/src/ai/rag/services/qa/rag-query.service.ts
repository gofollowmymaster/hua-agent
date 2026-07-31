import { Injectable } from '@nestjs/common';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '../prisma/rag-prisma.service';
import { RagMemoryService } from './rag-memory.service';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import { RagBaseService } from './rag-base.service';
import type {
  RagQueryOptions,
  RagMemoryMessage,
  RetrievedChunk,
  SourceItem,
} from '../../types/rag.type';

/**
 * 同步 RAG 问答服务
 *
 * 继承 RagBaseService，提供同步（一次性）问答能力。
 * 完整流程：resolveSession → loadMemory → appendUserMessage
 *   → retrieve → buildPrompt → model.invoke → appendAssistantMessage → return
 */
@Injectable()
export class RagQueryService extends RagBaseService {
  constructor(
    ragPrisma: RagPrismaService,
    logger: LoggerService,
    tenantContext: TenantContext,
    ragMemoryService: RagMemoryService,
    promptRegistry: PromptRegistryService,
  ) {
    super(ragPrisma, logger, tenantContext, ragMemoryService, promptRegistry);
  }

  async answerQuestion(
    question: string,
    options: RagQueryOptions = {},
  ): Promise<{
    sessionKey: string;
    answer: string;
    sources: SourceItem[];
    chunks: RetrievedChunk[];
  }> {
    this.assertQuestion(question);
    const session = this.ragMemoryService.resolveSession(options);
    const memory = await this.ragMemoryService.loadShortTermMemory(session);
    await this.ragMemoryService.appendUserMessage(session, question);
    const chunks = await this.retrieve(question, options.topK);
    const answer = await this.generateAnswer(question, chunks, memory);
    await this.ragMemoryService.appendAssistantMessage(session, answer);

    return {
      sessionKey: session.sessionKey,
      answer,
      sources: this.buildSources(chunks),
      chunks,
    };
  }

  private async generateAnswer(
    question: string,
    chunks: RetrievedChunk[],
    memory: RagMemoryMessage[],
  ): Promise<string> {
    const prompt = await this.promptRegistry.buildPrompt('qa', {
      question,
      chunks,
      memory: this.promptRegistry.formatMemory(memory),
    });

    const response = await this.model.invoke(prompt);

    return (
      this.extractContentText(response.content) ||
      JSON.stringify(response.content)
    );
  }
}
