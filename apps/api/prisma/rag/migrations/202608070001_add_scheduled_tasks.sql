CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id BIGSERIAL PRIMARY KEY,
  task_key TEXT NOT NULL UNIQUE,
  module TEXT NOT NULL,
  description TEXT NOT NULL,
  cron TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled',
  last_run_time TIMESTAMPTZ,
  last_run_result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status
  ON scheduled_tasks (status);

CREATE TABLE IF NOT EXISTS scheduled_task_logs (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
  execute_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  result TEXT NOT NULL,
  message TEXT,
  cost_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_task_logs_task_execute
  ON scheduled_task_logs (task_id, execute_time);
