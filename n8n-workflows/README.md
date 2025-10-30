# N8N Workflow: GHL MCP Orchestrator Agent

Este workflow implementa un agente orquestador MCP (Model Context Protocol) que procesa solicitudes a GoHighLevel API de manera estandarizada.

## 📋 Descripción

El workflow actúa como intermediario inteligente entre clientes (aplicaciones, otros workflows, webhooks) y la API de GoHighLevel, proporcionando:

- ✅ **Validación de solicitudes** - Verifica acciones y parámetros
- 🔄 **Enrutamiento inteligente** - Dirige a los endpoints correctos de GHL
- 📊 **Formato MCP estándar** - Respuestas consistentes y estructuradas
- 📝 **Logging automático** - Registra todas las requests en Supabase
- 🛡️ **Manejo de errores** - Captura y formatea errores de manera consistente

## 🏗️ Arquitectura del Workflow

```
┌─────────────┐
│   Webhook   │ ◄─── POST /ghl-orchestrator
│   Trigger   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Parse & Validate    │ ◄─── Valida acción y params
│ Request             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Route by Action     │ ◄─── Enrutamiento por tipo
│ Type                │
└──┬────┬────┬────┬───┘
   │    │    │    │
   │    │    │    └──► Sync Broker Data
   │    │    └───────► Calendar Events
   │    └────────────► Opportunities
   └─────────────────► Contacts
                       │
                       ▼
              ┌────────────────┐
              │ Format MCP     │
              │ Response       │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Log to         │
              │ Supabase       │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Return         │
              │ Response       │
              └────────────────┘
```

## 🚀 Setup Instructions

### 1. Importar el Workflow en n8n

1. Abre n8n (http://localhost:5678 o tu instancia cloud)
2. Click en **Workflows** > **Import from File**
3. Selecciona `ghl-mcp-orchestrator.json`
4. Click **Import**

### 2. Configurar Credenciales

#### A. GoHighLevel API Token

1. En n8n, ve a **Credentials** > **New**
2. Selecciona **HTTP Header Auth**
3. Nombre: `GHL API Token`
4. Configurar:
   - Header Name: `Authorization`
   - Value: `Bearer YOUR_GHL_PRIVATE_TOKEN`

#### B. Supabase API Key

1. En n8n, ve a **Credentials** > **New**
2. Selecciona **HTTP Header Auth**
3. Nombre: `Supabase API Key`
4. Configurar:
   - Header Name: `apikey`
   - Value: `YOUR_SUPABASE_SERVICE_KEY`

### 3. Configurar Variables de Entorno

En n8n, ve a **Settings** > **Environment Variables** y agrega:

```bash
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=your_location_id_here
SUPABASE_URL=https://your-project.supabase.co
```

### 4. Crear Tabla de Logs en Supabase

Ejecuta este SQL en Supabase:

```sql
-- Tabla para logging de requests MCP
CREATE TABLE IF NOT EXISTS mcp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'gohighlevel',
  status TEXT NOT NULL, -- 'completed', 'failed', 'pending'
  response_data JSONB,
  error_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_mcp_requests_user_id ON mcp_requests(user_id);
CREATE INDEX idx_mcp_requests_action ON mcp_requests(action);
CREATE INDEX idx_mcp_requests_created_at ON mcp_requests(created_at DESC);
CREATE INDEX idx_mcp_requests_status ON mcp_requests(status);

-- RLS (Row Level Security)
ALTER TABLE mcp_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propias requests
CREATE POLICY "Users can view own requests"
  ON mcp_requests FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role puede hacer todo
CREATE POLICY "Service role can do everything"
  ON mcp_requests
  USING (auth.role() = 'service_role');
```

### 5. Activar el Workflow

1. En n8n, abre el workflow importado
2. Click en **Activate** (toggle en la esquina superior derecha)
3. Copia la URL del webhook (aparecerá en el nodo "Webhook Trigger")

Ejemplo de URL: `https://your-n8n.com/webhook/ghl-orchestrator`

## 📡 Uso del API

### Acciones Disponibles

#### 1. List Contacts

```bash
curl -X POST https://your-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list_contacts",
    "userId": "user_123",
    "params": {
      "limit": 50
    }
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "action": "list_contacts",
  "requestId": "req_1706659200000_abc123",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "data": [
    {
      "id": "contact_1",
      "contactName": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+52 999 123 4567",
      "tags": ["caliente"],
      "dateAdded": "2025-01-25T10:00:00.000Z"
    }
  ],
  "metadata": {
    "count": 1,
    "source": "gohighlevel",
    "processingTime": 234,
    "userId": "user_123"
  }
}
```

#### 2. List Opportunities

```bash
curl -X POST https://your-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list_opportunities",
    "userId": "broker_omar",
    "params": {
      "limit": 25
    }
  }'
```

#### 3. List Calendar Events

```bash
curl -X POST https://your-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list_calendar_events",
    "userId": "broker_pablo",
    "params": {
      "brokerId": "JWkZYNaQyKuRfPEnBeiC",
      "limit": 10
    }
  }'
```

#### 4. Sync Broker Data

```bash
curl -X POST https://your-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sync_broker_data",
    "userId": "admin",
    "params": {
      "brokerId": "TKzZQuHjdRG9x4tpwpRx",
      "syncType": "full"
    }
  }'
```

### Manejo de Errores

Si ocurre un error, la respuesta será:

```json
{
  "success": false,
  "action": "list_contacts",
  "requestId": "req_1706659200000_xyz789",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "error": {
    "message": "Invalid action: invalid_action. Valid actions: list_contacts, get_contact, ...",
    "code": "INVALID_ACTION",
    "details": {}
  },
  "metadata": {
    "userId": "user_123",
    "source": "gohighlevel"
  }
}
```

## 🔗 Integración con MCP

Para integrar este workflow con tu MCP Dashboard Manager:

### Opción 1: Llamar desde el Orchestrator Agent

Edita `agents/orchestrator-agent.ts`:

```typescript
// Agregar al final de la función handleToolCall
case 'ghl_list_contacts':
  const response = await fetch('https://your-n8n.com/webhook/ghl-orchestrator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'list_contacts',
      userId: this.userId,
      params: args
    })
  });

  const data = await response.json();

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(data, null, 2)
    }]
  };
```

### Opción 2: Agregar como MCP Server

Edita `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Pipedream MCP": {
      "url": "https://mcp.pipedream.net/v2",
      "headers": {}
    },
    "GHL Orchestrator": {
      "url": "https://your-n8n.com/webhook/ghl-orchestrator",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

## 📊 Monitoreo y Analytics

### Ver Logs en Supabase

```sql
-- Últimas 10 requests
SELECT
  request_id,
  user_id,
  action,
  status,
  processing_time_ms,
  created_at
FROM mcp_requests
ORDER BY created_at DESC
LIMIT 10;

-- Requests por usuario
SELECT
  user_id,
  COUNT(*) as total_requests,
  AVG(processing_time_ms) as avg_time,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM mcp_requests
GROUP BY user_id;

-- Acciones más usadas
SELECT
  action,
  COUNT(*) as count,
  AVG(processing_time_ms) as avg_processing_time
FROM mcp_requests
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action
ORDER BY count DESC;
```

## 🧪 Testing

### Test Manual con curl

```bash
# Test básico
curl -X POST http://localhost:5678/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"list_contacts","userId":"test"}' | jq

# Test de error (acción inválida)
curl -X POST http://localhost:5678/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"invalid_action","userId":"test"}' | jq
```

### Test desde Node.js

```javascript
const testMCPOrchestrator = async () => {
  const response = await fetch('https://your-n8n.com/webhook/ghl-orchestrator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'list_contacts',
      userId: 'test_user',
      params: { limit: 5 }
    })
  });

  const data = await response.json();
  console.log('MCP Response:', data);
};

testMCPOrchestrator();
```

## 🚦 Próximos Pasos

1. **Expandir Acciones**: Agregar más endpoints de GHL (create_contact, update_opportunity, etc.)
2. **Caché**: Implementar caché de respuestas para reducir llamadas a GHL API
3. **Rate Limiting**: Agregar límites de rate por usuario
4. **Webhooks Inversos**: Configurar webhooks de GHL para updates en tiempo real
5. **Enriquecimiento con AI**: Integrar OpenAI para análisis de leads

## 📚 Recursos

- [GoHighLevel API Docs](https://highlevel.stoplight.io/docs/integrations/)
- [N8N Documentation](https://docs.n8n.io/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contribuir

Si encuentras bugs o tienes mejoras, por favor:
1. Abre un issue describiendo el problema
2. Haz un fork del workflow
3. Implementa la mejora
4. Exporta el workflow actualizado
5. Envía un PR con el JSON actualizado

---

**Creado por**: RogerVibes
**Versión**: 1.0.0
**Última actualización**: 2025-01-30
