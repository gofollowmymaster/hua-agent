import db from './db';
import { GlobalConfigType } from './interface';
import tenantConfig, { tenantCodeMap } from './tenant/index';

const DEFAULT_RAG_DATABASE_URL = 'postgres://user:123456@localhost:5432/vc_rag';

function numberEnv(key: string, fallback: number) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function maxNumberEnv(key: string, fallback: number, max: number) {
  return Math.min(numberEnv(key, fallback), max);
}

const openAiApiKey = process.env.OPENAI_API_KEY ?? '';
const embeddingsApiKey = process.env.EMBEDDINGS_API_KEY ?? openAiApiKey;

const globalConfig: GlobalConfigType = Object.freeze({
  //node-server报警群
  DefaultAlertFeishuGroupId: process.env.SERVER_ALERT_GROUPID,
  //dev调试报警群
  FeishuMsgDebugGroupId: 'oc_504fc5a30c33892570ffb5163b6bec93',
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: '762a5468',
  //云效通知群
  AliDevopsFeishuGroupId: process.env.ALI_DEVOPS_NOTICE_GROUPID,

  ...db,
  jwtSecret: process.env.JWT_SECRET,
  jwtTokenExpired: process.env.JWT_TOKEN_EXPIRED_TIME,

  sentryIntegrationToken: process.env.SENTRY_API_TOKEN,

  AliyunOrganizationId: '65f941491febde2b6c514822',

  databaseUrl: process.env.RAG_DATABASE_URL ?? DEFAULT_RAG_DATABASE_URL,
  openAiApiKey,
  openAiBaseUrl: process.env.OPENAI_BASE_URL,
  modelName: process.env.MODEL_NAME ?? 'qwen-plus',
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

  feishuTables: {
    //报警表格相关
    AlertTableAppToken: process.env.FEISHU_ALERT_APP_TOKEN,
    AlertApiTableId: process.env.FEISHU_ALERT_API_TABLE_ID,
    AlertFrontendAppId: process.env.FEISHU_ALERT_FRONTEND_TABLE_ID,
    AlertFrontendIssueTableAppId:
      process.env.FEISHU_ALERT_FRONTEND_ISSUE_TABLE_ID,
    AlertApiIssueTableId: process.env.FEISHU_ALERT_API_ISSUE_TABLE_ID,
    //Aplus Node-Server 管理表格
    AplusNodeAdminAppToken: process.env.FEISHU_APLUS_NODE_ADMIN_APP_TOKEN,
    AplusNodeAdminMtableTableId:
      process.env.FEISHU_APLUS_NODE_ADMIN_MTABLE_TABLE_ID,
    DevopsTableAppToken: 'Jz0abVIqeajmfesIkfRcwiannof',
    SupplierDiffAppToken: 'HHtzbuGuua3mRvszTI8cYKBVnId',
    TrackingMetadataAppToken: 'C6ElwN9sHiLXdKka7g5c0iSinBe',
  },

  robots: {
    XiaoAClient: {
      appId: 'cli_a7b9fe27a3f8d00e',
      appSecret: 'I7EAE1RyP9ClVfee2btuidKZarf8JHez',
    },
    //前端助手
    AiHelperClient: {
      appId: process.env.FEISHU_AILY_ALERT_APP_ID,
      appSecret: process.env.FEISHU_AILY_ALERT_APP_SECRET,
    },
    //通知助手
    AlertClient: {
      appId: process.env.FEISHU_ALERT_APP_APPID,
      appSecret: process.env.FEISHU_ALERT_APP_APPSECRET,
    },
    //小A随笔
    XiaoLClient: {
      appId: 'cli_a86495e1f4fa500b',
      appSecret: 'YkaB6aMhGbvurRFyWOymqhpXoQw5BiM8',
    },
    //导航
    AplusNavClient: {
      appId: 'cli_a9f22e5f0d39dced',
      appSecret: 'RNNA54hq3hM8fOqZrSDzIrBRXK1BF3tI',
    },
  },

  //服务商特性配置
  tenantConfig,
  defaultTenant: tenantCodeMap.A,
});

export default globalConfig;
//todo 获取机器人配置   获取服务商具体配置项
