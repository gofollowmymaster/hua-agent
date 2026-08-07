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
import { RagDocumentService } from './rag/services/rag-document.service';
import { RagIngestService } from './rag/services/ingest/rag-ingest.service';
import { RagMemoryService } from './rag/services/qa/rag-memory.service';
import { RagAdminController } from './rag-admin/rag-admin.controller';
import { RagAdminService } from './rag-admin/rag-admin.service';
import { PromptRegistryService } from './rag/prompts/prompt.registry';
import { RagQueryService } from './rag/services/qa/rag-workflow.service';
import { RagQueryRewriteService } from './rag/services/qa/rag-query-rewrite.service';
import { RagRetrievalService } from './rag/services/qa/retrieval/rag-retrieval.service';
import { RagVectorRetrieverService } from './rag/services/qa/retrieval/rag-vector-retriever.service';
import { RagFullTextRetrieverService } from './rag/services/qa/retrieval/rag-full-text-retriever.service';
import { RagFusionService } from './rag/services/qa/retrieval/rag-fusion.service';
import { RagRerankService } from './rag/services/qa/retrieval/rerank/rag-rerank.service';
import { NoopReranker } from './rag/services/qa/retrieval/rerank/noop-reranker.service';
import { RuleBasedReranker } from './rag/services/qa/retrieval/rerank/rule-based-reranker.service';
import { Qwen3Reranker } from './rag/services/qa/retrieval/rerank/qwen3-reranker.service';
import { RagQuestionRouterService } from './rag/services/qa/rag-question-router.service';
import { RagDocumentUploadService } from './rag-admin/rag-document-upload.service';

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
    RagQuestionRouterService,
    RagRetrievalService,
    RagVectorRetrieverService,
    RagFullTextRetrieverService,
    RagFusionService,
    RagRerankService,
    NoopReranker,
    RuleBasedReranker,
    Qwen3Reranker,
    RagQueryService,
    RagIngestService,
    RagDocumentUploadService,
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
