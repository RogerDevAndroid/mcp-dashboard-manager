-- 👥 Script para Crear Usuarios de Prueba
-- Ejecutar este script después de las migraciones

-- IMPORTANTE: Este script debe ejecutarse desde el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query > Pega este código > Run

BEGIN;

-- ============================================
-- PASO 1: Crear Perfiles de Brokers de Prueba
-- ============================================

-- Insertar broker de prueba
INSERT INTO broker_profiles (
    broker_id,
    nombre,
    email,
    telefono,
    fecha_ingreso,
    nivel,
    puntos_mes,
    activo,
    role,
    avatar
) VALUES
(
    'broker_001',
    'Ana García',
    'broker1@selvadentro.com',
    '+52 984 123 4567',
    CURRENT_DATE - INTERVAL '6 months',
    'Senior',
    4500,
    true,
    'broker',
    'https://ui-avatars.com/api/?name=Ana+Garcia&background=8B5CF6&color=fff'
),
(
    'broker_002',
    'Carlos Rodríguez',
    'broker2@selvadentro.com',
    '+52 984 234 5678',
    CURRENT_DATE - INTERVAL '3 months',
    'Junior',
    2100,
    true,
    'broker',
    'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3B82F6&color=fff'
),
(
    'broker_003',
    'María López',
    'broker3@selvadentro.com',
    '+52 984 345 6789',
    CURRENT_DATE - INTERVAL '1 year',
    'Elite',
    7800,
    true,
    'broker',
    'https://ui-avatars.com/api/?name=Maria+Lopez&background=F97316&color=fff'
),
(
    'broker_004',
    'Juan Martínez',
    'broker4@selvadentro.com',
    '+52 984 456 7890',
    CURRENT_DATE - INTERVAL '2 months',
    'Rookie',
    650,
    true,
    'broker',
    'https://ui-avatars.com/api/?name=Juan+Martinez&background=10B981&color=fff'
),
(
    'broker_005',
    'Laura Sánchez',
    'broker5@selvadentro.com',
    '+52 984 567 8901',
    CURRENT_DATE - INTERVAL '1.5 years',
    'Legend',
    12500,
    true,
    'broker',
    'https://ui-avatars.com/api/?name=Laura+Sanchez&background=EAB308&color=fff'
)
ON CONFLICT (broker_id) DO NOTHING;

-- ============================================
-- PASO 2: Crear Actividades de Ejemplo
-- ============================================

-- Actividades para Ana García (broker_001)
INSERT INTO actividades (broker_id, tipo, subtipo, resultado, fecha, puntos) VALUES
('broker_001', 'llamada', 'contacto', 'exitoso', CURRENT_DATE, 2),
('broker_001', 'llamada', 'interesado', 'exitoso', CURRENT_DATE, 3),
('broker_001', 'presentacion', 'realizada', 'exitoso', CURRENT_DATE - 1, 3),
('broker_001', 'resultado', 'apartado', 'exitoso', CURRENT_DATE - 2, 5),
('broker_001', 'llamada', 'presentacion_agendada', 'exitoso', CURRENT_DATE - 3, 4);

-- Actividades para Carlos Rodríguez (broker_002)
INSERT INTO actividades (broker_id, tipo, subtipo, resultado, fecha, puntos) VALUES
('broker_002', 'llamada', 'base', 'exitoso', CURRENT_DATE, 1),
('broker_002', 'llamada', 'contacto', 'exitoso', CURRENT_DATE, 2),
('broker_002', 'presentacion', 'agendada', 'exitoso', CURRENT_DATE - 1, 1);

-- Actividades para María López (broker_003)
INSERT INTO actividades (broker_id, tipo, subtipo, resultado, fecha, puntos) VALUES
('broker_003', 'llamada', 'interesado', 'exitoso', CURRENT_DATE, 3),
('broker_003', 'presentacion', 'realizada', 'exitoso', CURRENT_DATE, 3),
('broker_003', 'resultado', 'venta', 'exitoso', CURRENT_DATE - 1, 10),
('broker_003', 'resultado', 'contrato', 'exitoso', CURRENT_DATE - 5, 7),
('broker_003', 'resultado', 'referido', 'exitoso', CURRENT_DATE - 7, 5);

-- ============================================
-- PASO 3: Crear Logros Desbloqueados
-- ============================================

INSERT INTO logros (broker_id, nombre, descripcion, icono, fecha_obtencion, puntos_requeridos) VALUES
('broker_003', 'First Blood', 'Primera venta cerrada', '🎯', CURRENT_DATE - 30, 0),
('broker_003', 'The Closer', '10 ventas cerradas', '💰', CURRENT_DATE - 15, 0),
('broker_005', 'First Blood', 'Primera venta cerrada', '🎯', CURRENT_DATE - 180, 0),
('broker_005', 'Call Machine', '100 llamadas en un mes', '📞', CURRENT_DATE - 150, 0),
('broker_005', 'Presenter Pro', '50 presentaciones', '🎤', CURRENT_DATE - 120, 0),
('broker_005', 'The Closer', '10 ventas cerradas', '💰', CURRENT_DATE - 100, 0),
('broker_005', 'Top Performer', 'Entró al Top 3', '🏆', CURRENT_DATE - 60, 0),
('broker_005', 'Rising Star', 'Subió de nivel', '🚀', CURRENT_DATE - 45, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- PASO 4: Crear Tareas de Ejemplo
-- ============================================

INSERT INTO tareas (broker_id, titulo, descripcion, prioridad, puntos, completada, fecha_limite) VALUES
('broker_001', 'Llamar a cliente VIP', 'Seguimiento de cliente interesado en Penthouse', 'alta', 5, false, CURRENT_DATE),
('broker_001', 'Preparar presentación', 'Documentos para presentación del viernes', 'media', 3, false, CURRENT_DATE + 2),
('broker_001', 'Actualizar CRM', 'Actualizar contactos de la semana', 'baja', 2, false, CURRENT_DATE + 3),
('broker_002', 'Confirmar cita', 'Confirmar cita con pareja López', 'alta', 4, false, CURRENT_DATE),
('broker_002', 'Enviar brochure', 'Enviar material digital a 3 prospectos', 'media', 3, false, CURRENT_DATE + 1),
('broker_003', 'Cerrar contrato', 'Firma de contrato familia Martínez', 'alta', 10, false, CURRENT_DATE),
('broker_004', 'Primera llamada', 'Hacer primera llamada a leads nuevos', 'alta', 5, false, CURRENT_DATE),
('broker_005', 'Revisión semanal', 'Reunión de revisión con equipo', 'media', 3, false, CURRENT_DATE + 1)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todos los brokers creados
SELECT
    broker_id,
    nombre,
    email,
    nivel,
    puntos_mes,
    role
FROM broker_profiles
ORDER BY puntos_mes DESC;

-- Ver actividades creadas
SELECT
    a.actividad_id,
    b.nombre,
    a.tipo,
    a.subtipo,
    a.puntos,
    a.fecha
FROM actividades a
JOIN broker_profiles b ON a.broker_id = b.broker_id
ORDER BY a.fecha DESC
LIMIT 10;

-- Ver logros desbloqueados
SELECT
    l.nombre AS logro,
    b.nombre AS broker,
    l.fecha_obtencion
FROM logros l
JOIN broker_profiles b ON l.broker_id = b.broker_id
ORDER BY l.fecha_obtencion DESC;

-- ============================================
-- IMPORTANTE: CREAR USUARIOS DE AUTH
-- ============================================

-- NOTA: Los usuarios de Supabase Auth deben crearse desde el dashboard
-- porque requieren hashing de contraseñas con bcrypt

-- MÉTODO 1: Crear usuarios desde Supabase Dashboard (RECOMENDADO)
-- 1. Ve a: Authentication > Users
-- 2. Click en "Add user"
-- 3. Crea cada usuario:

-- Admin:
--   Email: admin@selvadentro.com
--   Password: Admin123!

-- Director:
--   Email: director@selvadentro.com
--   Password: Director123!

-- Manager:
--   Email: manager@selvadentro.com
--   Password: Manager123!

-- Brokers (usa los emails de arriba):
--   Email: broker1@selvadentro.com
--   Password: Broker123!
--   ... y así para cada broker

-- MÉTODO 2: Usando la API de Supabase (requiere Service Key)
-- Después de crear los usuarios en Auth, vincularlos con los brokers:

-- UPDATE broker_profiles
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'broker1@selvadentro.com')
-- WHERE email = 'broker1@selvadentro.com';

-- UPDATE broker_profiles
-- SET user_id = (SELECT id FROM auth.users WHERE email = 'broker2@selvadentro.com')
-- WHERE email = 'broker2@selvadentro.com';

-- (Repetir para cada broker)

-- ============================================
-- PERFILES ESPECIALES (Director, Manager, Admin)
-- ============================================

-- Estos perfiles no necesitan estar en broker_profiles
-- Solo necesitan existir en auth.users con su rol correcto
-- El rol se puede asignar en user_metadata al crear el usuario:

-- user_metadata: { "role": "admin", "nombre": "Admin User" }
-- user_metadata: { "role": "director", "nombre": "Director User" }
-- user_metadata: { "role": "manager", "nombre": "Manager User" }

-- O usando SQL después de crear los usuarios:
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "nombre": "Admin User"}'::jsonb
-- WHERE email = 'admin@selvadentro.com';
