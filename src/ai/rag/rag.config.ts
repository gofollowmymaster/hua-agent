export interface RagConfig {
  databaseUrl: string;
  openAiApiKey: string;
  openAiBaseUrl?: string;
  modelName: string;
  embeddingsApiKey: string;
  embeddingsBaseUrl?: string;
  embeddingsModelName: string;
  embeddingsDimensions: number;
  rawDir: string;
  chunkSize: number;
  chunkOverlap: number;
  embeddingBatchSize: number;
  defaultTopK: number;
}

export interface WecomRagBotConfig {
  enabled: boolean;
  botId: string;
  secret: string;
  wsUrl?: string;
  defaultTopK?: number;
}

const DEFAULT_RAG_DATABASE_URL = 'postgres://user:123456@localhost:5432/vc_rag';

export function getRagConfig(): RagConfig {
  const openAiApiKey = process.env.OPENAI_API_KEY ?? '';

  return {
    databaseUrl: process.env.RAG_DATABASE_URL ?? DEFAULT_RAG_DATABASE_URL,
    openAiApiKey,
    openAiBaseUrl: process.env.OPENAI_BASE_URL,
    modelName: process.env.MODEL_NAME ?? 'qwen-plus',
    embeddingsApiKey: process.env.EMBEDDINGS_API_KEY ?? openAiApiKey,
    embeddingsBaseUrl:
      process.env.EMBEDDINGS_BASE_URL ?? process.env.OPENAI_BASE_URL,
    embeddingsModelName:
      process.env.EMBEDDINGS_MODEL_NAME ?? 'text-embedding-v3',
    embeddingsDimensions: numberEnv('EMBEDDINGS_DIMENSIONS', 1024),
    rawDir: process.env.RAW_DIR ?? 'raw',
    chunkSize: numberEnv('RAG_CHUNK_SIZE', 800),
    chunkOverlap: numberEnv('RAG_CHUNK_OVERLAP', 120),
    embeddingBatchSize: maxNumberEnv('RAG_EMBEDDING_BATCH_SIZE', 10, 10),
    defaultTopK: numberEnv('RAG_DEFAULT_TOP_K', 5),
  };
}

export function getWecomRagBotConfig(): WecomRagBotConfig {
  return {
    enabled: booleanEnv('WECOM_RAG_BOT_ENABLED', false),
    botId: process.env.WECOM_RAG_BOT_ID ?? '',
    secret: process.env.WECOM_RAG_BOT_SECRET ?? '',
    wsUrl: process.env.WECOM_RAG_BOT_WS_URL,
    defaultTopK: optionalNumberEnv('WECOM_RAG_DEFAULT_TOP_K'),
  };
}

function booleanEnv(key: string, fallback: boolean) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function numberEnv(key: string, fallback: number) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function optionalNumberEnv(key: string) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function maxNumberEnv(key: string, fallback: number, max: number) {
  return Math.min(numberEnv(key, fallback), max);
}
