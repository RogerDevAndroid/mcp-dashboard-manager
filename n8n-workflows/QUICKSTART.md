# 🚀 Inicio Rápido: N8N MCP Orchestrator

¿Quieres tener el workflow funcionando en **15 minutos**? Sigue estos pasos.

## ✅ Checklist Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de n8n (cloud o local)
- [ ] GoHighLevel Private Integration Token
- [ ] Proyecto de Supabase creado
- [ ] Node.js 18+ instalado

## 📝 Paso a Paso Rápido

### 1️⃣ Configurar n8n (5 min)

**Si usas n8n cloud:**
```bash
# 1. Ve a https://n8n.cloud/
# 2. Crea cuenta gratuita
# 3. Espera a que se cree tu instancia
# 4. Anota tu URL
```

**Si usas n8n local:**
```bash
npx n8n
# Abre http://localhost:5678
```

### 2️⃣ Importar Workflow (2 min)

1. En n8n, click **Workflows** → **Import from File**
2. Selecciona `n8n-workflows/ghl-mcp-orchestrator.json`
3. Click **Import**

### 3️⃣ Configurar Credenciales (3 min)

**GHL Token:**
1. Click en cualquier nodo de GHL
2. **Create New** credential → **HTTP Header Auth**
3. Name: `Authorization`
4. Value: `Bearer TU_TOKEN_DE_GHL`
5. Save

**Supabase Key:**
1. Click en nodo "Log to Supabase"
2. **Create New** credential → **HTTP Header Auth**
3. Name: `apikey`
4. Value: `TU_SUPABASE_SERVICE_KEY`
5. Save

### 4️⃣ Configurar Variables (2 min)

En n8n **Settings** → **Environment Variables**:

```
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=tu_location_id
SUPABASE_URL=https://tu-proyecto.supabase.co
```

### 5️⃣ Crear Tabla en Supabase (1 min)

En Supabase **SQL Editor**, ejecuta:

```sql
CREATE TABLE mcp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'gohighlevel',
  status TEXT NOT NULL,
  response_data JSONB,
  error_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6️⃣ Activar y Probar (2 min)

1. En n8n, activa el workflow (toggle verde arriba a la derecha)
2. Copia la **Production URL** del webhook
3. Prueba con curl:

```bash
curl -X POST https://tu-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"list_contacts","userId":"test","params":{"limit":5}}'
```

## ✅ Si todo funcionó...

Deberías recibir una respuesta como:

```json
{
  "success": true,
  "action": "list_contacts",
  "requestId": "req_...",
  "data": [...],
  "metadata": {
    "count": 5,
    "processingTime": 234
  }
}
```

## 🎯 Próximos Pasos

### Integrar con tu App

**1. Agrega a tu `.env.local`:**
```bash
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/ghl-orchestrator
```

**2. Instala el cliente:**
```bash
# Ya está incluido en lib/n8n-mcp-client.ts
```

**3. Úsalo en tu código:**
```typescript
import { createMCPClient } from '@/lib/n8n-mcp-client';

const client = createMCPClient();
const contacts = await client.listContacts({ limit: 10 });
```

### Probar con el Script Incluido

```bash
cd /Users/rgarciavital/Documents/SoftvibesLab/mcpvibes/mcp-dashboard-manager

# Agrega N8N_WEBHOOK_URL a .env.local
echo "N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/ghl-orchestrator" >> .env.local

# Ejecuta los tests
node scripts/test-n8n-integration.js
```

## 🐛 Problemas Comunes

### ❌ "Credential not found"
**Solución**: Guarda las credenciales y asígnalas a TODOS los nodos que las necesitan.

### ❌ "401 Unauthorized"
**Solución**: Verifica que tu token de GHL incluya `Bearer ` al inicio.

### ❌ "Webhook not found"
**Solución**: Asegúrate de que el workflow esté **Active** (toggle verde).

### ❌ "Table does not exist"
**Solución**: Ejecuta el SQL en Supabase para crear la tabla `mcp_requests`.

## 📚 Documentación Completa

- [README.md](README.md) - Documentación completa del API
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Guía detallada paso a paso
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
- [examples/n8n-mcp-usage.ts](../examples/n8n-mcp-usage.ts) - Ejemplos de código

## 💬 Soporte

¿Tienes problemas?
1. Revisa los logs en n8n → **Executions**
2. Verifica la tabla en Supabase → **Table Editor** → `mcp_requests`
3. Ejecuta el script de test: `node scripts/test-n8n-integration.js`

---

**¡Listo!** 🎉 Ahora tienes un orquestador MCP funcionando con n8n y GoHighLevel.
