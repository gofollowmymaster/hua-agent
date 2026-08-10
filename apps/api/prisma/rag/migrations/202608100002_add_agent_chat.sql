CREATE TABLE IF NOT EXISTS agent_chat_sessions (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  channel TEXT NOT NULL,
  session_key TEXT NOT NULL,
  user_id TEXT,
  conversation_id TEXT,
  conversation_type TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, channel, session_key)
);

CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  session_id BIGINT NOT NULL REFERENCES agent_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSONB NOT NULL DEFAULT '{}'::jsonb,
  sender_id TEXT,
  external_message_id TEXT,
  reply_to_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_tenant_channel
  ON agent_chat_sessions (tenant_code, channel);

CREATE INDEX IF NOT EXISTS idx_agent_chat_sessions_last_active
  ON agent_chat_sessions (last_active_at);

CREATE INDEX IF NOT EXISTS idx_agent_chat_messages_tenant_session_created
  ON agent_chat_messages (tenant_code, session_id, created_at);
