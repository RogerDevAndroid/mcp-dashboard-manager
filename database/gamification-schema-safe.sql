-- gamification-schema-safe.sql
-- Sistema de Gamificación para Dashboard de Brokers
-- VERSIÓN SAFE - No falla si las tablas ya existen

-- =====================================================
-- 1. TABLA DE PERFILES DE BROKERS
-- =====================================================

CREATE TABLE IF NOT EXISTS broker_profiles (
  broker_id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  avatar TEXT,
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  nivel VARCHAR(50) NOT NULL DEFAULT 'Rookie',
  puntos_mes INTEGER DEFAULT 0,
  puntos_total INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  ghl_user_id VARCHAR(100),
  ghl_location_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices (con IF NOT EXISTS implícito mediante DROP si existe primero)
DROP INDEX IF EXISTS idx_broker_profiles_email;
CREATE INDEX idx_broker_profiles_email ON broker_profiles(email);

DROP INDEX IF EXISTS idx_broker_profiles_activo;
CREATE INDEX idx_broker_profiles_activo ON broker_profiles(activo);

DROP INDEX IF EXISTS idx_broker_profiles_nivel;
CREATE INDEX idx_broker_profiles_nivel ON broker_profiles(nivel);

DROP INDEX IF EXISTS idx_broker_profiles_ghl_user;
CREATE INDEX idx_broker_profiles_ghl_user ON broker_profiles(ghl_user_id);

-- =====================================================
-- 2. TABLA DE ACTIVIDADES
-- =====================================================

CREATE TABLE IF NOT EXISTS actividades (
  actividad_id SERIAL PRIMARY KEY,
  broker_id VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  subtipo VARCHAR(50),
  descripcion TEXT,
  resultado VARCHAR(50),
  puntos INTEGER DEFAULT 0,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ghl_contact_id VARCHAR(100),
  ghl_opportunity_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign key solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'actividades_broker_id_fkey'
  ) THEN
    ALTER TABLE actividades
    ADD CONSTRAINT actividades_broker_id_fkey
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Índices
DROP INDEX IF EXISTS idx_actividades_broker_id;
CREATE INDEX idx_actividades_broker_id ON actividades(broker_id);

DROP INDEX IF EXISTS idx_actividades_fecha;
CREATE INDEX idx_actividades_fecha ON actividades(fecha);

DROP INDEX IF EXISTS idx_actividades_tipo;
CREATE INDEX idx_actividades_tipo ON actividades(tipo);

-- =====================================================
-- 3. TABLA DE LOGROS
-- =====================================================

CREATE TABLE IF NOT EXISTS logros (
  logro_id SERIAL PRIMARY KEY,
  broker_id VARCHAR(100) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  categoria VARCHAR(50),
  puntos_requeridos INTEGER DEFAULT 0,
  fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'logros_broker_id_fkey'
  ) THEN
    ALTER TABLE logros
    ADD CONSTRAINT logros_broker_id_fkey
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Índices
DROP INDEX IF EXISTS idx_logros_broker_id;
CREATE INDEX idx_logros_broker_id ON logros(broker_id);

DROP INDEX IF EXISTS idx_logros_categoria;
CREATE INDEX idx_logros_categoria ON logros(categoria);

-- =====================================================
-- 4. TABLA DE TAREAS
-- =====================================================

CREATE TABLE IF NOT EXISTS tareas (
  tarea_id SERIAL PRIMARY KEY,
  broker_id VARCHAR(100) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  puntos INTEGER DEFAULT 0,
  completada BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completada TIMESTAMP WITH TIME ZONE,
  fecha_limite TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tareas_broker_id_fkey'
  ) THEN
    ALTER TABLE tareas
    ADD CONSTRAINT tareas_broker_id_fkey
    FOREIGN KEY (broker_id) REFERENCES broker_profiles(broker_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Índices
DROP INDEX IF EXISTS idx_tareas_broker_id;
CREATE INDEX idx_tareas_broker_id ON tareas(broker_id);

DROP INDEX IF EXISTS idx_tareas_completada;
CREATE INDEX idx_tareas_completada ON tareas(completada);

DROP INDEX IF EXISTS idx_tareas_fecha_limite;
CREATE INDEX idx_tareas_fecha_limite ON tareas(fecha_limite);

-- =====================================================
-- 5. VISTAS OPTIMIZADAS
-- =====================================================

-- Vista de ranking actual (mes en curso)
CREATE OR REPLACE VIEW vw_ranking_actual AS
SELECT
  bp.broker_id,
  bp.nombre,
  bp.email,
  bp.avatar,
  bp.nivel,
  bp.puntos_mes,
  bp.activo,
  ROW_NUMBER() OVER (ORDER BY bp.puntos_mes DESC) as posicion,
  COUNT(a.actividad_id) FILTER (WHERE DATE_TRUNC('month', a.fecha) = DATE_TRUNC('month', CURRENT_DATE)) as actividades_mes
FROM broker_profiles bp
LEFT JOIN actividades a ON bp.broker_id = a.broker_id
WHERE bp.activo = true
GROUP BY bp.broker_id, bp.nombre, bp.email, bp.avatar, bp.nivel, bp.puntos_mes, bp.activo
ORDER BY bp.puntos_mes DESC;

-- Vista de métricas por broker
CREATE OR REPLACE VIEW vw_metricas_broker AS
SELECT
  bp.broker_id,
  bp.nombre,
  bp.nivel,
  bp.puntos_mes,
  COUNT(DISTINCT a.actividad_id) FILTER (
    WHERE a.tipo = 'llamada'
    AND DATE_TRUNC('day', a.fecha) = CURRENT_DATE
  ) as llamadas_hoy,
  COUNT(DISTINCT a.actividad_id) FILTER (
    WHERE a.tipo = 'presentacion'
    AND DATE_TRUNC('week', a.fecha) = DATE_TRUNC('week', CURRENT_DATE)
  ) as presentaciones_semana,
  COUNT(DISTINCT a.actividad_id) FILTER (
    WHERE a.tipo = 'resultado'
    AND a.subtipo = 'venta'
    AND DATE_TRUNC('month', a.fecha) = DATE_TRUNC('month', CURRENT_DATE)
  ) as ventas_mes,
  COUNT(DISTINCT l.logro_id) as total_logros
FROM broker_profiles bp
LEFT JOIN actividades a ON bp.broker_id = a.broker_id
LEFT JOIN logros l ON bp.broker_id = l.broker_id
WHERE bp.activo = true
GROUP BY bp.broker_id, bp.nombre, bp.nivel, bp.puntos_mes;

-- =====================================================
-- 6. FUNCIONES DE CÁLCULO DE PUNTOS
-- =====================================================

-- Función para calcular puntos según tipo de actividad
CREATE OR REPLACE FUNCTION calcular_puntos(
  p_tipo VARCHAR,
  p_subtipo VARCHAR,
  p_resultado VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  puntos INTEGER := 0;
BEGIN
  -- Llamadas (1-5 puntos)
  IF p_tipo = 'llamada' THEN
    puntos := CASE p_subtipo
      WHEN 'base' THEN 1
      WHEN 'contacto' THEN 2
      WHEN 'interesado' THEN 3
      WHEN 'presentacion_agendada' THEN 4
      WHEN 'seguimiento' THEN 5
      ELSE 1
    END;

  -- Presentaciones (1-5 puntos)
  ELSIF p_tipo = 'presentacion' THEN
    puntos := CASE p_subtipo
      WHEN 'agendada' THEN 1
      WHEN 'realizada' THEN 3
      WHEN 'cerrada' THEN 5
      WHEN 'no_asistio' THEN 1
      WHEN 'reprogramada' THEN 2
      ELSE 1
    END;

  -- Resultados (5-10 puntos)
  ELSIF p_tipo = 'resultado' THEN
    puntos := CASE p_subtipo
      WHEN 'apartado' THEN 5
      WHEN 'contrato' THEN 7
      WHEN 'venta' THEN 10
      WHEN 'referido' THEN 5
      WHEN 'testimonial' THEN 3
      ELSE 5
    END;
  END IF;

  RETURN puntos;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para calcular nivel según puntos
CREATE OR REPLACE FUNCTION calcular_nivel(puntos INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE
    WHEN puntos >= 10000 THEN 'Legend'
    WHEN puntos >= 6000 THEN 'Elite'
    WHEN puntos >= 3000 THEN 'Senior'
    WHEN puntos >= 1000 THEN 'Junior'
    ELSE 'Rookie'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger para actualizar puntos automáticamente
CREATE OR REPLACE FUNCTION actualizar_puntos_broker()
RETURNS TRIGGER AS $$
BEGIN
  -- Si es un INSERT o UPDATE, calcular puntos
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Calcular puntos si no están definidos
    IF NEW.puntos IS NULL OR NEW.puntos = 0 THEN
      NEW.puntos := calcular_puntos(NEW.tipo, NEW.subtipo, NEW.resultado);
    END IF;

    -- Actualizar puntos del broker
    UPDATE broker_profiles
    SET
      puntos_mes = puntos_mes + NEW.puntos,
      puntos_total = puntos_total + NEW.puntos,
      nivel = calcular_nivel(puntos_mes + NEW.puntos),
      updated_at = NOW()
    WHERE broker_id = NEW.broker_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS trigger_actualizar_puntos ON actividades;
CREATE TRIGGER trigger_actualizar_puntos
  BEFORE INSERT OR UPDATE ON actividades
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_puntos_broker();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_broker_updated_at ON broker_profiles;
CREATE TRIGGER trigger_broker_updated_at
  BEFORE UPDATE ON broker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- =====================================================
-- 8. COMENTARIOS
-- =====================================================

COMMENT ON TABLE broker_profiles IS 'Perfiles de brokers con información de gamificación';
COMMENT ON TABLE actividades IS 'Registro de todas las actividades de los brokers';
COMMENT ON TABLE logros IS 'Logros desbloqueados por los brokers';
COMMENT ON TABLE tareas IS 'Tareas asignadas a brokers';

COMMENT ON FUNCTION calcular_puntos IS 'Calcula puntos según tipo y subtipo de actividad';
COMMENT ON FUNCTION calcular_nivel IS 'Determina el nivel del broker según sus puntos';

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

SELECT
  'Gamification schema executed successfully!' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'broker_profiles') as broker_profiles_exists,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'actividades') as actividades_exists,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'logros') as logros_exists,
  (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'tareas') as tareas_exists,
  (SELECT COUNT(*) FROM pg_views WHERE viewname = 'vw_ranking_actual') as ranking_view_exists,
  (SELECT COUNT(*) FROM pg_views WHERE viewname = 'vw_metricas_broker') as metricas_view_exists;
