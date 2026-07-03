CREATE TABLE IF NOT EXISTS aplus_rag_sessions (
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
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'aplus_rag_sessions_tenant_code_channel_session_key_key'
  ) THEN
    ALTER TABLE aplus_rag_sessions
      ADD CONSTRAINT aplus_rag_sessions_tenant_code_channel_session_key_key
      UNIQUE (tenant_code, channel, session_key);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS aplus_rag_messages (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  session_id BIGINT NOT NULL REFERENCES aplus_rag_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sender_id TEXT,
  external_message_id TEXT,
  reply_to_message_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'aplus_rag_messages_role_check'
  ) THEN
    ALTER TABLE aplus_rag_messages
      ADD CONSTRAINT aplus_rag_messages_role_check
      CHECK (role IN ('user', 'assistant'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_aplus_rag_sessions_tenant_channel
  ON aplus_rag_sessions (tenant_code, channel);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_sessions_last_active
  ON aplus_rag_sessions (last_active_at);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_messages_tenant_session_created
  ON aplus_rag_messages (tenant_code, session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_aplus_rag_messages_external_message
  ON aplus_rag_messages (tenant_code, external_message_id);
