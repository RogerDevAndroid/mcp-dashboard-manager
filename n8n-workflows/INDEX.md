# 📚 Índice: N8N MCP Orchestrator

Guía completa de navegación para el sistema de orquestación MCP con n8n y GoHighLevel.

## 🎯 ¿Qué es esto?

Un **agente orquestador MCP** implementado en n8n que:
- Procesa solicitudes a GoHighLevel API de manera estandarizada
- Proporciona respuestas en formato MCP (Model Context Protocol)
- Registra todas las operaciones en Supabase
- Incluye cliente TypeScript type-safe
- Listo para producción

## 📁 Estructura de Archivos

```
n8n-workflows/
├── 📄 ghl-mcp-orchestrator.json    # Workflow de n8n (importar)
├── 📘 README.md                     # Documentación completa del API
├── 🚀 QUICKSTART.md                 # Inicio rápido (15 min)
├── 📋 SETUP_GUIDE.md                # Guía detallada paso a paso
└── 🏗️ ARCHITECTURE.md               # Arquitectura y diagramas

lib/
└── 📦 n8n-mcp-client.ts            # Cliente TypeScript

examples/
└── 💡 n8n-mcp-usage.ts             # Ejemplos de uso

scripts/
└── 🧪 test-n8n-integration.js      # Script de testing

.env.n8n.example                     # Variables de entorno
```

## 🗺️ Guía de Navegación

### 👤 Para Usuarios Nuevos

**Empieza aquí:**
1. [QUICKSTART.md](QUICKSTART.md) - Pon el sistema funcionando en 15 minutos
2. [examples/n8n-mcp-usage.ts](../examples/n8n-mcp-usage.ts) - Ve ejemplos prácticos
3. [README.md](README.md) - Explora todas las capacidades

### 🔧 Para Implementación

**Sigue este orden:**
1. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup completo paso a paso
2. [.env.n8n.example](../.env.n8n.example) - Configura variables de entorno
3. [scripts/test-n8n-integration.js](../scripts/test-n8n-integration.js) - Valida tu setup

### 🏗️ Para Arquitectos/DevOps

**Revisa esto:**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura completa del sistema
2. [ghl-mcp-orchestrator.json](ghl-mcp-orchestrator.json) - Workflow de n8n
3. [README.md#monitoreo](README.md#-monitoreo) - Queries de analytics

### 💻 Para Desarrolladores

**Integra con:**
1. [lib/n8n-mcp-client.ts](../lib/n8n-mcp-client.ts) - Cliente TypeScript
2. [examples/n8n-mcp-usage.ts](../examples/n8n-mcp-usage.ts) - Ejemplos de código
3. [README.md#uso-del-api](README.md#-uso-del-api) - API Reference

## 🎬 Escenarios de Uso

### Escenario 1: "Quiero probarlo rápido"
```bash
1. Abre QUICKSTART.md
2. Sigue los 6 pasos (15 min)
3. Ejecuta: node scripts/test-n8n-integration.js
```

### Escenario 2: "Quiero implementarlo en producción"
```bash
1. Lee SETUP_GUIDE.md completo
2. Configura según ARCHITECTURE.md
3. Implementa autenticación (ver README.md)
4. Configura monitoreo (ver README.md)
```

### Escenario 3: "Quiero integrar con mi app"
```typescript
1. Importa: lib/n8n-mcp-client.ts
2. Copia ejemplos de: examples/n8n-mcp-usage.ts
3. Configura: .env.n8n.example
4. Lee: README.md sección "Integración con MCP"
```

### Escenario 4: "Algo no funciona"
```bash
1. Revisa SETUP_GUIDE.md → Troubleshooting
2. Ejecuta: node scripts/test-n8n-integration.js
3. Revisa logs en n8n → Executions
4. Checa Supabase → Table Editor → mcp_requests
```

## 📊 Resumen de Características

| Característica | Estado | Archivo |
|----------------|--------|---------|
| ✅ Workflow n8n | Listo | `ghl-mcp-orchestrator.json` |
| ✅ Cliente TypeScript | Listo | `lib/n8n-mcp-client.ts` |
| ✅ React Hooks | Listo | `lib/n8n-mcp-client.ts` |
| ✅ Ejemplos de uso | Listo | `examples/n8n-mcp-usage.ts` |
| ✅ Scripts de test | Listo | `scripts/test-n8n-integration.js` |
| ✅ Logging a Supabase | Listo | SQL en `SETUP_GUIDE.md` |
| ✅ Documentación | Completa | Todos los .md |
| ⚠️ Autenticación webhook | Opcional | Ver `README.md` |
| ⚠️ Rate limiting | Opcional | Ver `ARCHITECTURE.md` |
| ⚠️ Caché | Opcional | Ver `ARCHITECTURE.md` |

## 🚀 Acciones Disponibles

| Acción | Endpoint GHL | Doc |
|--------|--------------|-----|
| `list_contacts` | `/contacts/` | [README.md](README.md#1-list-contacts) |
| `get_contact` | `/contacts/{id}` | README.md |
| `create_contact` | `/contacts/` (POST) | README.md |
| `update_contact` | `/contacts/{id}` (PUT) | README.md |
| `list_opportunities` | `/opportunities/search` | [README.md](README.md#2-list-opportunities) |
| `get_opportunity` | `/opportunities/{id}` | README.md |
| `create_opportunity` | `/opportunities/` (POST) | README.md |
| `update_opportunity` | `/opportunities/{id}` (PUT) | README.md |
| `list_calendar_events` | `/calendars/events` | [README.md](README.md#3-list-calendar-events) |
| `create_calendar_event` | `/calendars/events` (POST) | README.md |
| `sync_broker_data` | Custom endpoint | [README.md](README.md#4-sync-broker-data) |
| `get_broker_stats` | Custom endpoint | README.md |
| `get_ranking` | Custom endpoint | README.md |

## 🔑 Variables de Entorno Requeridas

```bash
# N8N
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/ghl-orchestrator

# GoHighLevel
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_PRIVATE_TOKEN=your_token
GHL_LOCATION_ID=your_location_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

Ver [.env.n8n.example](../.env.n8n.example) para más detalles.

## 📞 APIs y Credenciales

### GoHighLevel
- **Docs**: https://highlevel.stoplight.io/
- **Crear token**: Settings → Integrations → Private Integration
- **Scopes necesarios**: contacts.*, opportunities.*, calendars.*

### Supabase
- **Docs**: https://supabase.com/docs
- **API Key**: Settings → API → service_role key
- **Database**: PostgreSQL con Row Level Security

### n8n
- **Cloud**: https://n8n.cloud/
- **Self-hosted**: https://docs.n8n.io/hosting/
- **Docs**: https://docs.n8n.io/

## 🎓 Recursos de Aprendizaje

### MCP (Model Context Protocol)
- Spec: https://modelcontextprotocol.io/
- Descripción: Protocolo estándar para intercambio de contexto entre sistemas

### Casos de Uso Reales
1. **Sincronización de CRM**: Sync automático de contactos GHL → Supabase
2. **Dashboard de brokers**: Estadísticas en tiempo real
3. **Automatización de follow-ups**: Triggers basados en eventos
4. **Reporting**: Analytics consolidados en Supabase
5. **Integraciones**: Conectar GHL con otros servicios

### Ejemplos en Código
- [ejemplo2_listarContactos](../examples/n8n-mcp-usage.ts#L32)
- [ejemplo3_crearContacto](../examples/n8n-mcp-usage.ts#L65)
- [ejemplo13_pipelineCompleto](../examples/n8n-mcp-usage.ts#L419)

## 🛠️ Comandos Útiles

```bash
# Probar integración
node scripts/test-n8n-integration.js

# Iniciar n8n local
npx n8n

# Ver logs de n8n (Docker)
docker logs -f n8n

# Ejecutar ejemplos
node -r ts-node/register examples/n8n-mcp-usage.ts

# Testear conexión GHL
node scripts/test-ghl-mcp-connection.js
```

## 🐛 Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| 401 Unauthorized | Verifica token GHL incluye `Bearer ` |
| Credential not found | Guarda credenciales en TODOS los nodos |
| Webhook not found | Activa el workflow (toggle verde) |
| Table does not exist | Ejecuta SQL de SETUP_GUIDE.md |
| Timeout | Aumenta timeout en nodo HTTP Request |

Ver [SETUP_GUIDE.md#troubleshooting](SETUP_GUIDE.md#-troubleshooting) para más.

## 📈 Roadmap

- [ ] Autenticación de webhook con API keys
- [ ] Rate limiting por usuario
- [ ] Caché de respuestas con Redis
- [ ] Webhooks de GHL para updates en tiempo real
- [ ] Circuit breaker para resiliencia
- [ ] Métricas con Prometheus/Grafana
- [ ] Tests automatizados con Jest
- [ ] CI/CD con GitHub Actions

## 🤝 Contribuir

¿Mejoras o bugs? Abre un issue o PR en el repo.

## 📄 Licencia

MIT License - RogerVibes

---

## 🎯 Inicio Rápido (TL;DR)

```bash
# 1. Importar workflow en n8n
#    n8n-workflows/ghl-mcp-orchestrator.json

# 2. Configurar credenciales en n8n
#    GHL Token + Supabase Key

# 3. Crear tabla en Supabase
#    SQL en SETUP_GUIDE.md

# 4. Activar workflow y copiar URL

# 5. Probar
curl -X POST https://tu-n8n.com/webhook/ghl-orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"list_contacts","userId":"test","params":{"limit":5}}'

# 6. Integrar con tu app
import { createMCPClient } from '@/lib/n8n-mcp-client';
const client = createMCPClient();
const contacts = await client.listContacts({ limit: 10 });
```

**¿Primera vez?** → [QUICKSTART.md](QUICKSTART.md)

**¿Setup completo?** → [SETUP_GUIDE.md](SETUP_GUIDE.md)

**¿Ver ejemplos?** → [examples/n8n-mcp-usage.ts](../examples/n8n-mcp-usage.ts)

---

**Última actualización**: 2025-01-30
