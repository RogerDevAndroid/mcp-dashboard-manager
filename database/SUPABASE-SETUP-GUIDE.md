# Guía de Configuración de Supabase

Configuración completa de la base de datos para el MCP Dashboard Manager.

---

## 🎯 Tu Proyecto Supabase

**Project Reference**: `mmxkcsqflbqzgsekxiwp`

**URLs importantes:**
- Dashboard: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp
- SQL Editor: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/sql/new
- Table Editor: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/editor
- API Settings: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api

---

## 📝 Paso 1: Obtener Credenciales

1. Ve a **Settings** → **API**

   URL directa: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api

2. Copia estas credenciales:

   ```
   Project URL: https://mmxkcsqflbqzgsekxiwp.supabase.co

   anon public key: [copia este valor]

   service_role key: [copia este valor - SECRETO]
   ```

3. Guárdalas en un lugar seguro (las necesitarás después)

---

## 🗄️ Paso 2: Crear las Tablas

### Opción A: SQL Editor (Recomendado)

1. **Abre el SQL Editor**

   https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/sql/new

2. **Copia TODO el contenido** del archivo:

   `database/mcp-manager-schema.sql`

3. **Pega** en el SQL Editor

4. **Click en "Run" (▶️)**

5. **Espera** a que termine (puede tomar 10-15 segundos)

6. **Verifica** que dice "Success" en verde

### Opción B: Usar el Script de Node.js

```bash
# En tu terminal, desde /root/rogervibes/mcp-dashboard

# 1. Configura tu service role key
export SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key_aqui"

# 2. Ejecuta el script
node database/setup-supabase.js
```

El script te guiará en el proceso.

---

## ✅ Paso 3: Verificar que Todo Está Bien

### 3.1 Verificar Tablas

1. Ve a **Table Editor**:

   https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/editor

2. Deberías ver estas tablas:
   - ✓ `mcp_servers` (30+ registros)
   - ✓ `mcp_configurations`
   - ✓ `mcp_tools`
   - ✓ `mcp_usage_logs`
   - ✓ `agent_orchestrator`
   - ✓ `specialized_agents`
   - ✓ `onboarding_steps`
   - ✓ `user_onboarding_progress`

### 3.2 Verificar Datos Iniciales

1. Click en tabla `mcp_servers`

2. Deberías ver MCPs como:
   - Stripe
   - GoHighLevel
   - Linear
   - Notion
   - Sentry
   - etc. (30+ total)

### 3.3 Verificar Extensiones

1. Ve a **Database** → **Extensions**

2. Asegúrate de que estén habilitadas:
   - ✓ `uuid-ossp`
   - ✓ `vector` (para RAG)

Si `vector` no está, actívala:
1. Busca "vector"
2. Click en el toggle para activarla

---

## 🔌 Paso 4: Configurar Variables de Entorno

### Para el Agente Orquestador

Edita `~/.n8n/config` (o donde tengas tu configuración):

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": ["/root/rogervibes/mcp-dashboard/agents/orchestrator-agent.js"],
      "env": {
        "USER_ID": "user_001",
        "SUPABASE_URL": "https://mmxkcsqflbqzgsekxiwp.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_service_role_key"
      }
    },
    "supabase-rag": {
      "command": "node",
      "args": ["/root/rogervibes/supabasemcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://mmxkcsqflbqzgsekxiwp.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_service_role_key"
      }
    }
  }
}
```

### Para el Dashboard (Netlify)

En Netlify → Site settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://mmxkcsqflbqzgsekxiwp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_publico
```

⚠️ **IMPORTANTE**: Usa `anon key` (pública) para el dashboard, NO la `service_role key`

---

## 🧪 Paso 5: Probar la Configuración

### Prueba 1: Query Básica

En SQL Editor, ejecuta:

```sql
-- Ver todos los MCPs
SELECT name, display_name, category, official
FROM mcp_servers
ORDER BY category, name;

-- Debería devolver ~30 registros
```

### Prueba 2: Insertar Configuración de Prueba

```sql
-- Crear un usuario de prueba y configurar un MCP
INSERT INTO mcp_configurations (user_id, mcp_server_id, enabled, credentials)
SELECT
  'test_user',
  id,
  true,
  '{"configured": true}'::jsonb
FROM mcp_servers
WHERE name = 'stripe'
LIMIT 1;

-- Verificar
SELECT * FROM mcp_configurations WHERE user_id = 'test_user';
```

### Prueba 3: Verificar Vistas

```sql
-- Ver estadísticas de MCPs
SELECT * FROM mcp_servers_with_stats LIMIT 5;
```

---

## 🎨 Paso 6: Conectar el Dashboard

### Actualizar el Dashboard para Usar Datos Reales

Crea archivo `/root/rogervibes/mcp-dashboard/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Luego actualiza las páginas para usar datos reales en lugar de mock data.

---

## 📊 Estructura de Datos Creada

### MCPs Pre-cargados (30+)

**Categorías:**
- Development & Testing: Sentry, Socket, Hugging Face, Jam
- Project Management: Asana, Atlassian, Linear, Notion, Box, Fireflies, Monday, Intercom
- Database: Airtable, Daloopa, HubSpot, GoHighLevel, Supabase RAG
- Payments: PayPal, Plaid, Square, Stripe
- Design & Media: Figma, InVideo, Canva
- Infrastructure: Netlify, Stytch, Vercel

### Tablas de Usuario

**Para cada usuario**:
- `mcp_configurations` - MCPs habilitados y credenciales
- `agent_orchestrator` - Configuración del orquestador
- `specialized_agents` - Agentes personalizados
- `user_onboarding_progress` - Estado de onboarding

### Logs y Analytics

- `mcp_usage_logs` - Cada ejecución de MCP
- Automáticamente registra: timestamp, success/fail, execution time

---

## 🔒 Seguridad y RLS

### Row Level Security (Opcional)

Si quieres habilitar RLS para proteger datos por usuario:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE mcp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_orchestrator ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialized_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_usage_logs ENABLE ROW LEVEL SECURITY;

-- Política de ejemplo: usuarios solo ven sus propios datos
CREATE POLICY "Users see own data"
  ON mcp_configurations
  FOR ALL
  USING (user_id = auth.uid()::text);

-- Repetir para otras tablas...
```

⚠️ **Nota**: Si habilitas RLS, necesitarás configurar autenticación en el dashboard.

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

**Solución**: Las tablas no se crearon. Re-ejecuta el SQL:
1. Ve al SQL Editor
2. Pega `mcp-manager-schema.sql` completo
3. Run

### Error: "permission denied"

**Solución**: Estás usando la anon key en lugar de service_role key.
- Para el backend/agentes: usa `service_role key`
- Para el dashboard: usa `anon key`

### Error: "extension vector does not exist"

**Solución**:
1. Ve a Database → Extensions
2. Busca "vector"
3. Actívala

### Las queries son lentas

**Solución**: Los índices ya están creados. Si aún es lento:
1. Ve a Database → Performance
2. Revisa Query Performance
3. Considera upgrade de plan si tienes muchos datos

---

## 📈 Próximos Pasos

1. ✅ Base de datos configurada
2. ⏭️ Configurar MCPs individuales (Stripe, GHL, etc.)
3. ⏭️ Crear tu primer agente especializado
4. ⏭️ Conectar el dashboard con datos reales
5. ⏭️ Configurar workflows en n8n

---

## 🆘 Necesitas Ayuda?

1. **Revisa los logs** en SQL Editor si algo falla
2. **Consulta la documentación** de Supabase: https://supabase.com/docs
3. **Verifica las credenciales** en Settings → API
4. **Re-ejecuta el schema** si es necesario (es idempotente)

---

## 📞 Links Rápidos

- 🏠 Dashboard: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp
- 💻 SQL Editor: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/sql/new
- 📊 Table Editor: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/editor
- 🔧 Settings: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/settings/api
- 📈 Logs: https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/logs/query

---

**🎉 ¡Tu base de datos está lista para usar!**
