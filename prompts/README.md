# GoHighLevel Business Intelligence Agent

Sistema completo de prompt engineering para un agente de IA con acceso directo a GoHighLevel CRM.

---

## 📁 Archivos Incluidos

### 1. [ghl-agent-prompt.md](./ghl-agent-prompt.md)
**System Prompt Principal** - 8,500+ palabras

El prompt completo y profesional que define:
- Identidad y propósito del agente
- Capacidades y herramientas disponibles
- Guidelines de respuesta y formato
- Manejo de errores y edge cases
- Best practices y tone of voice

**Uso**: Copia este prompt al inicio de tu conversación con Claude, GPT-4, o cualquier LLM que soporte MCP.

---

### 2. [ghl-query-examples.md](./ghl-query-examples.md)
**Biblioteca de 100+ Ejemplos** de queries

Organizado por categorías:
- 📋 Gestión de Contactos (15+ ejemplos)
- 💼 Pipeline y Oportunidades (20+ ejemplos)
- 👥 Análisis de Staff (10+ ejemplos)
- ✅ Gestión de Tareas (12+ ejemplos)
- 📊 Reportes y Analytics (15+ ejemplos)
- 💬 Conversaciones (8+ ejemplos)
- 📅 Calendario y Citas (8+ ejemplos)
- 💰 Pagos y Transacciones (8+ ejemplos)

Más:
- Queries avanzadas multi-herramienta
- Ejemplos por rol (Manager, AE, SDR, CEO)
- Tips para queries efectivas
- Casos de uso reales

**Uso**: Referencia rápida de cómo hacer preguntas al agente.

---

### 3. [ghl-agent-config.json](./ghl-agent-config.json)
**Configuración Técnica Completa**

Define:
- Configuración de MCPs requeridos
- Herramientas (tools) disponibles
- Routing rules inteligentes
- Filtros por defecto
- Lógica de negocio (deal sizes, priority thresholds)
- Performance settings
- Security & privacy settings
- Integraciones

**Uso**: Úsalo para configurar el agente en tu dashboard o sistema de orquestación.

---

### 4. [ghl-setup-guide.md](./ghl-setup-guide.md)
**Guía de Setup Paso a Paso**

Incluye:
- Quick start (5 minutos)
- Cómo obtener credenciales de GHL
- Configuración en Dashboard Manager
- Cómo usar el agente
- Ejemplos prácticos completos
- Troubleshooting
- FAQ

**Uso**: Sigue esta guía para configurar el agente desde cero.

---

## 🚀 Quick Start

### 1. Configura las Credenciales

En tu archivo `.env.local`:

```bash
GHL_API_KEY=tu_token_privado_aqui
GHL_LOCATION_ID=tu_location_id_aqui
```

### 2. Copia el System Prompt

Abre [ghl-agent-prompt.md](./ghl-agent-prompt.md) y copia todo el contenido.

### 3. Inicia una Conversación

En Claude Desktop, Cursor, o tu LLM favorito, pega el system prompt y pregunta:

```
"Muéstrame mi pipeline actual"
```

¡Eso es todo! El agente usará el MCP de GHL para darte datos reales.

---

## 🎯 Casos de Uso

### Para Sales Managers
```
"Dashboard del equipo de ventas"
"Quién necesita ayuda con sus deals?"
"Forecast de cierre para fin de mes"
```

### Para Account Executives
```
"Mi pipeline personal"
"Qué debo hacer hoy?"
"Deals que necesitan follow-up"
```

### Para SDRs
```
"Leads nuevos para calificar"
"Contactos que respondieron mi email"
"Llamadas pendientes"
```

### Para CEOs
```
"Estado general del negocio"
"Revenue vs objetivo mensual"
"Top opportunities en riesgo"
```

---

## 🛠️ Herramientas Disponibles

El agente tiene acceso a 21 herramientas del MCP de GoHighLevel:

### Contacts (8 tools)
- get_contact, create_contact, update_contact, upsert_contact
- get_contacts, add_tags, remove_tags, get_all_tasks

### Opportunities (4 tools)
- search_opportunity, get_opportunity, update_opportunity, get_pipelines

### Conversations (3 tools)
- search_conversation, get_messages, send_message

### Calendars (2 tools)
- get_calendar_events, get_appointment_notes

### Payments (2 tools)
- get_order, list_transactions

### Locations (2 tools)
- get_location, get_custom_fields

---

## 📊 Ejemplo de Respuesta

**Query**: "Deals cerrando esta semana"

**Respuesta del Agente**:
```
📊 Oportunidades con Cierre Esta Semana (Dic 25-31)

Total: 5 deals | Valor: $127,500 | Win probability: 68%

🟢 Alta Probabilidad:
1. **Enterprise Package - Acme Corp**
   💰 $45,000 | 📅 Dic 28 | 👤 Sarah Johnson
   📍 Stage: Negotiation | ⏱️ Last update: Hace 1 día
   📝 Note: "Waiting for final approval from CFO"

2. **Pro Plan - Beta Industries**
   💰 $22,000 | 📅 Dic 30 | 👤 John Smith
   📍 Stage: Contract Sent | ⏱️ Last update: Hace 3 horas

[...]

⚠️ Acción Requerida:
- 2 deals necesitan follow-up hoy
- 1 deal sin actualizar en 5 días

💡 Sugerencia: Prioriza el cierre de Acme Corp ($45k)
```

---

## 🔐 Seguridad y Privacidad

- ✅ Datos en tiempo real (no se cachean)
- ✅ Acceso basado en permisos de GHL
- ✅ PII redactada en logs
- ✅ Requiere confirmación para acciones destructivas
- ✅ Audit logging habilitado

---

## 📈 Capacidades de Analytics

El agente puede calcular automáticamente:

- **Conversion Rate** (oportunidades ganadas / total)
- **Pipeline Value** (suma de todas las oportunidades activas)
- **Win Rate** (deals cerrados ganados / total cerrados)
- **Average Deal Size** (revenue total / número de deals)
- **Sales Cycle Length** (días desde creación hasta cierre)
- **Activity Metrics** (llamadas, meetings, emails)
- **Team Performance** (comparación entre sales reps)
- **Trend Analysis** (mes a mes, trimestre a trimestre)

---

## 🎓 Características Avanzadas

### 1. Multi-Tool Queries
```
"Contactos VIP con oportunidades mayores a $50k y sin actividad en 15 días"
```
El agente ejecuta múltiples tools y hace cross-reference automáticamente.

### 2. Insights Proactivos
```
El agente identifica:
- Deals en riesgo
- Tareas críticas overdue
- Opportunities estancadas
- Patrones de bajo performance
```

### 3. Formateo Inteligente
```
- Usa emojis para claridad visual
- Agrupa información relevante
- Sugiere next actions
- Compara con periodos anteriores
```

### 4. Natural Language Understanding
```
"Hot leads" → Contactos con tags "hot", "warm", "interested"
"Big deals" → Oportunidades > $10,000
"This week" → Fecha actual +/- 7 días
```

---

## 🔗 Integración con Otros MCPs

El agente puede combinarse con:

- **Supabase RAG**: Almacenar insights históricos
- **Notion**: Exportar reportes automáticos
- **Linear**: Crear tasks desde oportunidades
- **Slack**: Notificaciones de deals importantes
- **Stripe**: Correlacionar pagos con GHL

---

## 📝 Personalización

### Modificar el System Prompt

Edita [ghl-agent-prompt.md](./ghl-agent-prompt.md) para:
- Cambiar tone of voice
- Agregar reglas de negocio específicas
- Definir métricas custom
- Ajustar formatos de respuesta

### Modificar Configuración

Edita [ghl-agent-config.json](./ghl-agent-config.json) para:
- Agregar/remover herramientas
- Cambiar routing rules
- Ajustar thresholds de negocio
- Configurar integraciones

---

## 🐛 Troubleshooting

### Problema: "Tool 'ghl' not found"
**Solución**: Confirma que el MCP de GHL esté habilitado y corriendo.

### Problema: "Permission denied"
**Solución**: Verifica scopes del Private Integration Token en GHL.

### Problema: Datos desactualizados
**Solución**: Los datos son en tiempo real. Reinicia el MCP si hay cache.

Ver más en: [ghl-setup-guide.md - Troubleshooting](./ghl-setup-guide.md#troubleshooting)

---

## 📚 Recursos

- **GHL API Docs**: https://highlevel.stoplight.io/docs/integrations/
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Dashboard Manager**: https://mcp-dashboard-manager.vercel.app

---

## 🤝 Contribución

Este sistema de prompts es parte del **MCP Dashboard Manager** project.

Para mejoras o sugerencias:
1. Prueba el agente extensivamente
2. Documenta casos de uso nuevos
3. Optimiza el system prompt
4. Agrega ejemplos a la biblioteca

---

## 📄 Licencia

MIT License - Ver LICENSE file en el root del proyecto.

---

## ✨ Créditos

**Autor**: RogerVibes
**Proyecto**: MCP Dashboard Manager
**Fecha**: Diciembre 2024
**Versión**: 1.0.0

---

## 🎯 Next Steps

1. ✅ Configura tus credenciales de GHL
2. ✅ Lee el [Setup Guide](./ghl-setup-guide.md)
3. ✅ Copia el [System Prompt](./ghl-agent-prompt.md)
4. ✅ Prueba con [Query Examples](./ghl-query-examples.md)
5. ✅ Personaliza según tus necesidades

**¿Listo para empezar?** Abre [ghl-setup-guide.md](./ghl-setup-guide.md) y sigue el Quick Start!

---

**Made with ❤️ for the AI Agents revolution**
