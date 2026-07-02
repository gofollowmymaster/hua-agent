export interface WecomRagBotConfig {
  enabled: boolean;
  botId: string;
  secret: string;
  wsUrl?: string;
  defaultTopK?: number;
}

export function getWecomRagBotConfig(): WecomRagBotConfig {
  return {
    enabled: booleanEnv('WECOM_RAG_BOT_ENABLED', false),
    botId: process.env.WECOM_RAG_BOT_ID ?? '',
    secret: process.env.WECOM_RAG_BOT_SECRET ?? '',
    wsUrl: process.env.WECOM_RAG_BOT_WS_URL,
    defaultTopK: numberEnv('WECOM_RAG_DEFAULT_TOP_K'),
  };
}

function booleanEnv(key: string, fallback: boolean) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function numberEnv(key: string) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}
