# MCP Dashboard Manager

Sistema completo para gestionar MCP Servers, configurar agentes especializados y orquestar múltiples servicios con IA.

## 🎯 ¿Qué es esto?

El MCP Dashboard Manager es una plataforma que te permite:

1. **Gestionar múltiples MCP Servers** desde un dashboard único
2. **Configurar agentes especializados** para tareas específicas (ventas, soporte, desarrollo, etc.)
3. **Orquestar automáticamente** qué MCPs usar según la tarea
4. **Onboarding guiado** para conectar cada servicio paso a paso
5. **Analytics y usage tracking** de tus MCPs

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     Usuario                              │
│              (Telegram / WhatsApp / Web)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Agente Orquestador                      │
│   • Analiza intención del usuario                       │
│   • Decide qué MCPs/agentes usar                        │
│   • Coordina ejecución                                   │
│   • Consolida resultados                                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┬─────────────┐
       │                  │                  │             │
┌──────▼────────┐  ┌──────▼────────┐  ┌─────▼──────┐  ┌──▼──┐
│ Agente Ventas │  │ Agente Soporte│  │ Agente Dev │  │ ... │
│               │  │               │  │            │  │     │
│ MCPs:         │  │ MCPs:         │  │ MCPs:      │  │     │
│ • GHL         │  │ • Intercom    │  │ • Sentry   │  │     │
│ • Stripe      │  │ • Notion      │  │ • Linear   │  │     │
│ • Linear      │  │ • Supabase RAG│  │ • Socket   │  │     │
└───────────────┘  └───────────────┘  └────────────┘  └─────┘
       │                  │                  │
       └──────────────────┴──────────────────┴─────────────┐
                                                            │
                  ┌─────────────────────────────────────────▼┐
                  │          Supabase Database               │
                  │                                          │
                  │  • MCP Servers (catálogo)                │
                  │  • MCP Configurations (usuario)          │
                  │  • Specialized Agents                    │
                  │  • Usage Logs                            │
                  │  • Onboarding Progress                   │
                  │  • RAG Documents (vectors)               │
                  └──────────────────────────────────────────┘
```

## 📦 Componentes del Sistema

### 1. Base de Datos (Supabase)

**Archivo**: `database/mcp-manager-schema.sql`

Tablas principales:
- `mcp_servers`: Catálogo de 30+ MCPs populares
- `mcp_configurations`: Configuraciones de usuario por MCP
- `mcp_tools`: Herramientas disponibles en cada MCP
- `agent_orchestrator`: Configuración del orquestador
- `specialized_agents`: Agentes especializados (plantillas + instancias)
- `onboarding_steps`: Flujos de onboarding por MCP
- `user_onboarding_progress`: Progreso del usuario
- `mcp_usage_logs`: Analytics de uso

### 2. Agente Orquestador

**Archivo**: `agents/orchestrator-agent.ts`

Funcionalidades:
- Analiza tareas y determina qué MCPs necesita
- Aplica reglas de enrutamiento personalizables
- Ejecuta herramientas en múltiples MCPs
- Consolida resultados
- Aprende patrones de uso

Herramientas disponibles:
```typescript
- orchestrate_task: Ejecuta tarea usando múltiples MCPs
- list_available_mcps: Lista MCPs habilitados
- get_mcp_capabilities: Muestra herramientas de un MCP
- execute_mcp_tool: Ejecuta herramienta específica
- add_routing_rule: Agrega regla de enrutamiento
```

### 3. Agentes Especializados

**Archivo**: `agents/specialized-agents-examples.json`

8 agentes pre-configurados:

1. **Sales Closer** (Ventas)
   - MCPs: GoHighLevel, Stripe, Linear
   - Casos: Lead management, procesamiento de pagos, follow-ups

2. **Customer Support** (Soporte)
   - MCPs: Intercom, Notion, Supabase RAG
   - Casos: Tickets, knowledge base, documentación

3. **Dev Productivity** (Desarrollo)
   - MCPs: Sentry, Linear, Socket
   - Casos: Error monitoring, issue tracking, security

4. **Content Creator** (Marketing)
   - MCPs: Canva, InVideo, Asana
   - Casos: Diseños, videos, gestión de campañas

5. **Project Manager**
   - MCPs: Linear, Asana, Notion
   - Casos: Coordinación, deadlines, reportes

6. **Finance Analyst** (Finanzas)
   - MCPs: Stripe, PayPal, Plaid
   - Casos: Transacciones, análisis, suscripciones

7. **DevOps Engineer**
   - MCPs: Vercel, Netlify, Sentry
   - Casos: Deployments, monitoring, incidents

8. **Data Analyst**
   - MCPs: Airtable, HubSpot, Supabase RAG
   - Casos: Reports, insights, analytics

### 4. Sistema de Onboarding

**Archivo**: `docs/onboarding-flows.json`

Flujos guiados paso a paso para cada MCP:

Tipos de pasos:
- `info`: Información y bienvenida
- `api_key`: Input de API keys
- `oauth`: Autenticación OAuth 2.0
- `input`: Configuración adicional
- `test`: Prueba de conexión
- `completion`: Resumen y próximos pasos

Ejemplo de flujo:
1. Bienvenida → 2. Credenciales → 3. Config → 4. Test → 5. ¡Listo!

### 5. Workflows de n8n

**Archivo**: `workflows/orchestrator-workflow.json`

Workflow principal que:
1. Recibe mensaje del usuario (Telegram/WhatsApp)
2. Carga configuración del orquestador
3. Obtiene MCPs y agentes habilitados
4. Ejecuta el agente orquestador
5. Registra uso en analytics
6. Responde al usuario

## 🚀 Quick Start

### 1. Configurar Base de Datos

```bash
# En Supabase SQL Editor, ejecuta:
database/mcp-manager-schema.sql
```

Esto crea todas las tablas y poblará el catálogo con 30+ MCPs populares.

### 2. Compilar Agente Orquestador

```bash
cd agents
npm install
tsc orchestrator-agent.ts
```

### 3. Configurar en n8n

Edita `~/.n8n/config`:

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": ["/ruta/a/mcp-dashboard/agents/orchestrator-agent.js"],
      "env": {
        "USER_ID": "tu_user_id",
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "tu_key"
      }
    }
  }
}
```

### 4. Importar Workflow

1. Abre n8n
2. Import → `workflows/orchestrator-workflow.json`
3. Configura credenciales
4. Activa el workflow

### 5. Configurar tu Primer MCP

Usa el dashboard o ejecuta:

```sql
-- Habilitar Stripe para tu usuario
INSERT INTO mcp_configurations (user_id, mcp_server_id, enabled, credentials)
SELECT 'tu_user_id', id, true, '{"STRIPE_API_KEY": "sk_test_..."}'
FROM mcp_servers WHERE name = 'stripe';
```

## 📚 Casos de Uso Completos

### Caso 1: Agente de Ventas Completo

**Objetivo**: Automatizar todo el ciclo de ventas desde lead hasta cobro.

**MCPs necesarios**:
- GoHighLevel (CRM)
- Stripe (Pagos)
- Linear (Tasks)
- Supabase RAG (Knowledge)

**Flujo**:
```
Usuario: "Tengo un nuevo lead: Juan Pérez, juan@empresa.com"

Orquestador:
1. Detecta → Tarea de CRM
2. Usa agente especializado "Sales Closer"
3. Ejecuta:
   - GHL: Crear contacto
   - GHL: Agregar a pipeline (stage: new_lead)
   - Linear: Crear tarea "Llamar a Juan mañana"
   - Supabase: Guardar en knowledge base
4. Responde: "✓ Contacto creado en CRM
             ✓ Agregado a pipeline
             ✓ Tarea de seguimiento creada"

Usuario: "Procesa el pago de Juan por $99"

Orquestador:
1. Detecta → Tarea de payment
2. Verifica info del contacto en GHL
3. Stripe: Crear payment intent
4. Confirma con usuario
5. GHL: Mover a stage "closed_won"
6. Linear: Marca tarea como completada
7. Supabase: Registra venta
```

**Configuración del agente**:
```json
{
  "name": "sales-closer",
  "system_prompt": "...",
  "required_mcps": ["gohighlevel", "stripe"],
  "optional_mcps": ["linear", "supabase-rag"],
  "configuration": {
    "pipeline_stage_mapping": {
      "new_lead": "stage_001",
      "qualified": "stage_002",
      "closed_won": "stage_005"
    },
    "payment_confirmation_required": true
  }
}
```

### Caso 2: Soporte al Cliente Inteligente

**Objetivo**: Responder tickets consultando knowledge base.

**MCPs necesarios**:
- Intercom (Tickets)
- Supabase RAG (Knowledge)
- Notion (Docs)
- Linear (Bugs)

**Flujo**:
```
Usuario (ticket): "¿Cómo reseteo mi contraseña?"

Orquestador:
1. Detecta → Pregunta de soporte
2. Usa agente "Customer Support"
3. Ejecuta:
   - Supabase RAG: Buscar "reset password" en docs
   - Encuentra artículo relevante
4. Responde al ticket con solución
5. Marca ticket como resuelto

Usuario (ticket): "El botón de login no funciona"

Orquestador:
1. Detecta keywords: "no funciona" → Posible bug
2. Busca en knowledge base
3. No encuentra solución
4. Linear: Crea bug report
5. Notion: Documenta el issue
6. Responde: "Escalado a equipo técnico, ticket #123"
```

### Caso 3: Developer Workflow Automation

**Objetivo**: Monitorear errores y crear issues automáticamente.

**MCPs necesarios**:
- Sentry (Monitoring)
- Linear (Issues)
- Socket (Security)

**Flujo**:
```
Sentry: Nuevo error "TypeError: Cannot read property 'map'"

Webhook → Orquestador:
1. Recibe alerta de Sentry
2. Analiza severidad → "error" (crítico)
3. Linear: Crea issue automáticamente:
   - Título: TypeError en payment.ts
   - Descripción: Stack trace + contexto
   - Prioridad: Alta
   - Asigna: Backend team
4. Notifica en Telegram

Developer: "Analiza seguridad de axios@1.6.0"

Orquestador:
1. Socket: Escanea paquete
2. Encuentra 2 vulnerabilidades
3. Linear: Crea issue para actualizar
4. Responde con detalles de vulnerabilidades
```

### Caso 4: Content Marketing Pipeline

**Objetivo**: Gestionar creación de contenido end-to-end.

**MCPs necesarios**:
- Asana (Projects)
- Canva (Designs)
- InVideo (Videos)
- Notion (Guidelines)

**Flujo**:
```
PM: "Crea campaña Q1 2024 en Asana"

Orquestador:
1. Asana: Crea proyecto "Q1 2024 Campaign"
2. Asana: Crea secciones:
   - Content Ideas
   - In Production
   - Review
   - Published
3. Notion: Crea página de guidelines
4. Responde con link al proyecto

Creator: "Necesito un post para Instagram sobre producto X"

Orquestador:
1. Supabase RAG: Busca guidelines de marca
2. Notion: Lee info del producto X
3. Canva: Genera diseño con brand colors
4. Asana: Crea tarea "Review post Instagram"
5. Entrega diseño al creator
```

### Caso 5: Financial Operations Automation

**Objetivo**: Gestionar transacciones y generar reportes.

**MCPs necesarios**:
- Stripe (Payments)
- Plaid (Banking)
- Daloopa (Market data)

**Flujo**:
```
Finance Manager: "Reporte de revenue del mes"

Orquestador:
1. Stripe: Obtiene todas las transacciones del mes
2. Calcula métricas:
   - Total revenue
   - MRR (Monthly Recurring Revenue)
   - Refunds
   - Net revenue
3. Plaid: Verifica saldo bancario
4. Genera reporte en formato JSON/CSV
5. Responde con resumen y link

Accountant: "Procesa reembolso de $150 para txn_123"

Orquestador:
1. Stripe: Obtiene info de transacción
2. Verifica que es elegible para refund
3. Confirma con usuario
4. Stripe: Procesa refund
5. Registra en logs
6. Responde: "✓ Reembolso procesado"
```

## 🎨 Personalización

### Crear un Agente Especializado Nuevo

```sql
INSERT INTO specialized_agents (
  name,
  display_name,
  description,
  category,
  system_prompt,
  required_mcps,
  optional_mcps,
  configuration
) VALUES (
  'mi-agente-custom',
  'Mi Agente Personalizado',
  'Hace X cosa específica',
  'custom',
  'Eres un agente experto en...',
  '["gohighlevel", "stripe"]'::jsonb,
  '["notion"]'::jsonb,
  '{
    "setting1": "value1",
    "setting2": true
  }'::jsonb
);
```

### Agregar Reglas de Enrutamiento

```typescript
// El agente orquestador puede aprender patrones
await orchestrator.addRoutingRule({
  condition: "contains:payment",
  mcp_server: "stripe",
  priority: 10
});

await orchestrator.addRoutingRule({
  condition: "contains:contact",
  mcp_server: "gohighlevel",
  priority: 9
});
```

### Configurar Onboarding para MCP Custom

```json
{
  "mcp_name": "mi-servicio",
  "steps": [
    {
      "step_order": 1,
      "title": "Bienvenida",
      "step_type": "info",
      "description": "..."
    },
    {
      "step_order": 2,
      "title": "API Key",
      "step_type": "api_key",
      "config": {
        "field_name": "MI_API_KEY",
        "field_label": "Tu API Key"
      }
    }
  ]
}
```

## 📊 Analytics y Monitoring

El sistema registra automáticamente:

```sql
-- Ver MCPs más usados
SELECT
  ms.display_name,
  COUNT(*) as usage_count,
  AVG(ml.execution_time_ms) as avg_execution_time
FROM mcp_usage_logs ml
JOIN mcp_servers ms ON ml.mcp_server_id = ms.id
WHERE ml.created_at > NOW() - INTERVAL '30 days'
GROUP BY ms.display_name
ORDER BY usage_count DESC;

-- Ver tareas más comunes
SELECT
  metadata->>'task' as task_type,
  COUNT(*) as count
FROM mcp_usage_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY task_type
ORDER BY count DESC;

-- Tasa de éxito por MCP
SELECT
  ms.display_name,
  COUNT(CASE WHEN ml.success THEN 1 END)::float / COUNT(*) * 100 as success_rate
FROM mcp_usage_logs ml
JOIN mcp_servers ms ON ml.mcp_server_id = ms.id
GROUP BY ms.display_name;
```

## 🔒 Seguridad

**Best Practices**:

1. **Credenciales**:
   - Nunca commitear .env files
   - Usar service_role_key solo en backend
   - Rotar keys periódicamente

2. **Permisos**:
   - Row Level Security (RLS) en Supabase
   - Validar user_id en todas las queries
   - Limitar scope de OAuth tokens

3. **Rate Limiting**:
   - Implementar limits por usuario
   - Timeout en operaciones largas
   - Max iterations en orquestador

## 🚧 Roadmap

- [ ] Dashboard web React/Next.js
- [ ] Visual workflow builder
- [ ] A/B testing de prompts
- [ ] Multi-tenancy support
- [ ] Marketplace de agentes
- [ ] Analytics dashboard
- [ ] Webhooks para integraciones
- [ ] Cost tracking por MCP

## 📖 Documentación Adicional

- [Onboarding Flows](docs/onboarding-flows.json) - Flujos de configuración
- [Specialized Agents](agents/specialized-agents-examples.json) - Ejemplos de agentes
- [Database Schema](database/mcp-manager-schema.sql) - Estructura de BD
- [Orchestrator Agent](agents/orchestrator-agent.ts) - Código del orquestador
- [n8n Workflow](workflows/orchestrator-workflow.json) - Workflow principal

## 🤝 Soporte

Si tienes preguntas:
1. Revisa la documentación en `/docs`
2. Consulta los ejemplos en `/agents`
3. Verifica los logs de n8n y Supabase

## 📝 Licencia

MIT
