import { Module } from '@nestjs/common';
import { AilyService } from './aily/aily.service';
import { AilyController } from './aily/aily.controller';
import { LogOperatorService } from './log-operator/log-operator.service';
import { LogOperatorController } from './log-operator/log-operator.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientFactory, FeishuApp } from '@src/common/feishu/clients';
import { FeishuHelperModule } from '@src/common/feishu/helper/helper.module';
import AilyLogOperatorTable from './log-operator/adapter/aily-log-operator-table';
import { PrismaService } from '@src/common/service/prisma/prisma.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import LogOperatorAdapter from './log-operator/adapter/log-operator-adapter';
import WikiFixedTokenService from '@src/common/service/fixed-user-token/wiki-fixed-user-token';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { DocumentLoaderService } from './rag/services/ingest/document-loader.service';
import { WecomRagBotService } from './rag/wecom-rag-bot.service';
import { RagPrismaService } from './rag/services/prisma/rag-prisma.service';
import { RagDocumentService } from './rag/services/rag-document.service';
import { RagIngestService } from './rag/services/ingest/rag-ingest.service';
import { RagMemoryService } from './rag/services/qa/rag-memory.service';
import { RagAdminController } from './rag/rag-admin.controller';
import { RagAdminService } from './rag/services/rag-admin.service';
import { PromptRegistryService } from './rag/prompts/prompt.registry';
import { RagQueryService } from './rag/services/qa/rag-query.service';
import { RagStreamService } from './rag/services/qa/rag-stream.service';
import { RagQueryRewriteService } from './rag/services/qa/rag-query-rewrite.service';
import { RagRetrievalService } from './rag/services/qa/rag-retrieval.service';

@Module({
  imports: [
    HttpModule,
    FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AilyAplusClient)),
  ],
  providers: [
    AilyService,
    AilyLogOperatorTable,
    LogOperatorService,
    PrismaService,
    LoggerService,
    LogOperatorAdapter,
    WikiFixedTokenService,
    RagService,
    PromptRegistryService,
    RagQueryRewriteService,
    RagRetrievalService,
    RagQueryService,
    RagStreamService,
    RagPrismaService,
    RagIngestService,
    RagDocumentService,
    RagAdminService,
    RagMemoryService,
    DocumentLoaderService,
    WecomRagBotService,
  ],
  controllers: [
    AilyController,
    LogOperatorController,
    RagController,
    RagAdminController,
  ],
})
export class AiModule {}
