-- Usuarios base
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- UUID generado desde Node
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  roles TEXT[] DEFAULT ARRAY['user'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Cuentas vinculadas a proveedores (Google, etc.)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,                    -- UUID desde Node
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refresh tokens rotativos (solo se guardan hashes)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,                    -- UUID desde Node
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_valid ON refresh_tokens(user_id, revoked, expires_at);
