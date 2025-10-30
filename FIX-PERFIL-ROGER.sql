-- ============================================
-- SOLUCIÓN RÁPIDA: Vincular usuario existente con perfil
-- ============================================

-- PASO 1: Verificar que el usuario existe en Auth
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'rgarciavital@gmail.com';

-- PASO 2: Crear el perfil en broker_profiles
-- (Esta query usa el user_id automáticamente desde auth.users)
INSERT INTO broker_profiles (
  broker_id,
  user_id,
  nombre,
  email,
  telefono,
  avatar,
  puntos_totales,
  puntos_mes,
  nivel,
  activo,
  role,
  ultimo_login,
  created_at,
  updated_at
)
SELECT
  'admin_roger_garcia' as broker_id,
  id as user_id,
  'Roger Garcia Vital' as nombre,
  email,
  '+52 000 000 0000' as telefono,
  NULL as avatar,
  0 as puntos_totales,
  0 as puntos_mes,
  'Legend' as nivel,
  true as activo,
  'admin' as role,
  now() as ultimo_login,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'rgarciavital@gmail.com'
ON CONFLICT (email)
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role = 'admin',
  activo = true,
  nivel = 'Legend',
  updated_at = now();

-- PASO 3: Verificar que el perfil fue creado correctamente
SELECT
  bp.broker_id,
  bp.user_id,
  bp.nombre,
  bp.email,
  bp.role,
  bp.nivel,
  bp.activo,
  au.email as auth_email,
  au.email_confirmed_at
FROM broker_profiles bp
JOIN auth.users au ON bp.user_id = au.id
WHERE bp.email = 'rgarciavital@gmail.com';

-- ============================================
-- Si ves un resultado como este, ¡funcionó! ✅
-- ============================================
-- broker_id: admin_roger_garcia
-- user_id: (un UUID largo)
-- nombre: Roger Garcia Vital
-- email: rgarciavital@gmail.com
-- role: admin
-- nivel: Legend
-- activo: true
-- auth_email: rgarciavital@gmail.com
-- email_confirmed_at: (una fecha)
