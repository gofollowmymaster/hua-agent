CREATE TABLE IF NOT EXISTS agent_user_skills (
  id BIGSERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES rag_admin_users(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  instruction TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT agent_user_skills_tenant_user_name_key
    UNIQUE (tenant_code, user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_agent_user_skills_tenant_user
  ON agent_user_skills (tenant_code, user_id);

CREATE INDEX IF NOT EXISTS idx_agent_user_skills_tenant_user_enabled
  ON agent_user_skills (tenant_code, user_id, is_enabled);
