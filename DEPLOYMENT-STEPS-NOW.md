# 🚀 Pasos de Deployment - AHORA

## ✅ Progreso Actual

### Lo que YA tenemos:
- ✅ Service Role Key configurado
- ✅ Proyecto Supabase: `qokskmnzbugfmthwioukz`
- ✅ Código 100% completo
- ✅ Scripts de migración listos

### Lo que FALTA:
- ⏳ Anon Key del proyecto correcto
- ⏳ Ejecutar migraciones SQL
- ⏳ Crear usuarios
- ⏳ Deployar a Vercel

---

## 📋 Paso 1: Obtener Anon Key (2 min)

**Ve a esta URL**:
https://supabase.com/dashboard/project/qokskmnzbugfmthwioukz/settings/api

**Busca la sección "Project API keys"**

Verás dos keys:
1. **anon** / **public** ← 📋 Copia este
2. **service_role** ← ✅ Ya lo tengo

**Copia el Anon Key** (el primero) y pégalo aquí.

Formato esperado:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva3NrbXpidWdmbXRod2lvdWt6...
```

---

## 📋 Paso 2: Ejecutar Migraciones SQL (10 min)

### Opción A - Manual (Recomendado por ahora):

**Ve al SQL Editor**:
https://supabase.com/dashboard/project/qokskmnzbugfmthwioukz/sql/new

**1. Primera migración - Gamification:**
- Abre: `database/gamification-schema.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor
- Click en **"Run"** (abajo a la derecha)
- Espera el ✓ verde

**2. Segunda migración - Auth:**
- Abre: `database/auth-schema.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor (reemplaza el anterior)
- Click en **"Run"**
- Espera el ✓ verde

### Opción B - Automática (requiere Node.js):

```bash
# Instalar dependencias si no lo has hecho
npm install

# Ejecutar migraciones
node scripts/run-migrations.js
```

---

## 📋 Paso 3: Verificar Tablas (2 min)

Ejecuta en SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
- ✅ actividades
- ✅ broker_profiles
- ✅ logros
- ✅ tareas
- ✅ user_permissions
- ✅ user_sessions
- ✅ saved_filters

---

## 📋 Paso 4: Crear Usuarios (10 min)

**Ve a Authentication**:
https://supabase.com/dashboard/project/qokskmnzbugfmthwioukz/auth/users

**Click en "Add user"** y crea estos 5 usuarios:

### Usuario 1 - Admin
```
Email: admin@selvadentro.com
Password: Admin123!
✓ Auto Confirm User
```

### Usuario 2 - Director
```
Email: director@selvadentro.com
Password: Director123!
✓ Auto Confirm User
```

### Usuario 3 - Manager
```
Email: manager@selvadentro.com
Password: Manager123!
✓ Auto Confirm User
```

### Usuario 4 - Broker 1
```
Email: broker1@selvadentro.com
Password: Broker123!
✓ Auto Confirm User
```

### Usuario 5 - Broker 2
```
Email: broker2@selvadentro.com
Password: Broker123!
✓ Auto Confirm User
```

---

## 📋 Paso 5: Crear Datos de Prueba (5 min)

**Vuelve al SQL Editor**:
https://supabase.com/dashboard/project/qokskmnzbugfmthwioukz/sql/new

**Ejecuta el script**:
- Abre: `scripts/create-test-users.sql`
- Copia TODO el contenido
- Pégalo en el SQL Editor
- Click en **"Run"**

Esto creará:
- 5 perfiles de brokers con diferentes niveles
- Actividades de ejemplo
- Logros desbloqueados
- Tareas pendientes

---

## 📋 Paso 6: Vincular Usuarios (3 min)

**Ejecuta estas queries una por una** en el SQL Editor:

```sql
-- Vincular broker1
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker1@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker1@selvadentro.com';

-- Vincular broker2
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker2@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker2@selvadentro.com';

-- Configurar Admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin', 'nombre', 'Admin User')
WHERE email = 'admin@selvadentro.com';

-- Configurar Director
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'director', 'nombre', 'Director User')
WHERE email = 'director@selvadentro.com';

-- Configurar Manager
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'manager', 'nombre', 'Manager User')
WHERE email = 'manager@selvadentro.com';
```

---

## 📋 Paso 7: Probar Localmente (5 min)

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

**Abre**: http://localhost:3000/login

**Prueba con**:
```
Email: broker1@selvadentro.com
Password: Broker123!
```

Deberías ver el dashboard del broker con:
- ✅ Header con avatar y puntos
- ✅ Barra de progreso de nivel
- ✅ 6 métricas con íconos
- ✅ Proyecciones de crecimiento
- ✅ Tareas diarias
- ✅ Mini leaderboard
- ✅ Logros recientes

---

## 📋 Paso 8: Deploy a Vercel (10 min)

### 8.1 Crear cuenta en Vercel
https://vercel.com/signup

### 8.2 Importar proyecto
1. Click en **"Add New"** → **"Project"**
2. Conecta tu GitHub
3. Busca el repo: `mcp-dashboard-manager`
4. Click en **"Import"**

### 8.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL
https://qokskmnzbugfmthwioukz.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
[el anon key que te pedí arriba]

SUPABASE_SERVICE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva3NrbXpidWdmbXRod2lvdWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc0NDA5OSwiZXhwIjoyMDc3MzIwMDk5fQ.OXWaAvK8acIdOr5x5cy4JkTb2L_Z50iwqsW1fst1wso

GHL_PRIVATE_TOKEN
pit-84d7687f-d43f-4434-9804-c671c669dd0f

GHL_LOCATION_ID
crN2IhAuOBAl7D8324yI
```

**IMPORTANTE**: Marca que se apliquen a:
- ✓ Production
- ✓ Preview
- ✓ Development

### 8.4 Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ✓ URL: `https://tu-proyecto.vercel.app`

---

## ✅ Checklist Final

### Base de Datos
- [ ] Migración gamification-schema.sql ejecutada
- [ ] Migración auth-schema.sql ejecutada
- [ ] Tablas verificadas

### Usuarios
- [ ] 5 usuarios creados en Auth
- [ ] Roles asignados
- [ ] Brokers vinculados

### Testing Local
- [ ] npm run dev funciona
- [ ] Login con broker1 funciona
- [ ] Dashboard carga correctamente

### Vercel
- [ ] Proyecto importado
- [ ] Variables configuradas
- [ ] Deploy exitoso
- [ ] Login en producción funciona

---

## 🎉 ¡Siguiente!

**Una vez que me des el Anon Key**, podré:
1. ✅ Actualizar el .env.local
2. ✅ Ayudarte a ejecutar las migraciones
3. ✅ Verificar que todo funcione
4. ✅ Guiarte en el deploy a Vercel

**Dime**: ¿Ya tienes el Anon Key?

Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
