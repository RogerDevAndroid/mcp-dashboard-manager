-- ============================================
-- SCHEMA: Sistema de Gamificación para Brokers
-- Proyecto: Selvadentro Tulum
-- Fecha: 2025-10-30
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto

-- ============================================
-- TABLA: broker_profiles
-- Perfiles extendidos de brokers con gamificación
-- ============================================

CREATE TABLE IF NOT EXISTS broker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ghl_user_id VARCHAR(255) UNIQUE NOT NULL, -- ID de GoHighLevel

  -- Información personal
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  avatar_url TEXT,

  -- Gamificación
  puntos_mes INTEGER DEFAULT 0,
  puntos_total INTEGER DEFAULT 0,
  nivel VARCHAR(50) DEFAULT 'Rookie',
  badges JSONB DEFAULT '[]'::JSONB,

  -- Metas
  meta_puntos_mes INTEGER DEFAULT 270,
  meta_ventas_mes INTEGER DEFAULT 6,
  meta_apartados_mes INTEGER DEFAULT 10,

  -- Stats
  ventas_mes INTEGER DEFAULT 0,
  ventas_total INTEGER DEFAULT 0,
  apartados_mes INTEGER DEFAULT 0,
  apartados_total INTEGER DEFAULT 0,

  -- Estado
  activo BOOLEAN DEFAULT true,
  ultima_actividad TIMESTAMP DEFAULT NOW(),
  racha_dias INTEGER DEFAULT 0, -- Días consecutivos con actividad

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_ghl_user UNIQUE(ghl_user_id),
  CONSTRAINT positive_points CHECK (puntos_mes >= 0 AND puntos_total >= 0)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_broker_profiles_ghl_user ON broker_profiles(ghl_user_id);
CREATE INDEX idx_broker_profiles_nivel ON broker_profiles(nivel);
CREATE INDEX idx_broker_profiles_puntos_mes ON broker_profiles(puntos_mes DESC);
CREATE INDEX idx_broker_profiles_activo ON broker_profiles(activo);

-- ============================================
-- TABLA: actividades
-- Registro de todas las actividades que generan puntos
-- ============================================

CREATE TABLE IF NOT EXISTS actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Tipo de actividad
  tipo VARCHAR(50) NOT NULL, -- 'llamada', 'presentacion', 'reunion', 'venta', 'apartado'
  subtipo VARCHAR(50), -- 'zoom_broker', 'fisica_cliente', etc.

  -- Detalles
  descripcion TEXT NOT NULL,
  cliente_ghl_id VARCHAR(255), -- ID del contacto en GHL
  cliente_nombre VARCHAR(255),
  oportunidad_ghl_id VARCHAR(255), -- ID de oportunidad en GHL

  -- Puntos
  puntos_ganados INTEGER NOT NULL,
  multiplicador DECIMAL(3,2) DEFAULT 1.00, -- Para bonos especiales

  -- Estado
  completada BOOLEAN DEFAULT true,
  verificada BOOLEAN DEFAULT false, -- Si requiere verificación manual

  -- Metadata
  fecha_actividad TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Constraints
  CONSTRAINT valid_tipo CHECK (tipo IN (
    'llamada', 'presentacion', 'reunion', 'venta',
    'apartado', 'cotizacion', 'seguimiento', 'visita'
  )),
  CONSTRAINT positive_points CHECK (puntos_ganados >= 0)
);

-- Índices
CREATE INDEX idx_actividades_broker ON actividades(broker_id);
CREATE INDEX idx_actividades_tipo ON actividades(tipo);
CREATE INDEX idx_actividades_fecha ON actividades(fecha_actividad DESC);
CREATE INDEX idx_actividades_cliente ON actividades(cliente_ghl_id);
CREATE INDEX idx_actividades_oportunidad ON actividades(oportunidad_ghl_id);

-- ============================================
-- TABLA: tareas_broker
-- Tareas diarias y seguimientos
-- ============================================

CREATE TABLE IF NOT EXISTS tareas_broker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Detalles de la tarea
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'llamada', 'presentacion', 'reunion', etc.

  -- Prioridad
  prioridad VARCHAR(20) DEFAULT 'media', -- 'alta', 'media', 'baja'

  -- Cliente relacionado (opcional)
  cliente_ghl_id VARCHAR(255),
  cliente_nombre VARCHAR(255),

  -- Puntos que se ganan al completar
  puntos_reward INTEGER DEFAULT 0,

  -- Fechas
  fecha_programada TIMESTAMP,
  fecha_limite TIMESTAMP,
  hora VARCHAR(10), -- "10:00 AM"

  -- Estado
  completada BOOLEAN DEFAULT false,
  fecha_completada TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  notas TEXT,

  -- Constraints
  CONSTRAINT valid_prioridad CHECK (prioridad IN ('alta', 'media', 'baja'))
);

-- Índices
CREATE INDEX idx_tareas_broker ON tareas_broker(broker_id);
CREATE INDEX idx_tareas_fecha_programada ON tareas_broker(fecha_programada);
CREATE INDEX idx_tareas_completada ON tareas_broker(completada);
CREATE INDEX idx_tareas_prioridad ON tareas_broker(prioridad);

-- ============================================
-- TABLA: leads_asignados
-- Tracking de leads asignados a cada broker
-- ============================================

CREATE TABLE IF NOT EXISTS leads_asignados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Información del lead de GHL
  ghl_contact_id VARCHAR(255) NOT NULL,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),

  -- Scoring
  lead_score INTEGER DEFAULT 0, -- 1-10
  temperatura VARCHAR(20) DEFAULT 'frio', -- 'caliente', 'tibio', 'frio'

  -- Estado
  estado VARCHAR(50) DEFAULT 'nuevo', -- 'nuevo', 'contactado', 'calificado', 'oportunidad', 'perdido'
  etapa_pipeline VARCHAR(100),

  -- Actividad
  ultima_interaccion TIMESTAMP,
  proxima_accion VARCHAR(255),
  proxima_accion_fecha TIMESTAMP,

  -- Stats
  num_llamadas INTEGER DEFAULT 0,
  num_emails INTEGER DEFAULT 0,
  num_presentaciones INTEGER DEFAULT 0,

  -- Metadata
  fecha_asignacion TIMESTAMP DEFAULT NOW(),
  fecha_conversion TIMESTAMP, -- Cuando se convierte en oportunidad
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_lead_broker UNIQUE(ghl_contact_id, broker_id)
);

-- Índices
CREATE INDEX idx_leads_broker ON leads_asignados(broker_id);
CREATE INDEX idx_leads_ghl_contact ON leads_asignados(ghl_contact_id);
CREATE INDEX idx_leads_estado ON leads_asignados(estado);
CREATE INDEX idx_leads_temperatura ON leads_asignados(temperatura);
CREATE INDEX idx_leads_score ON leads_asignados(lead_score DESC);

-- ============================================
-- TABLA: oportunidades_broker
-- Oportunidades en pipeline
-- ============================================

CREATE TABLE IF NOT EXISTS oportunidades_broker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Información de GHL
  ghl_opportunity_id VARCHAR(255) UNIQUE NOT NULL,
  ghl_contact_id VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,

  -- Detalles
  valor_monetario DECIMAL(12,2) DEFAULT 0,
  probabilidad INTEGER DEFAULT 50, -- 0-100%

  -- Pipeline
  etapa VARCHAR(100) NOT NULL,
  estado VARCHAR(50) DEFAULT 'open', -- 'open', 'won', 'lost', 'abandoned'

  -- Fechas
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_cierre_estimada TIMESTAMP,
  fecha_cierre_real TIMESTAMP,
  dias_en_pipeline INTEGER DEFAULT 0,

  -- Tracking
  num_seguimientos INTEGER DEFAULT 0,
  ultima_actividad TIMESTAMP,
  proxima_accion VARCHAR(255),

  -- Metadata
  razon_perdida TEXT, -- Si estado = 'lost'
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_probabilidad CHECK (probabilidad >= 0 AND probabilidad <= 100),
  CONSTRAINT valid_estado CHECK (estado IN ('open', 'won', 'lost', 'abandoned'))
);

-- Índices
CREATE INDEX idx_oportunidades_broker ON oportunidades_broker(broker_id);
CREATE INDEX idx_oportunidades_ghl ON oportunidades_broker(ghl_opportunity_id);
CREATE INDEX idx_oportunidades_estado ON oportunidades_broker(estado);
CREATE INDEX idx_oportunidades_etapa ON oportunidades_broker(etapa);
CREATE INDEX idx_oportunidades_valor ON oportunidades_broker(valor_monetario DESC);

-- ============================================
-- TABLA: reuniones_calendario
-- Reuniones y citas agendadas
-- ============================================

CREATE TABLE IF NOT EXISTS reuniones_calendario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Detalles
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'presentacion', 'visita', 'cierre', 'seguimiento'

  -- Cliente/Lead
  cliente_ghl_id VARCHAR(255),
  cliente_nombre VARCHAR(255),

  -- Oportunidad relacionada
  oportunidad_id UUID REFERENCES oportunidades_broker(id) ON DELETE SET NULL,

  -- Fecha y hora
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  duracion_minutos INTEGER,

  -- Ubicación
  ubicacion VARCHAR(255),
  tipo_reunion VARCHAR(50) DEFAULT 'virtual', -- 'virtual', 'fisica', 'telefonica'
  url_reunion TEXT, -- Zoom, Google Meet, etc.

  -- Estado
  estado VARCHAR(50) DEFAULT 'programada', -- 'programada', 'completada', 'cancelada', 'no_show'
  asistio_cliente BOOLEAN,

  -- Resultado
  resultado TEXT,
  puntos_ganados INTEGER DEFAULT 0,

  -- Recordatorios
  recordatorio_enviado BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_fechas CHECK (fecha_fin > fecha_inicio),
  CONSTRAINT valid_tipo_reunion CHECK (tipo_reunion IN ('virtual', 'fisica', 'telefonica')),
  CONSTRAINT valid_estado_reunion CHECK (estado IN ('programada', 'completada', 'cancelada', 'no_show'))
);

-- Índices
CREATE INDEX idx_reuniones_broker ON reuniones_calendario(broker_id);
CREATE INDEX idx_reuniones_fecha ON reuniones_calendario(fecha_inicio);
CREATE INDEX idx_reuniones_estado ON reuniones_calendario(estado);
CREATE INDEX idx_reuniones_oportunidad ON reuniones_calendario(oportunidad_id);

-- ============================================
-- TABLA: logros_achievements
-- Catálogo de logros disponibles
-- ============================================

CREATE TABLE IF NOT EXISTS logros_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificador único
  codigo VARCHAR(50) UNIQUE NOT NULL,

  -- Detalles
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  icono VARCHAR(10) NOT NULL, -- Emoji

  -- Puntos que otorga
  puntos_bonus INTEGER DEFAULT 0,

  -- Categoría
  categoria VARCHAR(50), -- 'velocidad', 'volumen', 'conversion', 'consistencia'

  -- Criterio de obtención (en JSON)
  criterio JSONB NOT NULL,

  -- Dificultad
  rareza VARCHAR(20) DEFAULT 'comun', -- 'comun', 'raro', 'epico', 'legendario'

  -- Estado
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_logros_codigo ON logros_achievements(codigo);
CREATE INDEX idx_logros_categoria ON logros_achievements(categoria);
CREATE INDEX idx_logros_rareza ON logros_achievements(rareza);

-- ============================================
-- TABLA: broker_achievements
-- Logros obtenidos por cada broker
-- ============================================

CREATE TABLE IF NOT EXISTS broker_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES logros_achievements(id) ON DELETE CASCADE,

  -- Fecha de obtención
  fecha_obtenido TIMESTAMP DEFAULT NOW(),

  -- Progreso (para logros graduales)
  progreso INTEGER DEFAULT 100, -- 0-100%

  -- Metadata
  compartido BOOLEAN DEFAULT false, -- Si el broker lo compartió
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_broker_achievement UNIQUE(broker_id, achievement_id)
);

-- Índices
CREATE INDEX idx_broker_achievements_broker ON broker_achievements(broker_id);
CREATE INDEX idx_broker_achievements_fecha ON broker_achievements(fecha_obtenido DESC);

-- ============================================
-- TABLA: ranking_historico
-- Snapshot diario del ranking para gráficas de tendencia
-- ============================================

CREATE TABLE IF NOT EXISTS ranking_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Fecha del snapshot
  fecha DATE NOT NULL,

  -- Posición y puntos
  posicion INTEGER NOT NULL,
  puntos INTEGER NOT NULL,

  -- Métricas del día
  actividades_dia INTEGER DEFAULT 0,
  ventas_dia INTEGER DEFAULT 0,
  apartados_dia INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_broker_fecha UNIQUE(broker_id, fecha)
);

-- Índices
CREATE INDEX idx_ranking_broker ON ranking_historico(broker_id);
CREATE INDEX idx_ranking_fecha ON ranking_historico(fecha DESC);
CREATE INDEX idx_ranking_posicion ON ranking_historico(posicion);

-- ============================================
-- TABLA: notificaciones_broker
-- Sistema de notificaciones push
-- ============================================

CREATE TABLE IF NOT EXISTS notificaciones_broker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,

  -- Contenido
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'lead', 'tarea', 'logro', 'ranking', 'sistema'
  icono VARCHAR(10),

  -- Prioridad
  prioridad VARCHAR(20) DEFAULT 'normal', -- 'alta', 'normal', 'baja'

  -- Acción asociada
  action_url TEXT,
  action_label VARCHAR(100),

  -- Estado
  leida BOOLEAN DEFAULT false,
  fecha_leida TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Constraints
  CONSTRAINT valid_tipo_notif CHECK (tipo IN ('lead', 'tarea', 'logro', 'ranking', 'sistema', 'reunion'))
);

-- Índices
CREATE INDEX idx_notificaciones_broker ON notificaciones_broker(broker_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones_broker(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones_broker(created_at DESC);

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función: Calcular nivel basado en puntos
CREATE OR REPLACE FUNCTION calcular_nivel(puntos INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  IF puntos >= 1001 THEN RETURN 'Legend';
  ELSIF puntos >= 601 THEN RETURN 'Elite';
  ELSIF puntos >= 301 THEN RETURN 'Senior';
  ELSIF puntos >= 101 THEN RETURN 'Junior';
  ELSE RETURN 'Rookie';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Actualizar puntos del broker
CREATE OR REPLACE FUNCTION actualizar_puntos_broker()
RETURNS TRIGGER AS $$
BEGIN
  -- Sumar puntos de la nueva actividad al broker
  UPDATE broker_profiles
  SET
    puntos_mes = puntos_mes + NEW.puntos_ganados,
    puntos_total = puntos_total + NEW.puntos_ganados,
    nivel = calcular_nivel(puntos_mes + NEW.puntos_ganados),
    ultima_actividad = NOW(),
    updated_at = NOW()
  WHERE id = NEW.broker_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar puntos al crear actividad
CREATE TRIGGER trigger_actualizar_puntos
AFTER INSERT ON actividades
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntos_broker();

-- Función: Reset mensual de puntos
CREATE OR REPLACE FUNCTION reset_puntos_mensuales()
RETURNS void AS $$
BEGIN
  -- Guardar snapshot en histórico antes de resetear
  INSERT INTO ranking_historico (broker_id, fecha, posicion, puntos)
  SELECT
    id,
    CURRENT_DATE,
    ROW_NUMBER() OVER (ORDER BY puntos_mes DESC),
    puntos_mes
  FROM broker_profiles
  WHERE activo = true;

  -- Resetear puntos mensuales
  UPDATE broker_profiles
  SET
    puntos_mes = 0,
    ventas_mes = 0,
    apartados_mes = 0,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Ranking actual
CREATE OR REPLACE VIEW vw_ranking_actual AS
SELECT
  bp.id,
  bp.ghl_user_id,
  bp.nombre,
  bp.email,
  bp.avatar_url,
  bp.puntos_mes,
  bp.nivel,
  bp.ventas_mes,
  bp.apartados_mes,
  ROW_NUMBER() OVER (ORDER BY bp.puntos_mes DESC) as posicion,
  COUNT(a.id) FILTER (WHERE a.fecha_actividad >= CURRENT_DATE - INTERVAL '7 days') as actividades_semana,
  COUNT(o.id) FILTER (WHERE o.estado = 'open') as oportunidades_activas,
  COUNT(r.id) FILTER (WHERE r.fecha_inicio >= CURRENT_DATE AND r.estado = 'programada') as reuniones_programadas
FROM broker_profiles bp
LEFT JOIN actividades a ON a.broker_id = bp.id
LEFT JOIN oportunidades_broker o ON o.broker_id = bp.id
LEFT JOIN reuniones_calendario r ON r.broker_id = bp.id
WHERE bp.activo = true
GROUP BY bp.id
ORDER BY bp.puntos_mes DESC;

-- Vista: Dashboard del broker
CREATE OR REPLACE VIEW vw_broker_dashboard AS
SELECT
  bp.id,
  bp.nombre,
  bp.avatar_url,
  bp.puntos_mes,
  bp.nivel,
  bp.meta_puntos_mes,
  bp.ventas_mes,
  bp.meta_ventas_mes,
  bp.apartados_mes,
  bp.meta_apartados_mes,

  -- Actividades hoy
  COUNT(DISTINCT a.id) FILTER (WHERE DATE(a.fecha_actividad) = CURRENT_DATE) as actividades_hoy,
  COUNT(DISTINCT a.id) FILTER (WHERE a.fecha_actividad >= CURRENT_DATE - INTERVAL '7 days') as actividades_semana,

  -- Leads
  COUNT(DISTINCT l.id) FILTER (WHERE l.estado IN ('nuevo', 'contactado', 'calificado')) as leads_activos,
  COUNT(DISTINCT l.id) FILTER (WHERE l.temperatura = 'caliente') as leads_calientes,

  -- Oportunidades
  COUNT(DISTINCT o.id) FILTER (WHERE o.estado = 'open') as oportunidades_abiertas,
  SUM(o.valor_monetario) FILTER (WHERE o.estado = 'open') as valor_pipeline,

  -- Reuniones
  COUNT(DISTINCT r.id) FILTER (WHERE r.fecha_inicio >= CURRENT_DATE AND r.estado = 'programada') as reuniones_proximas,

  -- Tareas
  COUNT(DISTINCT t.id) FILTER (WHERE t.completada = false) as tareas_pendientes,

  -- Notificaciones
  COUNT(DISTINCT n.id) FILTER (WHERE n.leida = false) as notificaciones_pendientes

FROM broker_profiles bp
LEFT JOIN actividades a ON a.broker_id = bp.id
LEFT JOIN leads_asignados l ON l.broker_id = bp.id
LEFT JOIN oportunidades_broker o ON o.broker_id = bp.id
LEFT JOIN reuniones_calendario r ON r.broker_id = bp.id
LEFT JOIN tareas_broker t ON t.broker_id = bp.id
LEFT JOIN notificaciones_broker n ON n.broker_id = bp.id
WHERE bp.activo = true
GROUP BY bp.id;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar logros predefinidos
INSERT INTO logros_achievements (codigo, nombre, descripcion, icono, puntos_bonus, categoria, rareza, criterio) VALUES
('flash_responder', 'Flash Responder', 'Responder a 10 leads en menos de 5 minutos', '⚡', 20, 'velocidad', 'raro', '{"leadsRespondidosRapido": 10}'::JSONB),
('early_bird', 'Early Bird', 'Primera llamada antes de 8:30 AM', '🌅', 5, 'consistencia', 'comun', '{"primeraLlamadaAntes": "08:30"}'::JSONB),
('call_machine', 'Call Machine', '50 llamadas en un día', '📞', 30, 'volumen', 'epico', '{"llamadasDia": 50}'::JSONB),
('meeting_master', 'Meeting Master', '5 presentaciones en un día', '🎯', 25, 'volumen', 'raro', '{"presentacionesDia": 5}'::JSONB),
('closer', 'The Closer', '3 ventas en una semana', '💰', 100, 'conversion', 'legendario', '{"ventasSemana": 3}'::JSONB),
('perfect_week', 'Perfect Week', '100% de metas semanales cumplidas', '✨', 50, 'consistencia', 'epico', '{"metasSemanales": 100}'::JSONB),
('iron_man', 'Iron Man', '30 días consecutivos con actividad', '🦾', 75, 'consistencia', 'epico', '{"diasConsecutivos": 30}'::JSONB),
('whale_hunter', 'Whale Hunter', 'Cerrar deal mayor a $1M MXN', '🐋', 150, 'conversion', 'legendario', '{"dealMinimo": 1000000}'::JSONB);

-- ============================================
-- PERMISOS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE broker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_broker ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_asignados ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades_broker ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuniones_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_broker ENABLE ROW LEVEL SECURITY;

-- Política: Los brokers solo ven sus propios datos
CREATE POLICY broker_own_data ON broker_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY broker_own_activities ON actividades
  FOR ALL USING (broker_id IN (
    SELECT id FROM broker_profiles WHERE user_id = auth.uid()
  ));

-- Los brokers pueden ver el ranking de todos
CREATE POLICY view_all_ranking ON broker_profiles
  FOR SELECT USING (true);

-- Comentarios
COMMENT ON TABLE broker_profiles IS 'Perfiles de brokers con gamificación';
COMMENT ON TABLE actividades IS 'Registro de actividades que generan puntos';
COMMENT ON TABLE tareas_broker IS 'Tareas diarias y seguimientos';
COMMENT ON TABLE leads_asignados IS 'Leads asignados a cada broker';
COMMENT ON TABLE oportunidades_broker IS 'Oportunidades en pipeline';
COMMENT ON TABLE reuniones_calendario IS 'Reuniones y citas agendadas';
COMMENT ON TABLE logros_achievements IS 'Catálogo de logros disponibles';
COMMENT ON TABLE broker_achievements IS 'Logros obtenidos por brokers';
