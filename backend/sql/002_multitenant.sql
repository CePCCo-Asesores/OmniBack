-- ORGANIZACIONES (donatarias / clientes)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rfc TEXT,
  contact_email TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELACIÓN usuario ↔ organización con rol
-- roles: 'admin' | 'member'
CREATE TABLE IF NOT EXISTS organization_users (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- PLANES (catálogo)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  declared_value_usd NUMERIC(12,2) NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUSCRIPCIONES (organización → plan)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL CHECK (status IN ('active','paused','cancelled')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENTES (catálogo global)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,     -- ej: "pricing_architect"
  name TEXT NOT NULL,           -- ej: "Arquitecto de Monetización Élite"
  description TEXT,
  category TEXT,                -- ej: "marketing","education"
  config JSONB DEFAULT '{}'::jsonb,  -- prompts, parámetros
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AGENTES habilitados por organización (opcional, si quieres whitelists)
CREATE TABLE IF NOT EXISTS organization_agents (
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, agent_id)
);

-- LOG DE EJECUCIONES (evidencia de valor/uso)
CREATE TABLE IF NOT EXISTS agent_logs (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  input JSONB,
  output JSONB,
  tokens_in INT,
  tokens_out INT,
  cost_usd NUMERIC(12,5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES sugeridos
CREATE INDEX IF NOT EXISTS idx_org_users_user ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_org ON agent_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent ON agent_logs(agent_id);

-- SEED de planes (opcional)
INSERT INTO plans (id, name, declared_value_usd, features)
VALUES
  ('plan_essentials','Impacto Esencial', 299.00, '{"campaigns_per_month":2,"channels":["social","email","blog"]}'),
  ('plan_growth','Crecimiento Sostenible', 749.00, '{"campaigns_per_month":8,"channels":["social","email","blog","ads","press"],"roi_analytics":true}'),
  ('plan_lead','Liderazgo 360', 1999.00, '{"campaigns_per_month":-1,"channels":["social","email","blog","ads","press","radio_tv"],"predictive":true,"priority_support":true}')
ON CONFLICT (id) DO NOTHING;
