# Crear Usuario Administrador: Roger Garcia Vital

## Método 1: Usando el Dashboard de Supabase (MÁS FÁCIL) ⭐

### Paso 1: Crear usuario en Auth

1. Ve a tu Dashboard de Supabase:
   👉 https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/auth/users

2. Click en **"Add user"** (botón verde arriba a la derecha)

3. Selecciona **"Create new user"**

4. Completa el formulario:
   - **Email**: `rgarciavital@gmail.com`
   - **Password**: `holamundo`
   - **Auto Confirm User**: ✅ **MARCADO** (importante)

5. Click **"Create user"**

6. **COPIA EL USER ID** que aparece (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Paso 2: Vincular usuario con broker_profiles

1. Ve al SQL Editor:
   👉 https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new

2. Copia y pega este SQL (reemplaza `'USER_ID_AQUI'` con el ID que copiaste):

```sql
-- Insertar perfil de administrador
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
  'admin_roger_garcia',
  'USER_ID_AQUI', -- ⚠️ REEMPLAZA ESTO con tu User ID real
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
```

3. Click **"Run"** (o presiona Ctrl+Enter)

### Paso 3: Verificar que funcionó

Ejecuta este SQL para verificar:

```sql
SELECT
  bp.broker_id,
  bp.nombre,
  bp.email,
  bp.role,
  bp.nivel,
  bp.activo,
  au.id as auth_user_id,
  au.email as auth_email
FROM broker_profiles bp
JOIN auth.users au ON bp.user_id = au.id
WHERE bp.email = 'rgarciavital@gmail.com';
```

Deberías ver algo como:

| broker_id | nombre | email | role | nivel | activo | auth_user_id | auth_email |
|-----------|--------|-------|------|-------|--------|--------------|------------|
| admin_roger_garcia | Roger Garcia Vital | rgarciavital@gmail.com | admin | Legend | true | a1b2c3d4... | rgarciavital@gmail.com |

### ✅ ¡Listo!

Ahora puedes iniciar sesión en:
- **URL Local**: http://localhost:3000/login
- **URL Producción**: https://tu-app.vercel.app/login

**Credenciales:**
- Email: `rgarciavital@gmail.com`
- Password: `holamundo`
- Role: `admin`

---

## Método 2: Usando la API (Requiere servidor corriendo)

Si prefieres usar la API que creé:

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. En otra terminal, ejecuta:
```bash
./scripts/create-admin-via-api.sh
```

O manualmente con curl:
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rgarciavital@gmail.com",
    "password": "holamundo",
    "nombre": "Roger Garcia Vital",
    "role": "admin"
  }'
```

---

## Método 3: Usando el SQL Editor directamente (Un solo paso)

Si ya tienes el User ID o prefieres hacerlo todo en una query:

```sql
-- Primero obtén el user_id del usuario que creaste
SELECT id, email FROM auth.users WHERE email = 'rgarciavital@gmail.com';

-- Luego inserta el perfil (usa el id que obtuviste arriba)
INSERT INTO broker_profiles (
  broker_id, user_id, nombre, email, telefono,
  puntos_totales, puntos_mes, nivel, activo, role, ultimo_login
)
VALUES (
  'admin_roger_garcia',
  (SELECT id FROM auth.users WHERE email = 'rgarciavital@gmail.com'),
  'Roger Garcia Vital',
  'rgarciavital@gmail.com',
  '+52 000 000 0000',
  0, 0, 'Legend', true, 'admin', now()
)
ON CONFLICT (email)
DO UPDATE SET
  user_id = (SELECT id FROM auth.users WHERE email = 'rgarciavital@gmail.com'),
  role = 'admin',
  activo = true;
```

---

## ⚠️ IMPORTANTE - Seguridad

**DESPUÉS DE CREAR TU USUARIO:**

1. **Elimina o protege la API route**:
   ```bash
   rm -rf app/api/admin/create-user
   ```

2. **Cambia tu contraseña** desde el dashboard a una más segura

3. **No compartas** estas credenciales en repositorios públicos

---

## Troubleshooting

### Error: "User already exists"
Si el email ya existe en Auth pero no en broker_profiles:
```sql
SELECT id FROM auth.users WHERE email = 'rgarciavital@gmail.com';
-- Usa ese ID en el INSERT de broker_profiles
```

### Error: "duplicate key value violates unique constraint"
El email ya existe en broker_profiles. Usa esto para actualizar:
```sql
UPDATE broker_profiles
SET
  user_id = (SELECT id FROM auth.users WHERE email = 'rgarciavital@gmail.com'),
  role = 'admin',
  activo = true,
  nivel = 'Legend'
WHERE email = 'rgarciavital@gmail.com';
```

### No puedo iniciar sesión
Verifica que el usuario esté confirmado:
```sql
SELECT id, email, email_confirmed_at FROM auth.users
WHERE email = 'rgarciavital@gmail.com';
```

Si `email_confirmed_at` es NULL:
```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'rgarciavital@gmail.com';
```
