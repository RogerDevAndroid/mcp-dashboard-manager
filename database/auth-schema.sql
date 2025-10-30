-- auth-schema.sql
-- Sistema de autenticación y roles para Dashboard de Brokers
-- Ejecutar DESPUÉS de gamification-schema.sql

-- =====================================================
-- 1. EXTENDER TABLA DE PERFILES CON AUTH
-- =====================================================

-- Agregar columnas de autenticación a broker_profiles
ALTER TABLE broker_profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'broker' CHECK (role IN ('broker', 'manager', 'director', 'admin')),
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_broker_profiles_user_id ON broker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_profiles_role ON broker_profiles(role);

-- =====================================================
-- 2. TABLA DE SESIONES Y ACTIVIDAD
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_id VARCHAR(100) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_broker_id ON user_sessions(broker_id);

-- =====================================================
-- 3. TABLA DE PERMISOS PERSONALIZADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_id VARCHAR(100) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission, resource)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

-- Permisos disponibles:
-- 'view_own_dashboard' - Ver su propio dashboard
-- 'view_all_dashboards' - Ver dashboards de todos
-- 'view_executive_dashboard' - Ver dashboard ejecutivo
-- 'manage_brokers' - Gestionar brokers
-- 'manage_leads' - Gestionar leads
-- 'export_data' - Exportar datos
-- 'manage_users' - Gestionar usuarios
-- 'configure_system' - Configurar sistema

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE broker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_asignados ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades_broker ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_broker ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuniones_calendario ENABLE ROW LEVEL SECURITY;

-- Política: Los brokers solo ven sus propios datos
CREATE POLICY broker_view_own_profile ON broker_profiles
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM broker_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.role IN ('director', 'admin', 'manager')
    )
  );

CREATE POLICY broker_view_own_activities ON actividades
  FOR SELECT
  USING (
    broker_id IN (
      SELECT broker_id FROM broker_profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM broker_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.role IN ('director', 'admin', 'manager')
    )
  );

CREATE POLICY broker_view_own_leads ON leads_asignados
  FOR SELECT
  USING (
    broker_id IN (
      SELECT broker_id FROM broker_profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM broker_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.role IN ('director', 'admin', 'manager')
    )
  );

CREATE POLICY broker_view_own_opportunities ON oportunidades_broker
  FOR SELECT
  USING (
    broker_id IN (
      SELECT broker_id FROM broker_profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM broker_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.role IN ('director', 'admin', 'manager')
    )
  );

CREATE POLICY broker_insert_own_activities ON actividades
  FOR INSERT
  WITH CHECK (
    broker_id IN (
      SELECT broker_id FROM broker_profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 5. FUNCIÓN PARA OBTENER ROL DEL USUARIO
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR AS $$
  SELECT role FROM broker_profiles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- 6. FUNCIÓN PARA VERIFICAR PERMISOS
-- =====================================================

CREATE OR REPLACE FUNCTION has_permission(
  user_uuid UUID,
  perm VARCHAR,
  res VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
  has_perm BOOLEAN;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO user_role FROM broker_profiles WHERE user_id = user_uuid LIMIT 1;

  -- Admin tiene todos los permisos
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Director tiene casi todos los permisos
  IF user_role = 'director' THEN
    RETURN perm != 'manage_users' AND perm != 'configure_system';
  END IF;

  -- Manager tiene permisos limitados
  IF user_role = 'manager' THEN
    RETURN perm IN ('view_all_dashboards', 'view_executive_dashboard', 'manage_leads');
  END IF;

  -- Broker solo permisos básicos
  IF user_role = 'broker' THEN
    RETURN perm = 'view_own_dashboard';
  END IF;

  -- Verificar permisos personalizados
  SELECT EXISTS(
    SELECT 1 FROM user_permissions
    WHERE user_id = user_uuid
    AND permission = perm
    AND (resource IS NULL OR resource = res)
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_perm;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. POBLAR USUARIOS INICIALES
-- =====================================================

-- IMPORTANTE: Después de crear usuarios en Supabase Auth, ejecutar esto
-- para vincularlos con los broker_profiles

-- Ejemplo de cómo vincular:
-- UPDATE broker_profiles
-- SET user_id = '[UUID del usuario de Supabase Auth]',
--     role = 'director'
-- WHERE email = 'd.general@selvadentrotulum.com';

-- Roles predefinidos:
-- Juan Esteban Camara -> director
-- Omar Curi -> manager
-- Resto de brokers -> broker

COMMENT ON TABLE user_sessions IS 'Registro de sesiones de usuarios para analytics';
COMMENT ON TABLE user_permissions IS 'Permisos personalizados que sobrescriben permisos de rol';
COMMENT ON COLUMN broker_profiles.role IS 'Rol del usuario: broker, manager, director, admin';
COMMENT ON FUNCTION has_permission IS 'Verifica si un usuario tiene un permiso específico';

-- =====================================================
-- 8. VISTA DE USUARIOS ACTIVOS
-- =====================================================

CREATE OR REPLACE VIEW vw_users_active AS
SELECT
  bp.broker_id,
  bp.nombre,
  bp.email,
  bp.role,
  bp.activo,
  bp.ultimo_login,
  u.email as auth_email,
  u.last_sign_in_at,
  u.created_at as auth_created_at
FROM broker_profiles bp
LEFT JOIN auth.users u ON bp.user_id = u.id
WHERE bp.activo = true
ORDER BY bp.role, bp.nombre;

COMMENT ON VIEW vw_users_active IS 'Vista de usuarios activos con información de auth';

-- =====================================================
-- 9. TRIGGER PARA ACTUALIZAR ÚLTIMO LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE broker_profiles
  SET ultimo_login = NOW()
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Este trigger se activa cuando el usuario hace sign in
-- Nota: Necesita configuración adicional en Supabase Auth webhooks

-- =====================================================
-- 10. TABLA DE FILTROS GUARDADOS (PARA DASHBOARD EJECUTIVO)
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);

COMMENT ON TABLE saved_filters IS 'Filtros guardados por usuarios para dashboard ejecutivo';
COMMENT ON COLUMN saved_filters.filter_config IS 'JSON con configuración: {dateRange, brokers, pipelines, etc}';

-- Ejemplo de filter_config:
-- {
--   "dateRange": {"start": "2025-01-01", "end": "2025-01-31"},
--   "brokers": ["JWkZYNaQyKuRfPEnBeiC", "TKzZQuHjdRG9x4tpwpRx"],
--   "pipelines": ["pipeline_001"],
--   "stages": ["prospecto", "calificado"],
--   "minRevenue": 1000,
--   "maxRevenue": 100000
-- }

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================

-- Para verificar que todo se creó correctamente:
SELECT
  'Auth schema created successfully' as status,
  COUNT(*) FILTER (WHERE tablename = 'user_sessions') as user_sessions_created,
  COUNT(*) FILTER (WHERE tablename = 'user_permissions') as permissions_created,
  COUNT(*) FILTER (WHERE tablename = 'saved_filters') as filters_created
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_sessions', 'user_permissions', 'saved_filters');
