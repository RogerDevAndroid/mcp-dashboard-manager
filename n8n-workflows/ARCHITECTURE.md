# Arquitectura: N8N MCP Orchestrator

Este documento describe la arquitectura completa del sistema de orquestación MCP con n8n.

## 📐 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend/Backend)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Next.js App │  │  React Hook  │  │  API Route   │              │
│  │              │  │ useMCPClient │  │              │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┴──────────────────┘                       │
│                           │                                          │
│                           │ HTTP POST                                │
│                           ▼                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            │ {action, params, userId}
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│                        N8N WORKFLOW                                  │
│  ┌────────────────────────────────────────────────────────┐         │
│  │                  Webhook Trigger                        │         │
│  │         POST /webhook/ghl-orchestrator                  │         │
│  └─────────────────────────┬──────────────────────────────┘         │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │            Parse & Validate Request                     │         │
│  │  • Valida acción contra whitelist                       │         │
│  │  • Extrae y sanitiza parámetros                         │         │
│  │  • Genera requestId único                               │         │
│  └─────────────────────────┬──────────────────────────────┘         │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │              Route by Action Type                       │         │
│  │         (Switch basado en tipo de acción)               │         │
│  └─┬────────┬─────────┬────────────┬────────────┬─────────┘         │
│    │        │         │            │            │                   │
│    ▼        ▼         ▼            ▼            ▼                   │
│  Contacts Opps    Calendar    Broker Sync   Custom                 │
│    │        │         │            │            │                   │
└────┼────────┼─────────┼────────────┼────────────┼───────────────────┘
     │        │         │            │            │
     │        │         │            │            │
┌────▼────────▼─────────▼────────────▼────────────▼───────────────────┐
│                    GOHIGHLEVEL API                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Contacts   │  │Opportunities │  │   Calendar   │              │
│  │      API     │  │     API      │  │     API      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         └─────────────────┴──────────────────┘                       │
│                           │                                          │
│                           │ Response                                 │
│                           ▼                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼──────────────────────────────────────────┐
│                    N8N WORKFLOW (cont.)                              │
│  ┌────────────────────────────────────────────────────────┐         │
│  │             Format MCP Response                         │         │
│  │  • Estructura respuesta en formato MCP                  │         │
│  │  • Agrega metadata (count, time, etc)                   │         │
│  │  • Genera estadísticas                                  │         │
│  └─────────────────────────┬──────────────────────────────┘         │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │           Log Request to Supabase                       │         │
│  │  • Guarda request completo                              │         │
│  │  • Registra timing y metadata                           │         │
│  │  • Permite analytics posteriores                        │         │
│  └─────────────────────────┬──────────────────────────────┘         │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │             Return Response                             │         │
│  │         (Respond to Webhook)                            │         │
│  └─────────────────────────┬──────────────────────────────┘         │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ MCPResponse<T>
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                                │
│  ┌────────────────────────────────────────────────────────┐         │
│  │              Tabla: mcp_requests                        │         │
│  │  • request_id (PK)                                      │         │
│  │  • user_id                                              │         │
│  │  • action                                               │         │
│  │  • status (completed/failed)                            │         │
│  │  • response_data (JSONB)                                │         │
│  │  • processing_time_ms                                   │         │
│  │  • created_at                                           │         │
│  └────────────────────────────────────────────────────────┘         │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────┐         │
│  │         Analytics & Reporting Views                     │         │
│  │  • vw_requests_by_action                                │         │
│  │  • vw_requests_by_user                                  │         │
│  │  • vw_performance_metrics                               │         │
│  └────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos Detallado

### 1. Request Phase

```typescript
// Cliente envía request
{
  action: 'list_contacts',
  params: { limit: 50 },
  userId: 'broker_omar'
}
```

↓

### 2. Validation Phase

```javascript
// n8n: Parse & Validate Request
const validActions = [
  'list_contacts', 'get_contact', 'create_contact',
  'list_opportunities', 'get_opportunity',
  'list_calendar_events', 'sync_broker_data'
];

if (!validActions.includes(request.action)) {
  throw new Error('Invalid action');
}

request.requestId = `req_${Date.now()}_${randomId()}`;
```

↓

### 3. Routing Phase

```javascript
// n8n: Route by Action Type
if (action.includes('contact')) {
  → GHL Contacts API
} else if (action.includes('opportunit')) {
  → GHL Opportunities API
} else if (action.includes('calendar')) {
  → GHL Calendar API
} else if (action === 'sync_broker_data') {
  → Dashboard Sync Endpoint
}
```

↓

### 4. GHL API Call

```http
GET https://services.leadconnectorhq.com/contacts/
  ?locationId={LOCATION_ID}
  &limit=50
Headers:
  Authorization: Bearer {GHL_TOKEN}
  version: 2021-07-28
```

↓

### 5. Response Formatting

```javascript
// n8n: Format MCP Response
{
  success: true,
  action: 'list_contacts',
  requestId: 'req_1706659200000_abc123',
  timestamp: '2025-01-30T12:00:00.000Z',
  data: [...contacts],
  metadata: {
    count: 50,
    source: 'gohighlevel',
    processingTime: 234,
    userId: 'broker_omar'
  }
}
```

↓

### 6. Logging to Supabase

```sql
INSERT INTO mcp_requests (
  request_id,
  user_id,
  action,
  status,
  response_data,
  processing_time_ms
) VALUES (
  'req_1706659200000_abc123',
  'broker_omar',
  'list_contacts',
  'completed',
  '{"success": true, ...}',
  234
);
```

↓

### 7. Return to Client

```typescript
// Cliente recibe respuesta tipada
const response: MCPResponse<GHLContact[]> = await client.listContacts({
  limit: 50
});

console.log(response.data); // Array de contactos
```

## 🎯 Componentes Principales

### 1. N8N Workflow Nodes

| Nodo | Función | Timeout |
|------|---------|---------|
| **Webhook Trigger** | Recibe HTTP POST requests | - |
| **Parse & Validate** | Valida y sanitiza input | 5s |
| **Route by Action** | Enruta según tipo de acción | - |
| **GHL - List Contacts** | Llama a GHL Contacts API | 30s |
| **GHL - List Opportunities** | Llama a GHL Opportunities API | 30s |
| **GHL - List Calendar** | Llama a GHL Calendar API | 30s |
| **Format MCP Response** | Estructura respuesta estándar | 5s |
| **Log to Supabase** | Persiste request en DB | 10s |
| **Return Response** | Responde al webhook | - |
| **Error Handler** | Maneja y formatea errores | 5s |

### 2. Credenciales Requeridas

```yaml
GHL API Token:
  Type: HTTP Header Auth
  Header: Authorization
  Value: Bearer {token}

Supabase API Key:
  Type: HTTP Header Auth
  Header: apikey
  Value: {service_role_key}
```

### 3. Variables de Entorno

```bash
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=your_location_id
SUPABASE_URL=https://your-project.supabase.co
```

## 🔐 Seguridad

### Autenticación

```
Cliente → n8n: Ninguna (webhook público)
n8n → GHL: Bearer Token (Private Integration)
n8n → Supabase: API Key (Service Role)
```

**Recomendación**: Agregar autenticación al webhook para producción:

```javascript
// n8n: Validar API Key
const apiKey = $headers['x-api-key'];
if (apiKey !== process.env.EXPECTED_API_KEY) {
  throw new Error('Unauthorized');
}
```

### Rate Limiting

Implementar rate limiting por usuario:

```javascript
// Ejemplo de rate limiting en n8n
const userId = $json.userId;
const requestsInLastMinute = await checkRedis(userId);

if (requestsInLastMinute > 60) {
  throw new Error('Rate limit exceeded');
}
```

## 📊 Monitoreo y Observabilidad

### Métricas Clave

1. **Request Volume**
   - Requests por minuto
   - Requests por acción
   - Requests por usuario

2. **Performance**
   - Tiempo promedio de respuesta
   - P50, P95, P99 latency
   - Timeout rate

3. **Errors**
   - Error rate por acción
   - Tipos de errores más comunes
   - GHL API errors

### Queries de Analytics

```sql
-- Requests por hora (últimas 24h)
SELECT
  date_trunc('hour', created_at) as hour,
  COUNT(*) as requests,
  AVG(processing_time_ms) as avg_time
FROM mcp_requests
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Top acciones
SELECT
  action,
  COUNT(*) as count,
  AVG(processing_time_ms) as avg_time,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failures
FROM mcp_requests
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY action
ORDER BY count DESC;

-- Top usuarios
SELECT
  user_id,
  COUNT(*) as requests,
  COUNT(DISTINCT action) as unique_actions
FROM mcp_requests
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY requests DESC
LIMIT 10;
```

## 🚀 Optimizaciones

### 1. Caché de Respuestas

```javascript
// Implementar caché en n8n con Redis
const cacheKey = `mcp:${action}:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

// ... hacer request a GHL ...

await redis.setex(cacheKey, 300, JSON.stringify(response)); // 5 min TTL
```

### 2. Batch Processing

```javascript
// Procesar múltiples requests en paralelo
const promises = contactIds.map(id =>
  fetch(`${GHL_API}/contacts/${id}`)
);

const results = await Promise.all(promises);
```

### 3. Webhook Subscriptions

En lugar de polling, usar webhooks de GHL:

```
GHL → n8n webhook → Supabase update → Frontend notification
```

## 🔧 Troubleshooting

### Problema: Timeout en GHL API

**Solución**:
1. Aumentar timeout en nodo HTTP Request
2. Implementar retry logic con backoff exponencial
3. Agregar circuit breaker

### Problema: Requests duplicados

**Solución**:
1. Agregar idempotency key
2. Validar `request_id` en Supabase antes de procesar
3. Implementar deduplicación window

### Problema: Memoria alta en n8n

**Solución**:
1. Limitar tamaño de response data
2. Usar streaming para datasets grandes
3. Purgar execution history regularmente

## 📚 Referencias

- [N8N Docs](https://docs.n8n.io/)
- [GoHighLevel API](https://highlevel.stoplight.io/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Supabase Docs](https://supabase.com/docs)

---

**Última actualización**: 2025-01-30
