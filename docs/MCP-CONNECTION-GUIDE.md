# Guía Práctica: Conexión MCP GoHighLevel

**Objetivo**: Conectar tu instancia de Claude Code/n8n con GoHighLevel vía MCP para extraer datos de Real Estate

---

## 📋 Prerequisitos

- [ ] Cuenta activa de GoHighLevel con permisos de administrador
- [ ] Acceso a una Location de GHL (subcuenta)
- [ ] n8n instalado (v1.104 o superior) O Claude Desktop/Cursor
- [ ] Supabase configurado (para almacenamiento de datos)

---

## 🔐 Paso 1: Crear Private Integration Token en GoHighLevel

### 1.1 Acceder a Settings

1. Inicia sesión en tu cuenta de GoHighLevel
2. Ve a **Settings** (Configuración)
3. Busca la sección **Private Integrations**

### 1.2 Crear Nueva Integración

```bash
1. Clic en "Create New Integration"
2. Nombre sugerido: "MCP Real Estate Dashboard"
3. Descripción: "Extracción de datos para KPIs y reportes"
```

### 1.3 Seleccionar Scopes (Permisos)

Para un dashboard de Real Estate completo, selecciona los siguientes scopes:

#### **Lectura de Datos (Read-Only)**
```yaml
Contactos:
  - contacts.readonly
  - contacts.write (opcional, si quieres actualizar)

Oportunidades:
  - opportunities.readonly
  - opportunities.write (opcional)

Conversaciones:
  - conversations.readonly
  - conversations/message.readonly
  - conversations/message.write (para respuestas automáticas)

Calendarios:
  - calendars.readonly
  - calendars.write (para agendar)

Campañas y Marketing:
  - campaigns.readonly
  - forms.readonly

Flujos de Trabajo:
  - workflows.readonly

Ubicaciones:
  - locations.readonly

Usuarios:
  - users.readonly

Analytics:
  - reporting.readonly
```

### 1.4 Guardar Token

```bash
⚠️ IMPORTANTE: Copia el token inmediatamente
El token solo se muestra UNA VEZ
```

**Formato del token**:
```
ghl_private_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.5 Obtener Location ID

Tu Location ID es necesario para muchas peticiones. Lo puedes encontrar:

1. En la URL de tu dashboard de GHL:
   ```
   https://app.gohighlevel.com/v2/location/LOCATION_ID/dashboard
   ```

2. O consultando la API:
   ```bash
   curl -X GET "https://services.leadconnectorhq.com/locations/" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🔌 Paso 2: Configurar MCP en tu Entorno

### Opción A: Configurar en n8n

#### 2.1 Añadir Nodo MCP Client

1. Abre n8n workflow editor
2. Añade un nuevo nodo: **MCP Client** (disponible desde v1.104)
3. Configura la conexión:

```json
{
  "mcpUrl": "https://services.leadconnectorhq.com/mcp/",
  "transport": "HTTP Streamable",
  "authentication": {
    "type": "Bearer Token",
    "token": "ghl_private_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  },
  "headers": {
    "locationId": "YOUR_LOCATION_ID",
    "version": "2021-07-28"
  }
}
```

#### 2.2 Workflow de Prueba

Crea este workflow simple para probar la conexión:

```javascript
// Nodo 1: Schedule Trigger (manual o cada hora)
// Nodo 2: MCP Client - GHL
{
  "command": "Get contacts",
  "parameters": {
    "limit": 10,
    "order": "desc"
  }
}

// Nodo 3: Code Node - Procesar Respuesta
const contacts = $input.all();
return contacts.map(contact => ({
  id: contact.json.id,
  name: contact.json.name,
  email: contact.json.email,
  phone: contact.json.phone,
  tags: contact.json.tags,
  createdAt: contact.json.dateAdded
}));

// Nodo 4: Supabase - Insert
// Inserta en tabla 'contacts'
```

### Opción B: Configurar en Claude Desktop

Edita tu archivo de configuración de MCP:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gohighlevel": {
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer ghl_private_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "locationId": "YOUR_LOCATION_ID"
      }
    }
  }
}
```

Reinicia Claude Desktop y verifica la conexión:

```
Prompt: "List my MCP servers"
Respuesta esperada: Debería mostrar "gohighlevel" como servidor conectado
```

### Opción C: Configurar en Cursor

Edita `.cursor/mcp.json` en la raíz de tu proyecto:

```json
{
  "mcpServers": {
    "gohighlevel": {
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer ghl_private_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "locationId": "YOUR_LOCATION_ID"
      }
    }
  }
}
```

---

## 🧪 Paso 3: Probar la Conexión

### Test 1: Obtener Lista de Contactos

**En Claude/Cursor**:
```
"Using the GoHighLevel MCP server, get the last 5 contacts created"
```

**En n8n** (usando MCP Client node):
```json
{
  "resource": "contacts",
  "operation": "getAll",
  "limit": 5,
  "sort": {
    "field": "dateAdded",
    "direction": "desc"
  }
}
```

**Respuesta esperada**:
```json
{
  "contacts": [
    {
      "id": "contact_123",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+52 1234567890",
      "tags": ["interesado", "tulum"],
      "dateAdded": "2025-10-30T10:30:00Z"
    },
    // ... 4 más
  ]
}
```

### Test 2: Obtener Oportunidades Activas

**En Claude/Cursor**:
```
"Get all opportunities in the 'Visita Agendada' stage with value greater than $500,000"
```

**En n8n**:
```json
{
  "resource": "opportunities",
  "operation": "getAll",
  "filters": {
    "status": "open",
    "stage": "Visita Agendada",
    "monetary_value": {
      "$gte": 500000
    }
  }
}
```

### Test 3: Obtener Conversaciones Recientes

**En Claude/Cursor**:
```
"Get all conversations from the last 24 hours and analyze sentiment"
```

---

## 📊 Paso 4: Crear Flujo de Extracción de Datos

### 4.1 Workflow: Sincronización Diaria de Contactos

```javascript
// WORKFLOW NAME: "GHL - Daily Contact Sync"

// NODE 1: Schedule Trigger
{
  "cron": "0 8 * * *",  // Diario a las 8 AM
  "timezone": "America/Mexico_City"
}

// NODE 2: MCP Client - Get New Contacts
{
  "server": "gohighlevel",
  "command": "Get contacts",
  "filters": {
    "dateAdded": {
      "$gte": "{{$now.minus({days: 1}).toISO()}}"
    }
  }
}

// NODE 3: OpenAI - Enrich Contact Data
{
  "model": "gpt-4",
  "prompt": `Analiza este contacto y extrae:
  - Intención de compra (1-10)
  - Presupuesto estimado
  - Tipo de propiedad de interés
  - Urgencia (baja/media/alta)

  Contacto: {{$json.name}}
  Tags: {{$json.tags}}
  Última conversación: {{$json.lastMessage}}`
}

// NODE 4: Supabase - Upsert Contact
{
  "operation": "upsert",
  "table": "contacts",
  "data": {
    "ghl_id": "{{$json.id}}",
    "name": "{{$json.name}}",
    "email": "{{$json.email}}",
    "phone": "{{$json.phone}}",
    "tags": "{{$json.tags}}",
    "purchase_intent": "{{$node['OpenAI'].json.purchase_intent}}",
    "estimated_budget": "{{$node['OpenAI'].json.estimated_budget}}",
    "property_type": "{{$node['OpenAI'].json.property_type}}",
    "urgency": "{{$node['OpenAI'].json.urgency}}",
    "synced_at": "{{$now.toISO()}}"
  },
  "onConflict": "ghl_id"
}

// NODE 5: Slack Notification (opcional)
{
  "channel": "#sales-updates",
  "message": "✅ Sincronizados {{$node['MCP Client'].json.length}} contactos nuevos de GHL"
}
```

### 4.2 Workflow: Extracción de Oportunidades para Dashboard

```javascript
// WORKFLOW NAME: "GHL - Opportunities KPI Calculator"

// NODE 1: Schedule Trigger
{
  "cron": "0 */4 * * *",  // Cada 4 horas
  "timezone": "America/Mexico_City"
}

// NODE 2: MCP Client - Get All Open Opportunities
{
  "server": "gohighlevel",
  "command": "Get opportunities",
  "filters": {
    "status": "open"
  }
}

// NODE 3: Function - Calculate KPIs
const opportunities = $input.all();

const kpis = {
  totalOpportunities: opportunities.length,

  byStage: opportunities.reduce((acc, opp) => {
    const stage = opp.json.pipeline.stage;
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {}),

  totalValue: opportunities.reduce((sum, opp) =>
    sum + (opp.json.monetary_value || 0), 0
  ),

  avgValue: opportunities.reduce((sum, opp) =>
    sum + (opp.json.monetary_value || 0), 0
  ) / opportunities.length,

  avgDaysInPipeline: opportunities.reduce((sum, opp) => {
    const created = new Date(opp.json.dateAdded);
    const now = new Date();
    const days = (now - created) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0) / opportunities.length,

  calculatedAt: new Date().toISOString()
};

return [{ json: kpis }];

// NODE 4: Supabase - Insert KPI Snapshot
{
  "operation": "insert",
  "table": "pipeline_kpis_snapshots",
  "data": "{{$json}}"
}
```

---

## 🗄️ Paso 5: Configurar Base de Datos en Supabase

### 5.1 Crear Tablas

Ejecuta este script SQL en Supabase SQL Editor:

```sql
-- Tabla de Contactos
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  tags TEXT[],
  purchase_intent INTEGER CHECK (purchase_intent BETWEEN 1 AND 10),
  estimated_budget DECIMAL(12,2),
  property_type VARCHAR(100),
  urgency VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Tabla de Oportunidades
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_id VARCHAR(255) UNIQUE NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  name VARCHAR(255),
  stage VARCHAR(100),
  status VARCHAR(50),
  monetary_value DECIMAL(12,2),
  pipeline_id VARCHAR(255),
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Tabla de Conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_id VARCHAR(255) UNIQUE NOT NULL,
  contact_id UUID REFERENCES contacts(id),
  last_message TEXT,
  last_message_date TIMESTAMP,
  unread_count INTEGER DEFAULT 0,
  sentiment VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Tabla de Snapshots de KPIs
CREATE TABLE pipeline_kpis_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_opportunities INTEGER,
  by_stage JSONB,
  total_value DECIMAL(12,2),
  avg_value DECIMAL(12,2),
  avg_days_in_pipeline DECIMAL(5,2),
  calculated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_contacts_ghl_id ON contacts(ghl_id);
CREATE INDEX idx_contacts_synced_at ON contacts(synced_at);
CREATE INDEX idx_opportunities_ghl_id ON opportunities(ghl_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_pipeline_kpis_calculated_at ON pipeline_kpis_snapshots(calculated_at DESC);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Crear Vistas Materializadas para KPIs

```sql
-- Vista: KPIs de Conversión
CREATE MATERIALIZED VIEW mv_conversion_kpis AS
SELECT
  DATE_TRUNC('day', o.created_at) as date,
  COUNT(*) as opportunities_created,
  COUNT(CASE WHEN o.status = 'won' THEN 1 END) as opportunities_won,
  COUNT(CASE WHEN o.status = 'lost' THEN 1 END) as opportunities_lost,
  ROUND(
    COUNT(CASE WHEN o.status = 'won' THEN 1 END)::DECIMAL /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as conversion_rate,
  SUM(CASE WHEN o.status = 'won' THEN o.monetary_value ELSE 0 END) as revenue_won
FROM opportunities o
WHERE o.created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', o.created_at)
ORDER BY date DESC;

-- Índice para la vista materializada
CREATE UNIQUE INDEX ON mv_conversion_kpis (date);

-- Función para refrescar la vista (ejecutar cada hora)
CREATE OR REPLACE FUNCTION refresh_conversion_kpis()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_kpis;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Paso 6: Crear API para el Dashboard

### 6.1 Endpoints de Supabase Edge Functions

Crea estos endpoints en Supabase Edge Functions:

#### Endpoint: `/kpis/conversion`

```typescript
// supabase/functions/kpis-conversion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const { data, error } = await supabase
    .from('mv_conversion_kpis')
    .select('*')
    .order('date', { ascending: false })
    .limit(30)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### Endpoint: `/kpis/pipeline`

```typescript
// supabase/functions/kpis-pipeline/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  // Obtener último snapshot
  const { data, error } = await supabase
    .from('pipeline_kpis_snapshots')
    .select('*')
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## ✅ Checklist de Verificación

### Conexión MCP
- [ ] Token de GHL creado y guardado
- [ ] Location ID obtenido
- [ ] MCP configurado en n8n/Claude/Cursor
- [ ] Prueba de conexión exitosa

### Extracción de Datos
- [ ] Workflow de contactos funcionando
- [ ] Workflow de oportunidades funcionando
- [ ] Datos guardándose en Supabase correctamente

### Base de Datos
- [ ] Tablas creadas en Supabase
- [ ] Vistas materializadas creadas
- [ ] Índices configurados
- [ ] Triggers funcionando

### API
- [ ] Edge Functions desplegadas
- [ ] Endpoints respondiendo correctamente
- [ ] CORS configurado

---

## 🚀 Próximos Pasos

Una vez completada esta guía, estarás listo para:

1. **Desarrollar el Dashboard** - Conectar Next.js a los endpoints de Supabase
2. **Implementar Visualizaciones** - Gráficos de KPIs en tiempo real
3. **Crear Alertas Automáticas** - Notificaciones basadas en eventos
4. **Expandir a Otros Verticales** - Replicar el modelo para Arquitectos, Constructoras, etc.

---

**Elaborado por**: Claude + Roger García Vital
**Última actualización**: 2025-10-30
**Versión**: 1.0
