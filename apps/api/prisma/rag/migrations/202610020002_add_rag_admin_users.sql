CREATE TABLE IF NOT EXISTS rag_admin_users (
  id SERIAL PRIMARY KEY,
  tenant_code TEXT NOT NULL,
  supplier_code TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_system_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tenant_code, username)
);

CREATE INDEX IF NOT EXISTS idx_rag_admin_users_tenant_code
  ON rag_admin_users (tenant_code);
