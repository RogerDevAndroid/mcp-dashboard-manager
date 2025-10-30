-- ============================================
-- MCP DASHBOARD MANAGER - DATABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABLA: mcp_servers
-- Catálogo de todos los MCP servers disponibles
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_servers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'development', 'project-management', 'database', 'payments', 'design', 'infrastructure', 'automation'
  transport_type TEXT NOT NULL CHECK (transport_type IN ('http', 'sse', 'stdio')),
  url TEXT, -- Para http/sse
  command TEXT, -- Para stdio
  args JSONB DEFAULT '[]'::jsonb,
  env_vars JSONB DEFAULT '{}'::jsonb, -- Variables de entorno requeridas
  icon_url TEXT,
  documentation_url TEXT,
  official BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'maintenance')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mcp_servers_category ON mcp_servers(category);
CREATE INDEX idx_mcp_servers_status ON mcp_servers(status);
CREATE INDEX idx_mcp_servers_name ON mcp_servers(name);

-- ============================================
-- TABLA: mcp_configurations
-- Configuraciones de usuarios para cada MCP
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'user' CHECK (scope IN ('local', 'project', 'user')),
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb, -- Configuración específica del usuario
  credentials JSONB DEFAULT '{}'::jsonb, -- Credenciales encriptadas
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mcp_server_id)
);

-- Índices
CREATE INDEX idx_mcp_configs_user ON mcp_configurations(user_id);
CREATE INDEX idx_mcp_configs_server ON mcp_configurations(mcp_server_id);
CREATE INDEX idx_mcp_configs_enabled ON mcp_configurations(enabled);

-- ============================================
-- TABLA: mcp_tools
-- Herramientas disponibles en cada MCP server
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_tools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  description TEXT,
  input_schema JSONB,
  examples JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mcp_server_id, tool_name)
);

-- Índices
CREATE INDEX idx_mcp_tools_server ON mcp_tools(mcp_server_id);
CREATE INDEX idx_mcp_tools_name ON mcp_tools(tool_name);

-- ============================================
-- TABLA: mcp_usage_logs
-- Registro de uso de MCPs y herramientas
-- ============================================
CREATE TABLE IF NOT EXISTS mcp_usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  tool_name TEXT,
  session_id TEXT,
  success BOOLEAN,
  execution_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mcp_logs_user ON mcp_usage_logs(user_id);
CREATE INDEX idx_mcp_logs_server ON mcp_usage_logs(mcp_server_id);
CREATE INDEX idx_mcp_logs_created ON mcp_usage_logs(created_at DESC);

-- ============================================
-- TABLA: agent_orchestrator
-- Configuración del agente orquestador
-- ============================================
CREATE TABLE IF NOT EXISTS agent_orchestrator (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  enabled_mcps JSONB DEFAULT '[]'::jsonb, -- Array de IDs de MCPs habilitados
  routing_rules JSONB DEFAULT '[]'::jsonb, -- Reglas de enrutamiento
  fallback_behavior TEXT DEFAULT 'ask_user' CHECK (fallback_behavior IN ('ask_user', 'skip', 'error')),
  max_iterations INTEGER DEFAULT 10,
  timeout_seconds INTEGER DEFAULT 300,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_agent_orchestrator_user ON agent_orchestrator(user_id);

-- ============================================
-- TABLA: specialized_agents
-- Agentes especializados pre-configurados
-- ============================================
CREATE TABLE IF NOT EXISTS specialized_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'sales', 'support', 'development', 'marketing', etc.
  system_prompt TEXT NOT NULL,
  required_mcps JSONB DEFAULT '[]'::jsonb, -- MCPs requeridos
  optional_mcps JSONB DEFAULT '[]'::jsonb, -- MCPs opcionales
  configuration JSONB DEFAULT '{}'::jsonb,
  icon_url TEXT,
  template BOOLEAN DEFAULT false, -- Es una plantilla o instancia
  user_id TEXT, -- NULL si es plantilla global
  parent_template_id UUID REFERENCES specialized_agents(id), -- Si fue creado desde plantilla
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_specialized_agents_category ON specialized_agents(category);
CREATE INDEX idx_specialized_agents_user ON specialized_agents(user_id);
CREATE INDEX idx_specialized_agents_template ON specialized_agents(template);

-- ============================================
-- TABLA: onboarding_steps
-- Pasos de onboarding para configurar MCPs
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL CHECK (step_type IN ('info', 'input', 'oauth', 'api_key', 'test', 'completion')),
  config JSONB DEFAULT '{}'::jsonb, -- Configuración específica del paso
  validation_rules JSONB DEFAULT '{}'::jsonb,
  help_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mcp_server_id, step_order)
);

-- Índices
CREATE INDEX idx_onboarding_mcp ON onboarding_steps(mcp_server_id);

-- ============================================
-- TABLA: user_onboarding_progress
-- Progreso de onboarding de cada usuario
-- ============================================
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  mcp_server_id UUID REFERENCES mcp_servers(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  step_data JSONB DEFAULT '{}'::jsonb, -- Datos guardados en cada paso
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, mcp_server_id)
);

-- Índices
CREATE INDEX idx_user_onboarding_user ON user_onboarding_progress(user_id);
CREATE INDEX idx_user_onboarding_completed ON user_onboarding_progress(completed);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_mcp_servers_updated_at BEFORE UPDATE ON mcp_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_configs_updated_at BEFORE UPDATE ON mcp_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_orchestrator_updated_at BEFORE UPDATE ON agent_orchestrator
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialized_agents_updated_at BEFORE UPDATE ON specialized_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de MCPs con conteo de usuarios
CREATE OR REPLACE VIEW mcp_servers_with_stats AS
SELECT
  ms.*,
  COUNT(DISTINCT mc.user_id) as user_count,
  COUNT(DISTINCT CASE WHEN mc.enabled THEN mc.user_id END) as active_user_count,
  AVG(CASE WHEN ml.created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as usage_rate_30d
FROM mcp_servers ms
LEFT JOIN mcp_configurations mc ON ms.id = mc.mcp_server_id
LEFT JOIN mcp_usage_logs ml ON ms.id = ml.mcp_server_id
GROUP BY ms.id;

-- Vista de agentes especializados con MCPs
CREATE OR REPLACE VIEW specialized_agents_with_mcps AS
SELECT
  sa.*,
  (
    SELECT json_agg(json_build_object(
      'id', ms.id,
      'name', ms.name,
      'display_name', ms.display_name,
      'category', ms.category
    ))
    FROM mcp_servers ms
    WHERE ms.id = ANY(SELECT jsonb_array_elements_text(sa.required_mcps)::uuid)
  ) as required_mcp_details,
  (
    SELECT json_agg(json_build_object(
      'id', ms.id,
      'name', ms.name,
      'display_name', ms.display_name,
      'category', ms.category
    ))
    FROM mcp_servers ms
    WHERE ms.id = ANY(SELECT jsonb_array_elements_text(sa.optional_mcps)::uuid)
  ) as optional_mcp_details
FROM specialized_agents sa;

-- ============================================
-- DATOS INICIALES - MCP SERVERS POPULARES
-- ============================================

-- Development & Testing Tools
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('sentry', 'Sentry', 'Monitor errors, debug production issues', 'development', 'http', 'https://mcp.sentry.dev/mcp', true, true),
('socket', 'Socket', 'Security analysis for dependencies', 'development', 'http', 'https://mcp.socket.dev/', true, true),
('hugging-face', 'Hugging Face', 'Access to Hugging Face Hub and Gradio AI Applications', 'development', 'http', 'https://huggingface.co/mcp', true, true),
('jam', 'Jam', 'Debug with AI agents accessing Jam recordings', 'development', 'http', 'https://mcp.jam.dev/mcp', true, true);

-- Project Management & Documentation
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('asana', 'Asana', 'Interact with your Asana workspace', 'project-management', 'sse', 'https://mcp.asana.com/sse', true, true),
('atlassian', 'Atlassian', 'Manage Jira tickets and Confluence docs', 'project-management', 'sse', 'https://mcp.atlassian.com/v1/sse', true, true),
('linear', 'Linear', 'Issue tracking and project management', 'project-management', 'http', 'https://mcp.linear.app/mcp', true, true),
('notion', 'Notion', 'Read docs, update pages, manage tasks', 'project-management', 'http', 'https://mcp.notion.com/mcp', true, true),
('box', 'Box', 'Enterprise content management and workflows', 'project-management', 'http', 'https://mcp.box.com/', true, true),
('fireflies', 'Fireflies', 'Extract insights from meeting transcripts', 'project-management', 'http', 'https://api.fireflies.ai/mcp', true, true),
('monday', 'Monday.com', 'Manage monday.com boards and workflows', 'project-management', 'http', 'https://mcp.monday.com/mcp', true, true),
('intercom', 'Intercom', 'Access customer conversations and tickets', 'project-management', 'http', 'https://mcp.intercom.com/mcp', true, true);

-- Databases & Data Management
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, command, args, env_vars, official, verified) VALUES
('airtable', 'Airtable', 'Read/write records, manage bases and tables', 'database', 'stdio', 'npx', '["airtable-mcp-server"]', '{"AIRTABLE_API_KEY": "required"}', true, true);

INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('daloopa', 'Daloopa', 'Financial data from SEC Filings', 'database', 'http', 'https://mcp.daloopa.com/server/mcp', true, true),
('hubspot', 'HubSpot', 'Access and manage HubSpot CRM data', 'database', 'http', 'https://mcp.hubspot.com/anthropic', true, true);

-- Payments & Commerce
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('paypal', 'PayPal', 'Payment processing and transaction management', 'payments', 'http', 'https://mcp.paypal.com/mcp', true, true),
('plaid', 'Plaid', 'Banking data and financial account linking', 'payments', 'sse', 'https://api.dashboard.plaid.com/mcp/sse', true, true),
('square', 'Square', 'Payments, inventory, orders', 'payments', 'sse', 'https://mcp.squareup.com/sse', true, true),
('stripe', 'Stripe', 'Payment processing and subscriptions', 'payments', 'http', 'https://mcp.stripe.com', true, true);

-- Design & Media
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('figma', 'Figma', 'Generate code from Figma designs', 'design', 'http', 'https://mcp.figma.com/mcp', true, true),
('invideo', 'InVideo', 'Video creation capabilities', 'design', 'sse', 'https://mcp.invideo.io/sse', true, true),
('canva', 'Canva', 'Browse, autofill, and generate Canva designs', 'design', 'http', 'https://mcp.canva.com/mcp', true, true);

-- Infrastructure & DevOps
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, url, official, verified) VALUES
('netlify', 'Netlify', 'Deploy and manage websites', 'infrastructure', 'http', 'https://netlify-mcp.netlify.app/mcp', true, true),
('stytch', 'Stytch', 'Authentication services management', 'infrastructure', 'http', 'http://mcp.stytch.dev/mcp', true, true),
('vercel', 'Vercel', 'Project and deployment management', 'infrastructure', 'http', 'https://mcp.vercel.com/', true, true);

-- Custom (nuestros MCPs)
INSERT INTO mcp_servers (name, display_name, description, category, transport_type, command, args, env_vars, official, verified) VALUES
('gohighlevel', 'GoHighLevel', 'CRM, contacts, and pipeline management', 'database', 'stdio', 'node', '["/root/rogervibes/ghlmcp/dist/index.js"]', '{"GHL_API_KEY": "required", "GHL_LOCATION_ID": "required"}', false, true),
('supabase-rag', 'Supabase RAG', 'RAG agent with memory and knowledge management', 'database', 'stdio', 'node', '["/root/rogervibes/supabasemcp/dist/index.js"]', '{"SUPABASE_URL": "required", "SUPABASE_SERVICE_ROLE_KEY": "required"}', false, true);

-- Comentarios
COMMENT ON TABLE mcp_servers IS 'Catálogo de MCP servers disponibles';
COMMENT ON TABLE mcp_configurations IS 'Configuraciones de usuarios para MCPs';
COMMENT ON TABLE mcp_tools IS 'Herramientas disponibles en cada MCP';
COMMENT ON TABLE mcp_usage_logs IS 'Logs de uso de MCPs';
COMMENT ON TABLE agent_orchestrator IS 'Configuración de agentes orquestadores';
COMMENT ON TABLE specialized_agents IS 'Agentes especializados y plantillas';
COMMENT ON TABLE onboarding_steps IS 'Pasos de onboarding para MCPs';
COMMENT ON TABLE user_onboarding_progress IS 'Progreso de onboarding de usuarios';
