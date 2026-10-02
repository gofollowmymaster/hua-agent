import { TenantCode, TenantConfigType } from './tenant';

export type FeishuAppConfig = {
  appId: string;
  appSecret: string;
};

export type RagConfig = {
  rawDir: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingBatchSize: number;
  defaultTopK: number;
  /** RAG 提示词版本，如 'v1'、'v2'。默认为 'v1' */
  ragPromptVersion: string;
  retrieval: RagRetrievalConfig;
};

export type RagRerankMode = 'none' | 'rule' | 'model';

export type RagRetrievalConfig = {
  vectorTopK: number;
  keywordTopK: number;
  fusionK: number;
  rerankMode: RagRerankMode;
  rerankTopN: number;
};

export type AgentKnowledgeConfig = {
  docsDir: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingBatchSize: number;
};

export type AuthBootstrapConfig = {
  username: string;
  password: string;
  supplierCode: string;
  displayName: string;
  resetPassword: boolean;
};

export type GlobalConfigType = {
  DB_REDIS_HOST: string;
  DB_REDIS_PORT: number;
  DB_REDIS_DB: number;
  DB_REDIS_PASSWORD: string;

  //node-server报警群
  DefaultAlertFeishuGroupId: string;
  jwtSecret: string;
  jwtTokenExpired: string;

  databaseUrl: string;
  openAiApiKey: string;
  openAiBaseUrl?: string;
  modelName: string;
  queryRewriteModelName: string;
  ragReasoningEffort: RagReasoningEffort;
  embeddingsApiKey: string;
  embeddingsBaseUrl?: string;
  embeddingsModelName: string;
  embeddingsDimensions: number;
  rerankApiKey: string;
  rerankUrl?: string;
  rerankModel: string;
  rerankTimeoutMs: number;

  vcHelper: RagConfig;
  agentKnowledge: AgentKnowledgeConfig;

  feishuTables: {
    AplusNodeAdminAppToken: string;
  };

  robots: {
    AlertClient: FeishuAppConfig;
  };

  //服务商特性配置
  tenantConfig: TenantConfigType;
  defaultTenant: TenantCode;
  bootstrapAdmin: AuthBootstrapConfig;
};
export type GlobalConfigKey = keyof GlobalConfigType;

export type RagReasoningEffort =
  'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
