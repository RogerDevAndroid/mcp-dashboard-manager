-- auth-schema-fixed.sql
-- Sistema de autenticación y roles para Dashboard de Brokers
-- VERSIÓN CORREGIDA - Ejecutar DESPUÉS de gamification-schema.sql

-- =====================================================
-- 0. VERIFICACIÓN PREVIA
-- =====================================================

-- Verificar que gamification-schema.sql se ejecutó primero
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'broker_profiles') THEN
    RAISE EXCEPTION 'ERROR: La tabla broker_profiles no existe. Debes ejecutar gamification-schema.sql primero.';
  END IF;
END $$;

-- =====================================================
-- 1. EXTENDER TABLA DE PERFILES CON AUTH
-- =====================================================

-- Agregar columnas de autenticación a broker_profiles
ALTER TABLE broker_profiles
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'broker',
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Agregar constraints después de crear las columnas
DO $$
BEGIN
  -- Agregar CHECK constraint para role
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'broker_profiles_role_check'
  ) THEN
    ALTER TABLE broker_profiles
    ADD CONSTRAINT broker_profiles_role_check
    CHECK (role IN ('broker', 'manager', 'director', 'admin'));
  END IF;

  -- Agregar foreign key para user_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'broker_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE broker_profiles
    ADD CONSTRAINT broker_profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_broker_profiles_user_id ON broker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_profiles_role ON broker_profiles(role);

-- =====================================================
-- 2. TABLA DE SESIONES Y ACTIVIDAD
-- =====================================================

DROP TABLE IF EXISTS user_sessions CASCADE;

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  broker_id VARCHAR(100),
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar foreign keys después de crear la tabla
ALTER TABLE user_sessions
ADD CONSTRAINT user_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Solo agregar FK a broker_id si la columna existe en broker_profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_profiles'
    AND column_name = 'broker_id'
  ) THEN
    ALTER TABLE user_sessions
    ADD CONSTRAINT user_sessions_broker_id_fkey
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_broker_id ON user_sessions(broker_id);

-- =====================================================
-- 3. TABLA DE PERMISOS PERSONALIZADOS
-- =====================================================

DROP TABLE IF EXISTS user_permissions CASCADE;

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  broker_id VARCHAR(100),
  permission VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission, resource)
);

-- Agregar foreign keys
ALTER TABLE user_permissions
ADD CONSTRAINT user_permissions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_permissions
ADD CONSTRAINT user_permissions_granted_by_fkey
FOREIGN KEY (granted_by) REFERENCES auth.users(id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'broker_profiles'
    AND column_name = 'broker_id'
  ) THEN
    ALTER TABLE user_permissions
    ADD CONSTRAINT user_permissions_broker_id_fkey
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

-- =====================================================
-- 4. TABLA DE FILTROS GUARDADOS
-- =====================================================

DROP TABLE IF EXISTS saved_filters CASCADE;

CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  filter_config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE saved_filters
ADD CONSTRAINT saved_filters_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en broker_profiles
ALTER TABLE broker_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS broker_view_own_profile ON broker_profiles;
DROP POLICY IF EXISTS broker_view_own_activities ON actividades;
DROP POLICY IF EXISTS broker_insert_own_activities ON actividades;

-- Política: Los brokers solo ven sus propios datos
CREATE POLICY broker_view_own_profile ON broker_profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM broker_profiles bp
      WHERE bp.user_id = auth.uid()
      AND bp.role IN ('director', 'admin', 'manager')
    )
  );

-- RLS para actividades (solo si la tabla existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'actividades') THEN
    ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

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

    CREATE POLICY broker_insert_own_activities ON actividades
      FOR INSERT
      WITH CHECK (
        broker_id IN (
          SELECT broker_id FROM broker_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- RLS para otras tablas (solo si existen)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tareas') THEN
    ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'logros') THEN
    ALTER TABLE logros ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =====================================================
-- 6. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener rol del usuario
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR AS $$
  SELECT role FROM broker_profiles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar permisos
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
    RETURN perm IN ('view_all_dashboards', 'view_executive_dashboard', 'manage_leads', 'view_own_activities');
  END IF;

  -- Broker solo permisos básicos
  IF user_role = 'broker' THEN
    RETURN perm IN ('view_own_dashboard', 'view_own_activities');
  END IF;

  -- Verificar permisos personalizados
  SELECT EXISTS(
    SELECT 1 FROM user_permissions
    WHERE user_id = user_uuid
    AND permission = perm
    AND (resource IS NULL OR resource = res)
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_perm;

  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede ver datos de un broker
CREATE OR REPLACE FUNCTION can_view_broker_data(user_uuid UUID, target_broker_id VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
  user_broker_id VARCHAR;
BEGIN
  -- Obtener rol y broker_id del usuario
  SELECT role, broker_id INTO user_role, user_broker_id
  FROM broker_profiles
  WHERE user_id = user_uuid
  LIMIT 1;

  -- Admins, directors, managers pueden ver todo
  IF user_role IN ('admin', 'director', 'manager') THEN
    RETURN TRUE;
  END IF;

  -- Brokers solo pueden ver sus propios datos
  IF user_role = 'broker' AND user_broker_id = target_broker_id THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VISTA DE USUARIOS ACTIVOS
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

-- =====================================================
-- 8. COMENTARIOS
-- =====================================================

COMMENT ON TABLE user_sessions IS 'Registro de sesiones de usuarios para analytics';
COMMENT ON TABLE user_permissions IS 'Permisos personalizados que sobrescriben permisos de rol';
COMMENT ON TABLE saved_filters IS 'Filtros guardados por usuarios para dashboard ejecutivo';
COMMENT ON COLUMN broker_profiles.role IS 'Rol del usuario: broker, manager, director, admin';
COMMENT ON FUNCTION has_permission IS 'Verifica si un usuario tiene un permiso específico';
COMMENT ON FUNCTION can_view_broker_data IS 'Verifica si un usuario puede ver datos de un broker específico';

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

SELECT
  'Auth schema created successfully!' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'user_sessions') as user_sessions_created,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'user_permissions') as permissions_created,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'saved_filters') as filters_created,
  (SELECT COUNT(*) FROM pg_constraint WHERE conname LIKE '%broker_profiles%role%') as role_constraint_added;
