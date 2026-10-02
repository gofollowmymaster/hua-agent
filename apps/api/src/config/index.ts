import db from './db';
import { GlobalConfigType, RagReasoningEffort } from './interface';
import tenantConfig, { tenantCodeMap } from './tenant/index';

const DEFAULT_RAG_DATABASE_URL = 'postgres://user:123456@localhost:5432/vc_rag';

function numberEnv(key: string, fallback: number) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function maxNumberEnv(key: string, fallback: number, max: number) {
  return Math.min(numberEnv(key, fallback), max);
}

function booleanEnv(key: string, fallback: boolean) {
  const value = process.env[key]?.trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

const openAiApiKey = process.env.OPENAI_API_KEY ?? '';
const embeddingsApiKey = process.env.EMBEDDINGS_API_KEY ?? openAiApiKey;
const ragReasoningEffort = [
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
].includes(process.env.RAG_REASONING_EFFORT)
  ? (process.env.RAG_REASONING_EFFORT as RagReasoningEffort)
  : 'xhigh';

const globalConfig: GlobalConfigType = Object.freeze({
  //node-server报警群
  DefaultAlertFeishuGroupId: process.env.SERVER_ALERT_GROUPID,

  ...db,
  jwtSecret: process.env.JWT_SECRET,
  jwtTokenExpired: process.env.JWT_TOKEN_EXPIRED_TIME,

  databaseUrl: process.env.RAG_DATABASE_URL ?? DEFAULT_RAG_DATABASE_URL,
  openAiApiKey,
  openAiBaseUrl: process.env.OPENAI_BASE_URL,
  modelName: process.env.MODEL_NAME ?? 'qwen-plus',
  queryRewriteModelName: process.env.RAG_QUERY_REWRITE_MODEL || 'qwen-turbo',
  ragReasoningEffort,
  embeddingsApiKey,
  embeddingsBaseUrl:
    process.env.EMBEDDINGS_BASE_URL ?? process.env.OPENAI_BASE_URL,
  embeddingsModelName: process.env.EMBEDDINGS_MODEL_NAME ?? 'text-embedding-v3',
  embeddingsDimensions: numberEnv('EMBEDDINGS_DIMENSIONS', 1024),
  rerankApiKey: process.env.RERANK_API_KEY || embeddingsApiKey,
  rerankUrl: process.env.RERANK_URL || undefined,
  rerankModel: process.env.RERANK_MODEL || 'qwen3-rerank',
  rerankTimeoutMs: numberEnv('RERANK_TIMEOUT_MS', 10000),

  vcHelper: {
    rawDir: process.env.RAW_DIR ?? 'raw',
    chunkSize: numberEnv('RAG_CHUNK_SIZE', 800),
    chunkOverlap: numberEnv('RAG_CHUNK_OVERLAP', 120),
    embeddingBatchSize: maxNumberEnv('RAG_EMBEDDING_BATCH_SIZE', 10, 10),
    defaultTopK: numberEnv('RAG_DEFAULT_TOP_K', 8),
    ragPromptVersion: process.env.RAG_PROMPT_VERSION ?? 'v1',
    retrieval: {
      vectorTopK: maxNumberEnv('RAG_VECTOR_TOP_K', 8, 100),
      keywordTopK: maxNumberEnv('RAG_KEYWORD_TOP_K', 8, 100),
      fusionK: numberEnv('RAG_FUSION_K', 60),
      rerankMode: ['none', 'rule', 'model'].includes(
        process.env.RAG_RERANK_MODE,
      )
        ? (process.env.RAG_RERANK_MODE as 'none' | 'rule' | 'model')
        : 'rule',
      rerankTopN: maxNumberEnv('RAG_RERANK_TOP_N', 30, 100),
    },
  },
  agentKnowledge: {
    docsDir: process.env.AGENT_DOCS_DIR ?? 'src/agent/docs',
    chunkSize: numberEnv('AGENT_CHUNK_SIZE', 800),
    chunkOverlap: numberEnv('AGENT_CHUNK_OVERLAP', 120),
    embeddingBatchSize: maxNumberEnv('AGENT_EMBEDDING_BATCH_SIZE', 10, 10),
  },

  feishuTables: {
    AplusNodeAdminAppToken: process.env.FEISHU_APLUS_NODE_ADMIN_APP_TOKEN,
  },

  robots: {
    AlertClient: {
      appId: process.env.FEISHU_ALERT_APP_APPID,
      appSecret: process.env.FEISHU_ALERT_APP_APPSECRET,
    },
  },

  //服务商特性配置
  tenantConfig,
  defaultTenant: tenantCodeMap.A,
  bootstrapAdmin: {
    username: process.env.RAG_ADMIN_BOOTSTRAP_USERNAME?.trim() ?? '',
    password: process.env.RAG_ADMIN_BOOTSTRAP_PASSWORD ?? '',
    supplierCode: process.env.RAG_ADMIN_BOOTSTRAP_SUPPLIER_CODE?.trim() ?? 'A',
    displayName: process.env.RAG_ADMIN_BOOTSTRAP_DISPLAY_NAME?.trim() ?? '',
    resetPassword: booleanEnv('RAG_ADMIN_BOOTSTRAP_RESET_PASSWORD', false),
  },
});

export default globalConfig;
//todo 获取机器人配置   获取服务商具体配置项
