-- ============================================
-- SCRIPT: Crear usuario administrador
-- Email: rgarciavital@gmail.com
-- Password: holamundo
-- ============================================

-- PASO 1: Crear usuario en Supabase Auth (Debes hacerlo desde el Dashboard de Supabase)
-- 1. Ve a: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/auth/users
-- 2. Click en "Add user" > "Create new user"
-- 3. Ingresa:
--    Email: rgarciavital@gmail.com
--    Password: holamundo
--    Auto Confirm User: YES (marcado)
-- 4. Click "Create user"
-- 5. Copia el User ID que se genera

-- PASO 2: Una vez creado el usuario en Auth, ejecuta este SQL para vincular el perfil
-- (Reemplaza 'USER_ID_AQUI' con el ID del usuario que copiaste)

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
  ultimo_login
) VALUES (
  'admin_roger_' || extract(epoch from now())::text, -- ID único basado en timestamp
  'USER_ID_AQUI', -- ⚠️ REEMPLAZA ESTO con el User ID real de Supabase Auth
  'Roger Garcia Vital',
  'rgarciavital@gmail.com',
  '+52 000 000 0000',
  NULL,
  0,
  0,
  'Legend',
  true,
  'admin',
  now()
)
ON CONFLICT (email)
DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role = 'admin',
  activo = true,
  ultimo_login = now();

-- PASO 3: Verificar que el usuario fue creado correctamente
SELECT
  bp.broker_id,
  bp.nombre,
  bp.email,
  bp.role,
  bp.nivel,
  bp.activo,
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at
FROM broker_profiles bp
LEFT JOIN auth.users au ON bp.user_id = au.id
WHERE bp.email = 'rgarciavital@gmail.com';

-- ============================================
-- INSTRUCCIONES PASO A PASO:
-- ============================================

/*
1. Ve al Dashboard de Supabase:
   https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/auth/users

2. Click en "Add user" > "Create new user"

3. Completa el formulario:
   - Email: rgarciavital@gmail.com
   - Password: holamundo
   - Auto Confirm User: ✅ (marcado)

4. Click "Create user"

5. Copia el User ID que aparece (algo como: a1b2c3d4-e5f6-7890-abcd-ef1234567890)

6. Regresa a SQL Editor y ejecuta la query INSERT de arriba,
   reemplazando 'USER_ID_AQUI' con el ID que copiaste

7. Ejecuta la query SELECT al final para verificar

8. ¡Listo! Ya puedes iniciar sesión con:
   Email: rgarciavital@gmail.com
   Password: holamundo
*/
