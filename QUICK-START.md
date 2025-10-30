# Quick Start - MCP Dashboard Manager

Guía ultra rápida para tener tu sistema funcionando en 15 minutos.

---

## ⚡ Paso 1: Configurar Supabase (5 min)

```bash
# 1. Crea cuenta en https://supabase.com
# 2. Crea nuevo proyecto
# 3. Ve a SQL Editor
# 4. Ejecuta el script:
```

Copia y pega todo el contenido de: `database/mcp-manager-schema.sql`

Esto creará:
- ✓ 8 tablas principales
- ✓ Catálogo de 30+ MCPs populares
- ✓ Vistas y funciones auxiliares

```bash
# 5. Obtén tus credenciales:
#    Settings > API > Copia:
#    - Project URL
#    - service_role key (secret)
```

---

## ⚡ Paso 2: Compilar Agente Orquestador (3 min)

```bash
cd /root/rogervibes/mcp-dashboard/agents

# Instalar TypeScript si no lo tienes
npm install -g typescript

# Compilar
tsc orchestrator-agent.ts

# Resultado: orchestrator-agent.js
```

---

## ⚡ Paso 3: Configurar n8n (3 min)

Edita `~/.n8n/config` (o créalo si no existe):

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": ["/root/rogervibes/mcp-dashboard/agents/orchestrator-agent.js"],
      "env": {
        "USER_ID": "user_001",
        "SUPABASE_URL": "https://tu-proyecto.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_service_role_key_aqui"
      }
    },
    "supabase-rag": {
      "command": "node",
      "args": ["/root/rogervibes/supabasemcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://tu-proyecto.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_key"
      }
    }
  }
}
```

Reinicia n8n:
```bash
# Si está corriendo, detén y reinicia
n8n start
```

---

## ⚡ Paso 4: Importar Workflow (2 min)

1. Abre n8n: `http://localhost:5678`
2. **Import from File** → `workflows/orchestrator-workflow.json`
3. Configura credenciales:
   - Telegram Bot (obtén token de @BotFather)
   - OpenAI API Key
   - Supabase credentials
4. **Activate** el workflow

---

## ⚡ Paso 5: Configurar tu Primer MCP (2 min)

Vamos a habilitar Stripe para tu usuario:

```sql
-- En Supabase SQL Editor:

-- 1. Habilitar Stripe
INSERT INTO mcp_configurations (user_id, mcp_server_id, enabled, credentials)
SELECT
  'user_001', -- Tu user_id
  id,
  true,
  jsonb_build_object('STRIPE_API_KEY', 'sk_test_tu_key_aqui')
FROM mcp_servers
WHERE name = 'stripe';

-- 2. Crear configuración de orquestador
INSERT INTO agent_orchestrator (user_id, name, system_prompt, enabled_mcps)
VALUES (
  'user_001',
  'Mi Orquestador',
  'Eres un agente orquestador inteligente que coordina múltiples MCPs',
  '["stripe"]'::jsonb
);

-- 3. Verificar que todo esté configurado
SELECT
  ms.display_name,
  mc.enabled,
  mc.created_at
FROM mcp_configurations mc
JOIN mcp_servers ms ON mc.mcp_server_id = ms.id
WHERE mc.user_id = 'user_001';
```

---

## 🎉 ¡Listo! Prueba el Sistema

### Prueba 1: Test Básico

Envía a tu bot de Telegram:

```
"Hola, qué puedes hacer?"
```

Respuesta esperada:
```
Soy tu agente orquestador. Puedo ayudarte con:

• Gestión de pagos (Stripe)
• Base de conocimiento (Supabase RAG)
• Y mucho más según configures más MCPs

¿En qué te puedo ayudar?
```

### Prueba 2: Usar Stripe

```
"Lista mis últimas 5 transacciones de Stripe"
```

El orquestador:
1. Detecta que necesita Stripe
2. Ejecuta la herramienta
3. Te devuelve los resultados

### Prueba 3: Agente Especializado

Primero, activa un agente especializado:

```sql
-- Activar agente de ventas
INSERT INTO specialized_agents (
  name, display_name, category, system_prompt,
  required_mcps, user_id, active
)
SELECT
  'sales-closer',
  'Agente de Ventas',
  'sales',
  'Eres un agente de ventas experto...',
  '["stripe"]'::jsonb,
  'user_001',
  true;
```

Ahora prueba:
```
"Crea un customer en Stripe para Juan Pérez, email juan@test.com"
```

---

## 🚀 Siguientes Pasos

### Opción A: Configurar Más MCPs

Agrega más servicios para ampliar capacidades:

**GoHighLevel (CRM)**:
```sql
INSERT INTO mcp_configurations (user_id, mcp_server_id, enabled, credentials)
SELECT
  'user_001',
  id,
  true,
  jsonb_build_object(
    'GHL_API_KEY', 'tu_api_key',
    'GHL_LOCATION_ID', 'tu_location_id'
  )
FROM mcp_servers
WHERE name = 'gohighlevel';
```

**Notion (Docs)**:
```sql
-- Notion usa OAuth, así que necesitas seguir el onboarding flow
SELECT * FROM onboarding_steps WHERE mcp_server_id = (
  SELECT id FROM mcp_servers WHERE name = 'notion'
);
```

### Opción B: Activar Más Agentes Especializados

Importa los agentes de ejemplo:

```bash
# Los ejemplos están en:
agents/specialized-agents-examples.json

# Para importarlos a Supabase:
# Usa el script de migración o importa manualmente desde el JSON
```

Agentes disponibles:
- ✓ Sales Closer (Ventas)
- ✓ Customer Support (Soporte)
- ✓ Dev Productivity (Desarrollo)
- ✓ Content Creator (Marketing)
- ✓ Project Manager
- ✓ Finance Analyst
- ✓ DevOps Engineer
- ✓ Data Analyst

### Opción C: Personalizar el Orquestador

Agrega reglas de enrutamiento para decisiones automáticas:

```sql
-- Actualizar reglas de enrutamiento
UPDATE agent_orchestrator
SET routing_rules = '[
  {
    "condition": "payment",
    "mcp_server": "stripe",
    "priority": 10
  },
  {
    "condition": "contact",
    "mcp_server": "gohighlevel",
    "priority": 9
  },
  {
    "condition": "search",
    "mcp_server": "supabase-rag",
    "priority": 8
  }
]'::jsonb
WHERE user_id = 'user_001';
```

---

## 📊 Ver Analytics

Consulta el uso de tus MCPs:

```sql
-- MCPs más usados
SELECT
  ms.display_name,
  COUNT(*) as usage_count
FROM mcp_usage_logs ml
JOIN mcp_servers ms ON ml.mcp_server_id = ms.id
WHERE ml.user_id = 'user_001'
  AND ml.created_at > NOW() - INTERVAL '7 days'
GROUP BY ms.display_name
ORDER BY usage_count DESC;

-- Tasa de éxito
SELECT
  ms.display_name,
  ROUND(AVG(CASE WHEN ml.success THEN 1.0 ELSE 0.0 END) * 100, 2) as success_rate
FROM mcp_usage_logs ml
JOIN mcp_servers ms ON ml.mcp_server_id = ms.id
WHERE ml.user_id = 'user_001'
GROUP BY ms.display_name;
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to MCP server"

```bash
# Verifica que el agente esté compilado
ls -la /root/rogervibes/mcp-dashboard/agents/orchestrator-agent.js

# Si no existe, compila de nuevo
cd /root/rogervibes/mcp-dashboard/agents
tsc orchestrator-agent.ts

# Prueba manualmente
node orchestrator-agent.js
```

### Error: "Table does not exist"

```sql
-- Verifica que las tablas existan
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'mcp%'
ORDER BY table_name;

-- Si no aparecen, ejecuta de nuevo el schema
```

### El agente no responde

1. Verifica logs de n8n:
```bash
n8n start --loglevel debug
```

2. Verifica que el workflow esté activo

3. Verifica credenciales de Telegram/OpenAI

### No encuentra MCPs configurados

```sql
-- Verifica tu configuración
SELECT * FROM mcp_configurations
WHERE user_id = 'user_001';

-- Si está vacío, configura al menos uno:
INSERT INTO mcp_configurations (user_id, mcp_server_id, enabled)
SELECT 'user_001', id, true
FROM mcp_servers
WHERE name = 'supabase-rag';
```

---

## 📚 Documentación Completa

- **README.md** - Documentación principal del sistema
- **CASOS-DE-USO-PRACTICOS.md** - Ejemplos reales detallados
- **database/mcp-manager-schema.sql** - Schema de base de datos
- **agents/orchestrator-agent.ts** - Código del orquestador
- **agents/specialized-agents-examples.json** - Ejemplos de agentes
- **docs/onboarding-flows.json** - Flujos de configuración

---

## 🎯 Resumen de 15 Minutos

1. ✅ **Supabase**: Crear proyecto + ejecutar SQL (5 min)
2. ✅ **Compilar**: tsc orchestrator-agent.ts (3 min)
3. ✅ **n8n Config**: Editar ~/.n8n/config (3 min)
4. ✅ **Import Workflow**: Importar + configurar credenciales (2 min)
5. ✅ **Habilitar MCP**: SQL para habilitar Stripe (2 min)

**Total: 15 minutos** → Sistema funcionando ✓

---

## 💬 Soporte

Si algo no funciona:
1. Revisa el troubleshooting arriba
2. Consulta logs de n8n
3. Verifica credenciales en Supabase
4. Lee la documentación completa en README.md

¡Disfruta tu sistema MCP! 🚀
