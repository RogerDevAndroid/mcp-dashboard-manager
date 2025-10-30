# 🚨 Solución Rápida: "No se pudo obtener el perfil del usuario"

## El Problema

Ya creaste el usuario `rgarciavital@gmail.com` en Supabase Auth, pero falta vincularlo con la tabla `broker_profiles`.

---

## ✅ Solución en 3 Pasos (2 minutos)

### 1️⃣ Ve al SQL Editor de Supabase

👉 https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new

### 2️⃣ Copia y Pega este SQL Completo

```sql
-- Crear perfil automáticamente para rgarciavital@gmail.com
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
```

### 3️⃣ Click en "RUN" (Ctrl+Enter)

Deberías ver un mensaje como:
```
Success. No rows returned
```
o
```
INSERT 0 1
```

---

## ✅ Verificar que Funcionó

Ejecuta esta query para verificar:

```sql
SELECT
  bp.broker_id,
  bp.nombre,
  bp.email,
  bp.role,
  bp.nivel,
  au.email as auth_email
FROM broker_profiles bp
JOIN auth.users au ON bp.user_id = au.id
WHERE bp.email = 'rgarciavital@gmail.com';
```

**Resultado esperado:**

| broker_id | nombre | email | role | nivel | auth_email |
|-----------|--------|-------|------|-------|------------|
| admin_roger_garcia | Roger Garcia Vital | rgarciavital@gmail.com | admin | Legend | rgarciavital@gmail.com |

---

## 🎉 ¡Listo!

Ahora vuelve a la página de login e intenta iniciar sesión con:
- **Email**: `rgarciavital@gmail.com`
- **Password**: `holamundo`

Deberías ser redirigido al **Executive Dashboard** como administrador.

---

## 🔧 Si Todavía No Funciona

### Error: "duplicate key value"
Significa que el perfil ya existe. Actualízalo:

```sql
UPDATE broker_profiles
SET
  user_id = (SELECT id FROM auth.users WHERE email = 'rgarciavital@gmail.com'),
  role = 'admin',
  activo = true,
  nivel = 'Legend',
  updated_at = now()
WHERE email = 'rgarciavital@gmail.com';
```

### Error: "No se pudo autenticar"
Verifica que el usuario esté confirmado:

```sql
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'rgarciavital@gmail.com';
```

Si `email_confirmed_at` es NULL:

```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'rgarciavital@gmail.com';
```

### El usuario no existe en Auth
Créalo primero en: Authentication > Users > Add user

---

## 📊 Diagrama del Flujo

```
1. Usuario intenta login
   ↓
2. Supabase Auth verifica email/password ✅
   ↓
3. App busca perfil en broker_profiles
   ↓
4. Si NO existe → ❌ "No se pudo obtener el perfil del usuario"
   ↓
5. Si existe → ✅ Redirige al dashboard
```

**Lo que hicimos:** Crear el perfil en el paso 3 para que el flujo continúe.

---

## 🎯 Resumen Ultra Rápido

1. Abre: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new
2. Pega el SQL del paso 2 de arriba
3. Click RUN
4. Intenta login nuevamente
5. ✅ Listo!
