# Guía Rápida de Setup: N8N + MCP + GoHighLevel

Esta guía te llevará paso a paso desde cero hasta tener el workflow funcionando.

## 📦 Prerequisitos

Antes de comenzar, necesitas tener:

- ✅ Cuenta de n8n (cloud o self-hosted)
- ✅ GoHighLevel Private Integration Token
- ✅ Cuenta de Supabase con proyecto creado
- ✅ Node.js 18+ instalado
- ✅ Este repositorio clonado

## 🎯 Paso 1: Instalar n8n

### Opción A: n8n Cloud (Recomendado para comenzar)

1. Ve a [n8n.cloud](https://n8n.cloud/)
2. Crea una cuenta gratuita
3. Espera a que se cree tu instancia
4. Anota tu URL: `https://your-instance.n8n.cloud`

### Opción B: n8n Self-Hosted (Para producción)

```bash
# Con npm
npm install -g n8n

# Iniciar n8n
n8n start

# n8n estará disponible en http://localhost:5678
```

### Opción C: n8n con Docker

```bash
# Crear directorio para data
mkdir ~/.n8n

# Ejecutar n8n
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Ver logs
docker logs -f n8n
```

## 🔑 Paso 2: Obtener Credenciales de GoHighLevel

### 2.1 Crear Private Integration

1. Inicia sesión en [GoHighLevel](https://app.gohighlevel.com/)
2. Ve a **Settings** > **Integrations**
3. Click en **Private Integration**
4. Configura:
   - **Name**: MCP Dashboard Integration
   - **Scopes**: Selecciona todos los necesarios:
     - ✅ `contacts.readonly`
     - ✅ `contacts.write`
     - ✅ `opportunities.readonly`
     - ✅ `opportunities.write`
     - ✅ `calendars.readonly`
     - ✅ `calendars.write`
     - ✅ `users.readonly`
5. Click **Create**
6. **Copia el Private Token** (solo se muestra una vez)

### 2.2 Obtener Location ID

1. En el dashboard de GHL, mira la URL
2. El Location ID está en la URL: `https://app.gohighlevel.com/location/{LOCATION_ID}/...`
3. Copia ese ID

## 🗄️ Paso 3: Configurar Supabase

### 3.1 Obtener Credenciales

1. Ve a tu proyecto en [Supabase](https://app.supabase.com/)
2. Ve a **Settings** > **API**
3. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key** (API Key)

### 3.2 Crear Tabla de Logs

1. En Supabase, ve a **SQL Editor**
2. Click en **New Query**
3. Pega el siguiente SQL:

```sql
-- Tabla para logging de requests MCP
CREATE TABLE IF NOT EXISTS mcp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'gohighlevel',
  status TEXT NOT NULL,
  response_data JSONB,
  error_data JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_mcp_requests_user_id ON mcp_requests(user_id);
CREATE INDEX idx_mcp_requests_action ON mcp_requests(action);
CREATE INDEX idx_mcp_requests_created_at ON mcp_requests(created_at DESC);
CREATE INDEX idx_mcp_requests_status ON mcp_requests(status);

-- Row Level Security
ALTER TABLE mcp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON mcp_requests FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can do everything"
  ON mcp_requests
  USING (auth.role() = 'service_role');
```

4. Click **Run** (o F5)
5. Verifica que se creó: ve a **Table Editor** y deberías ver `mcp_requests`

## ⚙️ Paso 4: Importar y Configurar el Workflow

### 4.1 Importar Workflow

1. Abre n8n (http://localhost:5678 o tu URL cloud)
2. Click en **Workflows** en el sidebar
3. Click en el botón **⋮** (tres puntos) > **Import from File**
4. Selecciona el archivo: `n8n-workflows/ghl-mcp-orchestrator.json`
5. Click **Import**

### 4.2 Configurar Credenciales de GoHighLevel

1. En el workflow, encuentra el nodo **"GHL - List Contacts"**
2. Click en el nodo
3. En el panel derecho, busca **Credential to connect with**
4. Click en **Create New**
5. Selecciona **HTTP Header Auth**
6. Configura:
   - **Credential Name**: `GHL API Token`
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_GHL_PRIVATE_TOKEN_HERE`

   Reemplaza `YOUR_GHL_PRIVATE_TOKEN_HERE` con el token que copiaste en el Paso 2.1

7. Click **Save**
8. **Repite para los otros nodos de GHL**:
   - GHL - List Opportunities
   - GHL - List Calendar Events

### 4.3 Configurar Credenciales de Supabase

1. Encuentra el nodo **"Log Request to Supabase"**
2. Click en el nodo
3. Click en **Create New** credential
4. Selecciona **HTTP Header Auth**
5. Configura:
   - **Credential Name**: `Supabase API Key`
   - **Name**: `apikey`
   - **Value**: Tu Supabase service_role key
6. Agrega otra header:
   - Click en **Add Header**
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
7. Click **Save**

### 4.4 Configurar Variables de Entorno

En n8n:

1. Ve a **Settings** > **Environments**
2. Agrega las siguientes variables:

```
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=tu_location_id_de_paso_2_2
SUPABASE_URL=https://tu-proyecto.supabase.co
```

Si usas n8n self-hosted, puedes definirlas como variables de entorno normales:

```bash
export GHL_API_BASE_URL=https://services.leadconnectorhq.com
export GHL_LOCATION_ID=tu_location_id
export SUPABASE_URL=https://tu-proyecto.supabase.co
```

## ✅ Paso 5: Probar el Workflow

### 5.1 Activar el Workflow

1. En el workflow, busca el toggle **Active** en la esquina superior derecha
2. Actívalo (debe ponerse verde)

### 5.2 Obtener la URL del Webhook

1. Click en el nodo **"Webhook Trigger"**
2. En el panel derecho, verás **Production URL**
3. Copia esa URL (algo como: `https://your-n8n.com/webhook/ghl-orchestrator`)

### 5.3 Hacer una Prueba

Opción A: Con curl

```bash
curl -X POST https://your-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list_contacts",
    "userId": "test_user",
    "params": {
      "limit": 5
    }
  }'
```

Opción B: Con Postman

1. Crea una nueva request POST
2. URL: Tu webhook URL
3. Body (raw JSON):
```json
{
  "action": "list_contacts",
  "userId": "test_user",
  "params": {
    "limit": 5
  }
}
```
4. Click **Send**

Opción C: Con el script de test incluido

```bash
cd /Users/rgarciavital/Documents/SoftvibesLab/mcpvibes/mcp-dashboard-manager

# Crear archivo de test
cat > test-n8n-webhook.js << 'EOF'
const WEBHOOK_URL = 'https://your-n8n.com/webhook/ghl-orchestrator';

async function testWebhook() {
  console.log('🧪 Testing N8N Webhook...\n');

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'list_contacts',
      userId: 'test_user',
      params: { limit: 5 }
    })
  });

  const data = await response.json();
  console.log('✅ Response:', JSON.stringify(data, null, 2));
}

testWebhook();
EOF

# Ejecutar test
node test-n8n-webhook.js
```

### 5.4 Verificar Respuesta

Deberías recibir una respuesta como:

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
      ...
    }
  ],
  "metadata": {
    "count": 5,
    "source": "gohighlevel",
    "processingTime": 234,
    "userId": "test_user"
  }
}
```

### 5.5 Verificar Logs en Supabase

1. Ve a Supabase > **Table Editor** > `mcp_requests`
2. Deberías ver tu request registrada

## 🔧 Paso 6: Integrar con tu Aplicación

### Opción A: Desde el MCP Dashboard

Edita `.env.local`:

```bash
# Agregar al final
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/ghl-orchestrator
```

Crear helper en `lib/n8n-client.ts`:

```typescript
export async function callMCPOrchestrator(
  action: string,
  params: Record<string, any> = {},
  userId: string = 'anonymous'
) {
  const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params, userId })
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.statusText}`);
  }

  return response.json();
}
```

Usar en tus componentes:

```typescript
import { callMCPOrchestrator } from '@/lib/n8n-client';

// En tu componente o API route
const contacts = await callMCPOrchestrator('list_contacts', {
  limit: 50
}, currentUserId);

console.log(contacts.data);
```

### Opción B: Webhook de GHL → n8n

1. En GoHighLevel, ve a **Settings** > **Webhooks**
2. Click **Create Webhook**
3. URL: Tu webhook de n8n
4. Events: Selecciona los eventos que quieres capturar
5. Click **Save**

## 🐛 Troubleshooting

### Error: "Credential not found"

**Solución**: Asegúrate de haber guardado las credenciales y que están asignadas a TODOS los nodos que las necesitan.

### Error: 401 Unauthorized (GHL)

**Solución**:
1. Verifica que tu token de GHL sea correcto
2. Asegúrate de incluir `Bearer ` antes del token
3. Verifica que el token tenga los scopes necesarios

### Error: "relation mcp_requests does not exist"

**Solución**: Ejecuta el SQL del Paso 3.2 para crear la tabla.

### Error: Network timeout

**Solución**:
1. Verifica que n8n esté corriendo
2. Si usas n8n cloud, verifica que el workflow esté activo
3. Revisa los logs de n8n

### El webhook no responde

**Solución**:
1. Verifica que el workflow esté **Active** (toggle verde)
2. Asegúrate de usar la **Production URL**, no la Test URL
3. Revisa las **Executions** en n8n para ver si hay errores

## 📊 Monitoreo

### Ver Ejecuciones en n8n

1. En n8n, ve a **Executions**
2. Verás todas las ejecuciones del workflow
3. Click en una para ver detalles paso a paso

### Analíticas en Supabase

```sql
-- Requests en la última hora
SELECT COUNT(*) as total
FROM mcp_requests
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Tiempo promedio de procesamiento
SELECT AVG(processing_time_ms) as avg_ms
FROM mcp_requests
WHERE status = 'completed';

-- Top usuarios
SELECT user_id, COUNT(*) as requests
FROM mcp_requests
GROUP BY user_id
ORDER BY requests DESC
LIMIT 10;
```

## 🎉 ¡Listo!

Tu workflow MCP Orchestrator está funcionando. Ahora puedes:

1. ✅ Procesar requests a GHL de manera estandarizada
2. ✅ Tener logs de todas las operaciones
3. ✅ Extender el workflow con más acciones
4. ✅ Integrar con otras herramientas

## 📚 Siguiente Pasos

1. Lee el [README.md](README.md) para ver todas las acciones disponibles
2. Personaliza el workflow según tus necesidades
3. Agrega más endpoints de GHL
4. Implementa caché para mejorar performance
5. Configura alertas en caso de errores

---

**¿Necesitas ayuda?** Abre un issue en el repositorio.
