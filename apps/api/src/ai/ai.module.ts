import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { DocumentLoaderService } from './rag/services/ingest/document-loader.service';
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
  imports: [HttpModule],
  providers: [
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
    RagAdminService,
    RagMemoryService,
    DocumentLoaderService,
  ],
  controllers: [RagController, RagAdminController],
})
export class AiModule {}
