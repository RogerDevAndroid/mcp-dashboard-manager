# 🎯 Deployment Manual - Paso a Paso Simplificado

## ✅ Pre-requisitos

- [x] Cuenta de Supabase creada
- [x] Proyecto Supabase activo: `mmxkcsqflbqzgsekxiwp`
- [ ] Service Role Key obtenida
- [ ] Cuenta de Vercel creada (gratis)

---

## 📋 Paso 1: Ejecutar Migraciones SQL (15 min)

### 1.1 Abrir SQL Editor en Supabase

Ve a: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/sql/new

### 1.2 Ejecutar Primera Migración (Gamification)

1. Abre el archivo: `database/gamification-schema.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Click en **"Run"** (abajo a la derecha)
5. Espera a que termine (verás un ✓ verde)

### 1.3 Ejecutar Segunda Migración (Auth)

1. Abre el archivo: `database/auth-schema.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor (reemplaza el contenido anterior)
4. Click en **"Run"**
5. Espera a que termine

### 1.4 Verificar que funcionó

Ejecuta esta query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver estas tablas:
- `actividades`
- `broker_profiles`
- `logros`
- `tareas`
- `user_permissions`
- `user_sessions`
- `saved_filters`

---

## 👥 Paso 2: Crear Usuarios de Prueba (10 min)

### 2.1 Crear Usuarios en Authentication

Ve a: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/auth/users

Click en **"Add user"** y crea estos 5 usuarios:

#### Usuario 1 - Admin
- **Email**: `admin@selvadentro.com`
- **Password**: `Admin123!` (o el que prefieras)
- **Auto Confirm User**: ✓ (marcado)

#### Usuario 2 - Director
- **Email**: `director@selvadentro.com`
- **Password**: `Director123!`
- **Auto Confirm User**: ✓

#### Usuario 3 - Manager
- **Email**: `manager@selvadentro.com`
- **Password**: `Manager123!`
- **Auto Confirm User**: ✓

#### Usuario 4 - Broker 1
- **Email**: `broker1@selvadentro.com`
- **Password**: `Broker123!`
- **Auto Confirm User**: ✓

#### Usuario 5 - Broker 2
- **Email**: `broker2@selvadentro.com`
- **Password**: `Broker123!`
- **Auto Confirm User**: ✓

### 2.2 Crear Perfiles de Brokers y Datos de Prueba

1. Vuelve al SQL Editor
2. Abre el archivo: `scripts/create-test-users.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en **"Run"**

Esto creará:
- 5 perfiles de brokers
- Actividades de ejemplo
- Logros desbloqueados
- Tareas pendientes

### 2.3 Vincular Usuarios Auth con Brokers

Ejecuta estas queries **una por una** en el SQL Editor:

```sql
-- Vincular broker1@selvadentro.com
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker1@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker1@selvadentro.com';

-- Vincular broker2@selvadentro.com
UPDATE broker_profiles
SET user_id = (SELECT id FROM auth.users WHERE email = 'broker2@selvadentro.com'),
    role = 'broker'
WHERE email = 'broker2@selvadentro.com';
```

### 2.4 Configurar Roles de Admin/Director/Manager

```sql
-- Configurar Admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'admin',
    'nombre', 'Admin User'
)
WHERE email = 'admin@selvadentro.com';

-- Configurar Director
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'director',
    'nombre', 'Director User'
)
WHERE email = 'director@selvadentro.com';

-- Configurar Manager
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
    'role', 'manager',
    'nombre', 'Manager User'
)
WHERE email = 'manager@selvadentro.com';
```

### 2.5 Verificar

```sql
-- Ver usuarios con roles
SELECT
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'nombre' as nombre
FROM auth.users
ORDER BY email;

-- Ver brokers vinculados
SELECT
    b.nombre,
    b.email,
    b.role,
    b.nivel,
    b.puntos_mes,
    CASE WHEN b.user_id IS NOT NULL THEN '✓' ELSE '✗' END as vinculado
FROM broker_profiles b
ORDER BY b.puntos_mes DESC;
```

---

## 🔑 Paso 3: Configurar Variables de Entorno (5 min)

### 3.1 Obtener Service Role Key

1. Ve a: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api
2. En "Project API keys", busca `service_role`
3. Click en el ícono del ojo 👁️ para revelar
4. Copia el valor completo

### 3.2 Actualizar .env.local

Abre el archivo `.env.local` y agrega el Service Key:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://mmxkcsqflbqzgsekxiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teGtjc3FmbGJxemdzZWt4aXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODQ3MTAsImV4cCI6MjA3NzM2MDcxMH0.iW1ZO8_XYjf5HO6Ozuyo1rpZ_TEdG_rYA-J7WGoZCrU

# AGREGA ESTA LÍNEA con el Service Key que copiaste:
SUPABASE_SERVICE_KEY=tu-service-key-aqui

# GoHighLevel Configuration (ya existe)
GHL_PRIVATE_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
```

---

## 🚀 Paso 4: Probar Localmente (5 min)

### 4.1 Instalar Dependencias

```bash
npm install
```

### 4.2 Ejecutar en Desarrollo

```bash
npm run dev
```

### 4.3 Probar el Login

1. Abre: http://localhost:3000/login
2. Prueba con cada usuario:

**Broker:**
- Email: `broker1@selvadentro.com`
- Password: `Broker123!`
- ✓ Debería redirigir a: `/broker/broker_001`

**Director:**
- Email: `director@selvadentro.com`
- Password: `Director123!`
- ✓ Debería redirigir a: `/executive`

**Admin:**
- Email: `admin@selvadentro.com`
- Password: `Admin123!`
- ✓ Debería redirigir a: `/executive`

---

## 🌐 Paso 5: Deploy a Vercel (10 min)

### 5.1 Crear Cuenta en Vercel

1. Ve a: https://vercel.com/signup
2. Conecta con tu cuenta de GitHub

### 5.2 Importar Proyecto

1. Click en **"Add New"** → **"Project"**
2. Busca el repo: `mcp-dashboard-manager`
3. Click en **"Import"**

### 5.3 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL = https://mmxkcsqflbqzgsekxiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teGtjc3FmbGJxemdzZWt4aXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3ODQ3MTAsImV4cCI6MjA3NzM2MDcxMH0.iW1ZO8_XYjf5HO6Ozuyo1rpZ_TEdG_rYA-J7WGoZCrU
SUPABASE_SERVICE_KEY = [tu-service-key]
GHL_PRIVATE_TOKEN = pit-84d7687f-d43f-4434-9804-c671c669dd0f
GHL_LOCATION_ID = crN2IhAuOBAl7D8324yI
```

**IMPORTANTE**: Aplica estas variables a todos los ambientes:
- ✓ Production
- ✓ Preview
- ✓ Development

### 5.4 Deploy

1. Click en **"Deploy"**
2. Espera ~2-3 minutos
3. ✓ Cuando termine, verás tu URL: `https://tu-proyecto.vercel.app`

---

## ✅ Paso 6: Testing Final (10 min)

### 6.1 Probar en Producción

Abre tu URL de Vercel: `https://tu-proyecto.vercel.app/login`

### 6.2 Checklist de Testing

- [ ] Login con broker funciona
- [ ] Dashboard de broker muestra métricas
- [ ] Barra de progreso de nivel se ve
- [ ] Tareas diarias aparecen
- [ ] Mini leaderboard funciona
- [ ] Login con director funciona
- [ ] Dashboard ejecutivo carga
- [ ] Filtros funcionan (fecha, broker)
- [ ] Tabla de top performers se muestra
- [ ] Gráficos renderizan
- [ ] Logout funciona

### 6.3 Crear Actividad de Prueba

1. Login como broker
2. Usa los botones de "Registrar Llamada"
3. Verifica que:
   - [ ] Los puntos aumentan
   - [ ] La barra de progreso se actualiza
   - [ ] El ranking cambia

---

## 🎉 ¡Completado!

Tu dashboard está funcionando en producción:
- ✅ Base de datos configurada
- ✅ Usuarios creados
- ✅ App deployada en Vercel
- ✅ Sistema funcional

### URLs Importantes

- **App en Producción**: https://tu-proyecto.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp
- **Vercel Dashboard**: https://vercel.com/dashboard

### Credenciales de Prueba

Guarda estas credenciales para compartir con tu equipo:

**Admin:**
- Email: admin@selvadentro.com
- Password: Admin123!

**Director:**
- Email: director@selvadentro.com
- Password: Director123!

**Broker de Prueba:**
- Email: broker1@selvadentro.com
- Password: Broker123!

---

## 🆘 ¿Problemas?

### Error: "Invalid API key"
- Verifica que las keys en Vercel sean las correctas
- Confirma que el Service Key esté bien copiado

### Error: "Table does not exist"
- Vuelve a ejecutar las migraciones SQL
- Verifica que ambos archivos se ejecutaron

### Error: "Unauthorized"
- Verifica que el usuario tenga un `user_id` en `broker_profiles`
- Confirma que el rol esté configurado correctamente

### El dashboard está en blanco
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Verifica que las variables de entorno en Vercel estén correctas

### Re-deploy después de cambios
```bash
# En tu terminal:
git add .
git commit -m "Fix: descripción del cambio"
git push

# Vercel automáticamente hará re-deploy
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs en Vercel: Dashboard → Tu Proyecto → Deployments → Ver logs
2. Revisa los logs en Supabase: Dashboard → Logs
3. Consulta la documentación completa en `/docs`

---

**Tiempo total estimado**: ~55 minutos

¡Disfruta tu dashboard gamificado! 🚀🎮
