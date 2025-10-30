# 🚀 Guía de Instalación - Dashboard Gamificado Brokers

**Proyecto**: Selvadentro Tulum - Dashboard de Gamificación para Brokers
**Tiempo estimado**: 30-45 minutos

---

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js 18+** ([descargar](https://nodejs.org/))
- ✅ **npm 9+** (viene con Node.js)
- ✅ **Cuenta de Supabase** ([crear gratis](https://supabase.com))
- ✅ **Token de GoHighLevel** (ya lo tienes)
- ✅ **Git** ([descargar](https://git-scm.com/))

Verifica tus versiones:
```bash
node --version  # debe ser v18.0.0 o superior
npm --version   # debe ser 9.0.0 o superior
```

---

## 📦 Paso 1: Instalar Dependencias

```bash
# Navega al proyecto
cd /Users/rgarciavital/Documents/SoftvibesLab/mcpvibes/mcp-dashboard-manager

# Instala todas las dependencias
npm install

# Esto instalará:
# - Next.js 15
# - React 18
# - Supabase client
# - Recharts (gráficos)
# - Lucide React (iconos)
# - Tailwind CSS
# - TypeScript
# - Y más...
```

**Tiempo**: ~3-5 minutos (dependiendo de tu conexión)

---

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "New Project"
3. Llena los datos:
   - **Name**: `selvadentro-broker-dashboard`
   - **Database Password**: Genera una segura y guárdala
   - **Region**: `South America (São Paulo)` (más cercano a Tulum)
4. Click "Create new project"
5. Espera 2-3 minutos mientras se crea

### 2.2 Ejecutar Migrations

1. En Supabase, ve a **SQL Editor** (menú izquierdo)
2. Click en "New Query"
3. Abre el archivo `database/gamification-schema.sql`
4. Copia TODO el contenido (400+ líneas)
5. Pégalo en el SQL Editor de Supabase
6. Click en **"Run"**
7. Deberías ver: ✅ Success! (con estadísticas de filas creadas)

Esto creará:
- ✅ 10 tablas principales
- ✅ 2 triggers automáticos
- ✅ 2 views para queries rápidas
- ✅ 30+ registros de catálogo
- ✅ Row Level Security policies

### 2.3 Obtener Credenciales de Supabase

En tu proyecto de Supabase:

1. Ve a **Settings** (engrane en menú izquierdo)
2. Click en **API**
3. Copia estos 3 valores:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (⚠️ Mantén esto secreto)
```

---

## 🔑 Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env.local

En la raíz del proyecto, crea el archivo `.env.local`:

```bash
# En la terminal
cp .env.example .env.local
# O crea el archivo manualmente
```

### 3.2 Agregar las credenciales

Abre `.env.local` y agrega:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu-anon-key...
SUPABASE_SERVICE_KEY=eyJhbGc...tu-service-role-key...

# Database URL para migrations (opcional, si usas CLI)
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# GoHighLevel
GHL_PRIVATE_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
GHL_MCP_ENDPOINT=https://services.leadconnectorhq.com/mcp/

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Nunca subas este archivo a Git. Ya está en `.gitignore`.

---

## 🏃 Paso 4: Iniciar el Proyecto

### 4.1 Desarrollo Local

```bash
# Terminal 1: Iniciar Next.js
npm run dev

# La app estará disponible en:
# http://localhost:3000
```

### 4.2 Iniciar Sync Worker (en otra terminal)

```bash
# Terminal 2: Iniciar worker de sincronización
npm run worker

# Esto sincronizará datos de GoHighLevel cada 5 minutos
```

Deberías ver en la terminal:
```
========================================
🔄 GHL Sync Worker - Selvadentro Tulum
========================================

Brokers monitoreados: 7
  • Omar Curi (TKzZQuHjdRG9x4tpwpRx)
  • Pablo Saracho (JWkZYNaQyKuRfPEnBeiC)
  • ...

🔍 Verificando salud de conexiones...
  ✅ GoHighLevel: Conectado
  ✅ Supabase: Conectado

📋 Sincronizando contactos...
  ✅ 85 contactos obtenidos de GHL
  ✅ 12 nuevos, 73 actualizados

💼 Sincronizando oportunidades...
  ✅ 23 oportunidades obtenidas de GHL

✅ Sincronización completada en 3.45s
```

---

## 🧪 Paso 5: Verificar Instalación

### 5.1 Verificar Base de Datos

En Supabase SQL Editor, ejecuta:

```sql
-- Ver brokers creados
SELECT * FROM broker_profiles;

-- Ver si hay datos sincronizados
SELECT COUNT(*) as total_leads FROM leads_asignados;
SELECT COUNT(*) as total_actividades FROM actividades;

-- Ver ranking actual
SELECT * FROM vw_ranking_actual;
```

### 5.2 Probar API Endpoints

Abre tu navegador o Postman:

```bash
# 1. Test de health
http://localhost:3000/api/health

# 2. Dashboard de Pablo Saracho
http://localhost:3000/api/broker/dashboard?brokerId=JWkZYNaQyKuRfPEnBeiC

# 3. Leaderboard
http://localhost:3000/api/leaderboard

# 4. Dashboard ejecutivo
http://localhost:3000/api/executive/dashboard
```

### 5.3 Acceder a las Páginas

```bash
# Dashboard de broker (Pablo Saracho)
http://localhost:3000/broker/JWkZYNaQyKuRfPEnBeiC

# Dashboard ejecutivo
http://localhost:3000/executive

# Leaderboard completo
http://localhost:3000/leaderboard
```

---

## 🎨 Paso 6: Configurar Tailwind CSS (si no está)

Si ves que no hay estilos, verifica que exista `tailwind.config.js`:

```bash
# Verificar archivo
ls tailwind.config.js

# Si no existe, crearlo:
npx tailwindcss init -p
```

El archivo debe contener:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 🐛 Troubleshooting

### Problema 1: "Module not found: Can't resolve '@supabase/supabase-js'"

**Solución**:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Problema 2: "Missing environment variable"

**Solución**:
- Verifica que `.env.local` existe
- Verifica que todas las variables están definidas
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### Problema 3: "Database relation 'broker_profiles' does not exist"

**Solución**:
- Ve a Supabase SQL Editor
- Re-ejecuta `database/gamification-schema.sql`
- Verifica que no hubo errores en la ejecución

### Problema 4: Worker no sincroniza datos

**Solución**:
```bash
# Verifica credenciales de GHL
echo $GHL_PRIVATE_TOKEN
echo $GHL_LOCATION_ID

# Prueba conexión manualmente
curl -H "Authorization: Bearer pit-84d7687f-d43f-4434-9804-c671c669dd0f" \
  -H "Version: 2021-07-28" \
  "https://services.leadconnectorhq.com/contacts/?locationId=crN2IhAuOBAl7D8324yI&limit=1"
```

### Problema 5: Puerto 3000 ya en uso

**Solución**:
```bash
# Detener proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
PORT=3001 npm run dev
```

---

## 📱 Paso 7: Testing con Datos Reales

### 7.1 Poblar Perfiles de Brokers

Ejecuta en Supabase SQL Editor:

```sql
-- Insertar perfiles de los 7 brokers
INSERT INTO broker_profiles (broker_id, nombre, email, telefono, avatar, puntos_mes, puntos_total, nivel, activo) VALUES
('TKzZQuHjdRG9x4tpwpRx', 'Omar Curi', 'd.comercial@selvadentrotulum.com', '+529841234567', NULL, 892, 2456, 'Elite', true),
('JWkZYNaQyKuRfPEnBeiC', 'Pablo Saracho', 'psaracho@selvadentrotulum.com', '+529841234568', NULL, 145, 345, 'Junior', true),
('UXlYNIkoELdoGreTa7Th', 'Raquel Reyes', 'rreyes@selvadentrotulum.com', '+529841234569', NULL, 720, 1890, 'Elite', true),
('jVFCuWoAZEFJ7x85sJTz', 'Mafer Cienfuegos', 'mcienfuegos@selvadentrotulum.com', '+529841234570', NULL, 580, 1234, 'Senior', true),
('NbVUWwCOFUA5phlcZpGm', 'Mariano Molina', 'mmolina@selvadentrotulum.com', '+529841234571', NULL, 125, 456, 'Junior', true),
('UZa6pmz2KCBTAXgEGXE8', 'Gonzalo Caro', 'gcaro@selvadentrotulum.com', '+529841234572', NULL, 98, 234, 'Rookie', true),
('vWerQ2MELDsCSFFKxkJQ', 'Jaqueline Selvadentro', 'jaqueline@selvadentrotulum.com', '+529841234573', NULL, 67, 178, 'Rookie', true)
ON CONFLICT (broker_id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  puntos_mes = EXCLUDED.puntos_mes,
  puntos_total = EXCLUDED.puntos_total,
  nivel = EXCLUDED.nivel;
```

### 7.2 Ejecutar Worker para Sincronizar

```bash
# Ejecuta el worker manualmente para traer datos de GHL
npm run worker

# O déjalo corriendo en background con PM2
npm run worker:pm2

# Ver logs
pm2 logs ghl-sync

# Detenerlo
npm run worker:stop
```

### 7.3 Verificar Dashboard de Pablo

```bash
# Abre en navegador
open http://localhost:3000/broker/JWkZYNaQyKuRfPEnBeiC
```

Deberías ver:
- ✅ Puntos actuales de Pablo
- ✅ Nivel (Junior)
- ✅ Ranking (posición en el equipo)
- ✅ Métricas (llamadas, presentaciones, etc.)
- ✅ Proyecciones de crecimiento
- ✅ Tareas pendientes

---

## 🚀 Paso 8: Deploy a Producción (opcional)

### Opción A: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Sigue el asistente:
# - Link to existing project? No
# - Project name: selvadentro-broker-dashboard
# - Directory: ./
# - Build command: npm run build
# - Output directory: .next

# Configurar variables de entorno en Vercel dashboard
# https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables
```

### Opción B: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configurar variables de entorno en Netlify dashboard
```

---

## ✅ Checklist Final

Marca cada ítem conforme lo completes:

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto Supabase creado
- [ ] Migrations ejecutadas en Supabase
- [ ] Archivo `.env.local` configurado con todas las credenciales
- [ ] Servidor Next.js corriendo (`npm run dev`)
- [ ] Worker sincronizando datos (`npm run worker`)
- [ ] API endpoints respondiendo correctamente
- [ ] Perfiles de brokers poblados en database
- [ ] Dashboard de Pablo Saracho visible en navegador
- [ ] Dashboard ejecutivo funcionando

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa la sección de **Troubleshooting** arriba
2. Verifica los logs de la terminal
3. Revisa los logs de Supabase
4. Contacta a Roger García Vital

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu dashboard está funcionando. Ahora puedes:

1. **Mostrar a Juan Esteban** el dashboard ejecutivo
2. **Capacitar a los brokers** para que usen su dashboard mobile
3. **Monitorear el sync worker** para asegurarte que está trayendo datos
4. **Iterar y mejorar** basado en feedback del equipo

---

**Última actualización**: 2025-10-30
**Versión**: 1.0.0
**Autor**: Roger García Vital + Claude
