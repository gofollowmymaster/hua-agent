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

export type WecomRagBotConfig = {
  enabled: boolean;
  botId: string;
  secret: string;
  wsUrl?: string;
};

export type GlobalConfigType = {
  DB_REDIS_HOST: string;
  DB_REDIS_PORT: number;
  DB_REDIS_DB: number;
  DB_REDIS_PASSWORD: string;

  //node-server报警群
  DefaultAlertFeishuGroupId: string;
  //dev调试报警群
  FeishuMsgDebugGroupId: string;
  //默认报警人 Ahua
  DefaultAlertFeishuUserId: string;
  //云效通知群
  AliDevopsFeishuGroupId: string;

  jwtSecret: string;
  jwtTokenExpired: string;
  globalAdminAppCode: string;

  sentryIntegrationToken: string;

  AliyunOrganizationId: string;

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
    //报警表格相关
    AlertTableAppToken: string;
    AlertApiTableId: string;
    AlertFrontendAppId: string;
    AlertFrontendIssueTableAppId: string;
    AlertApiIssueTableId: string;
    //Aplus Node-Server 管理表格
    AplusNodeAdminAppToken: string;
    AplusNodeAdminMtableTableId: string;
    DevopsTableAppToken: string;
    SupplierDiffAppToken: string;
  };

  robots: {
    //Aily智能报警提示相关
    AiHelperClient: FeishuAppConfig;
    //报警机器人相关
    AlertClient: FeishuAppConfig;
    //小郎
    XiaoLClient: FeishuAppConfig;
  };

  //服务商特性配置
  tenantConfig: TenantConfigType;
  defaultTenant: TenantCode;
};
export type GlobalConfigKey = keyof GlobalConfigType;

export type RagReasoningEffort =
  'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
