# 🚀 EJECUTAR AHORA - Pasos Finales

## ✅ Configuración Completada

Ya tenemos:
- ✅ `.env.local` actualizado con credenciales correctas
- ✅ Proyecto Supabase: `qokskmzbugfmthwioukz`
- ✅ URL: https://qokskmzbugfmthwioukz.supabase.co
- ✅ Anon Key configurada
- ✅ Service Key configurada

---

## 📋 PASO 1: Ejecutar Migraciones SQL (10 minutos)

### 1.1 Abrir SQL Editor

**Ve a**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new

### 1.2 Ejecutar Primera Migración (Gamification Schema)

1. Abre el archivo local: `database/gamification-schema.sql`
2. Selecciona TODO el contenido (Cmd+A / Ctrl+A)
3. Cópialo (Cmd+C / Ctrl+C)
4. Pégalo en el SQL Editor de Supabase
5. Click en el botón **"RUN"** (esquina inferior derecha)
6. **Espera** a que termine (puede tardar 30-60 segundos)
7. Deberías ver un mensaje de éxito ✓

### 1.3 Ejecutar Segunda Migración (Auth Schema)

1. Abre el archivo local: `database/auth-schema.sql`
2. Selecciona TODO el contenido (Cmd+A / Ctrl+A)
3. Cópialo (Cmd+C / Ctrl+C)
4. Pégalo en el SQL Editor de Supabase (reemplaza el contenido anterior)
5. Click en el botón **"RUN"**
6. **Espera** a que termine
7. Deberías ver un mensaje de éxito ✓

### 1.4 Verificar que las tablas se crearon

Ejecuta esta query en el SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deberías ver estas tablas:**
- actividades
- broker_profiles
- logros
- saved_filters
- tareas
- user_permissions
- user_sessions

**Y estas vistas:**
- vw_metricas_broker
- vw_ranking_actual

Si ves todas estas tablas, ¡perfecto! ✅

---

## 📋 PASO 2: Crear Usuarios (10 minutos)

### 2.1 Ir a Authentication

**Ve a**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/auth/users

### 2.2 Crear Usuarios (uno por uno)

Click en **"Add user"** (arriba a la derecha) y crea estos usuarios:

#### Usuario 1 - Admin
```
Email: admin@selvadentro.com
Password: Admin123!
✓ Auto Confirm User (marcar checkbox)
```
Click "Create user"

#### Usuario 2 - Director
```
Email: director@selvadentro.com
Password: Director123!
✓ Auto Confirm User
```
Click "Create user"

#### Usuario 3 - Manager
```
Email: manager@selvadentro.com
Password: Manager123!
✓ Auto Confirm User
```
Click "Create user"

#### Usuario 4 - Broker 1
```
Email: broker1@selvadentro.com
Password: Broker123!
✓ Auto Confirm User
```
Click "Create user"

#### Usuario 5 - Broker 2
```
Email: broker2@selvadentro.com
Password: Broker123!
✓ Auto Confirm User
```
Click "Create user"

---

## 📋 PASO 3: Crear Datos de Prueba (5 minutos)

### 3.1 Volver al SQL Editor

**Ve a**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new

### 3.2 Ejecutar Script de Datos de Prueba

1. Abre el archivo local: `scripts/create-test-users.sql`
2. Copia TODO el contenido
3. Pégalo en el SQL Editor
4. Click en **"RUN"**
5. Espera a que termine

Esto creará:
- 5 perfiles de brokers (Ana, Carlos, María, Juan, Laura)
- Actividades de ejemplo
- Logros desbloqueados
- Tareas pendientes

### 3.3 Verificar Datos

Ejecuta esta query:

```sql
SELECT
    broker_id,
    nombre,
    email,
    nivel,
    puntos_mes,
    role
FROM broker_profiles
ORDER BY puntos_mes DESC;
```

Deberías ver 5 brokers con diferentes niveles y puntos.

---

## 📋 PASO 4: Vincular Usuarios con Brokers (3 minutos)

### 4.1 Ejecutar Queries de Vinculación

En el SQL Editor, ejecuta estas queries **UNA POR UNA**:

```sql
-- 1. Vincular broker1
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker1@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker1@selvadentro.com';
```

Click "RUN", espera el ✓

```sql
-- 2. Vincular broker2
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker2@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker2@selvadentro.com';
```

Click "RUN", espera el ✓

```sql
-- 3. Configurar Admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin', 'nombre', 'Admin User')
WHERE email = 'admin@selvadentro.com';
```

Click "RUN", espera el ✓

```sql
-- 4. Configurar Director
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'director', 'nombre', 'Director User')
WHERE email = 'director@selvadentro.com';
```

Click "RUN", espera el ✓

```sql
-- 5. Configurar Manager
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'manager', 'nombre', 'Manager User')
WHERE email = 'manager@selvadentro.com';
```

Click "RUN", espera el ✓

### 4.2 Verificar Vinculación

```sql
-- Ver brokers vinculados
SELECT
    b.nombre,
    b.email,
    b.role,
    CASE WHEN b.user_id IS NOT NULL THEN '✓ Vinculado' ELSE '✗ Sin vincular' END as estado
FROM broker_profiles b
ORDER BY b.nombre;
```

Deberías ver que broker1 y broker2 están vinculados.

```sql
-- Ver usuarios con roles
SELECT
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'nombre' as nombre
FROM auth.users
ORDER BY email;
```

Deberías ver los roles asignados a cada usuario.

---

## 📋 PASO 5: Probar Localmente (5 minutos)

### 5.1 Instalar Dependencias (si no lo has hecho)

```bash
npm install
```

### 5.2 Ejecutar en Desarrollo

```bash
npm run dev
```

### 5.3 Probar el Login

Abre en tu navegador: **http://localhost:3000/login**

#### Prueba 1: Login como Broker
```
Email: broker1@selvadentro.com
Password: Broker123!
```

Deberías ser redirigido a: `/broker/broker_001`

**Verifica que se muestre:**
- ✓ Header con nombre y avatar
- ✓ Barra de progreso de nivel
- ✓ 6 tarjetas de métricas
- ✓ Proyecciones
- ✓ Tareas diarias
- ✓ Mini leaderboard
- ✓ Logros

#### Prueba 2: Login como Director
Cierra sesión (logout) y login con:
```
Email: director@selvadentro.com
Password: Director123!
```

Deberías ser redirigido a: `/executive`

**Verifica que se muestre:**
- ✓ Dashboard ejecutivo
- ✓ Filtros dinámicos
- ✓ Tarjetas de resumen
- ✓ Panel de alertas
- ✓ Tabla de top performers

---

## 📋 PASO 6: Deploy a Vercel (10 minutos)

### 6.1 Ir a Vercel

**Ve a**: https://vercel.com/new

### 6.2 Importar Proyecto

1. Si es tu primera vez, haz login con GitHub
2. Click en **"Add New"** → **"Project"**
3. Conecta tu repositorio de GitHub
4. Busca: `mcp-dashboard-manager`
5. Click en **"Import"**

### 6.3 Configurar Variables de Entorno

Antes de hacer deploy, en la sección **"Environment Variables"** agrega estas variables:

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://qokskmzbugfmthwioukz.supabase.co
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva3NrbXpidWdmbXRod2lvdWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDQwOTksImV4cCI6MjA3NzMyMDA5OX0.0c48nbIpEwnwU8npA9Elu_jn0IEEr8qjVdGvL8jLGIM
```

**Variable 3:**
```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFva3NrbXpidWdmbXRod2lvdWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc0NDA5OSwiZXhwIjoyMDc3MzIwMDk5fQ.OXWaAvK8acIdOr5x5cy4JkTb2L_Z50iwqsW1fst1wso
```

**Variable 4:**
```
Name: GHL_PRIVATE_TOKEN
Value: pit-84d7687f-d43f-4434-9804-c671c669dd0f
```

**Variable 5:**
```
Name: GHL_LOCATION_ID
Value: crN2IhAuOBAl7D8324yI
```

**IMPORTANTE**: Asegúrate de marcar que se apliquen a todos los ambientes:
- ✓ Production
- ✓ Preview
- ✓ Development

### 6.4 Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos (verás el progreso en tiempo real)
3. Cuando termine, verás **"Congratulations!"**
4. Click en **"Visit"** para ver tu app en producción

---

## ✅ CHECKLIST FINAL

Usa esto para verificar que todo esté completo:

### Base de Datos
- [ ] Migración gamification-schema.sql ejecutada
- [ ] Migración auth-schema.sql ejecutada
- [ ] Tablas verificadas (actividades, broker_profiles, etc.)
- [ ] Vistas creadas (vw_metricas_broker, vw_ranking_actual)

### Usuarios
- [ ] Admin creado (admin@selvadentro.com)
- [ ] Director creado (director@selvadentro.com)
- [ ] Manager creado (manager@selvadentro.com)
- [ ] Broker1 creado (broker1@selvadentro.com)
- [ ] Broker2 creado (broker2@selvadentro.com)

### Datos de Prueba
- [ ] Script create-test-users.sql ejecutado
- [ ] 5 brokers creados con datos
- [ ] Actividades de ejemplo creadas
- [ ] Logros desbloqueados
- [ ] Tareas creadas

### Vinculación
- [ ] Broker1 vinculado con user_id
- [ ] Broker2 vinculado con user_id
- [ ] Admin tiene role='admin' en metadata
- [ ] Director tiene role='director' en metadata
- [ ] Manager tiene role='manager' en metadata

### Testing Local
- [ ] npm install ejecutado
- [ ] npm run dev funciona
- [ ] Login con broker1 funciona
- [ ] Dashboard de broker carga correctamente
- [ ] Login con director funciona
- [ ] Dashboard ejecutivo carga correctamente

### Deploy Vercel
- [ ] Proyecto importado en Vercel
- [ ] 5 variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] URL de producción funciona
- [ ] Login en producción funciona

---

## 🎉 ¡TERMINADO!

Una vez completados todos estos pasos, tendrás:

✅ **Dashboard de Producción Funcional**
- URL pública para tu equipo
- Sistema de login por roles
- Gamificación activada
- Métricas en tiempo real

✅ **Credenciales de Prueba**

**Broker:**
- Email: broker1@selvadentro.com
- Password: Broker123!
- Acceso: Dashboard personal

**Director:**
- Email: director@selvadentro.com
- Password: Director123!
- Acceso: Dashboard ejecutivo

**Admin:**
- Email: admin@selvadentro.com
- Password: Admin123!
- Acceso: Acceso total

---

## 🆘 ¿Problemas?

Si algo no funciona:

1. **"Table does not exist"**
   - Verifica que ejecutaste ambas migraciones SQL
   - Corre la query de verificación de tablas

2. **"Invalid credentials"**
   - Verifica que marcaste "Auto Confirm User"
   - Intenta resetear la contraseña del usuario

3. **"Unauthorized"**
   - Verifica que el usuario tenga user_id en broker_profiles
   - Verifica que el role esté en user_metadata

4. **Dashboard en blanco**
   - Abre F12 (consola del navegador)
   - Busca errores en rojo
   - Verifica que las variables de entorno estén correctas

---

## 📞 URLs Importantes

- **App en Producción**: [Tu URL de Vercel después del deploy]
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz
- **SQL Editor**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/sql/new
- **Auth Users**: https://supabase.com/dashboard/project/qokskmzbugfmthwioukz/auth/users
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Tiempo total estimado: 40-50 minutos**

**¡Empieza con el Paso 1 ahora! 🚀**
