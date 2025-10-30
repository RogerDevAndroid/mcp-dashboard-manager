# Guía de Setup - GoHighLevel Business Intelligence Agent

Esta guía te ayudará a configurar y usar el agente de GoHighLevel en minutos.

---

## 🚀 Quick Start (5 minutos)

### Paso 1: Obtener Credenciales de GHL

1. **Inicia sesión en GoHighLevel**
   - Ve a: https://app.gohighlevel.com

2. **Crea un Private Integration Token**
   - Settings → Integrations → Private Integrations
   - Click "Create New Integration"
   - Nombre: "MCP Dashboard Manager"

3. **Selecciona los Scopes necesarios**:
   ```
   ✅ contacts.readonly
   ✅ contacts.write
   ✅ opportunities.readonly
   ✅ opportunities.write
   ✅ calendars.readonly
   ✅ conversations.readonly
   ✅ conversations.write
   ✅ payments.readonly
   ✅ locations.readonly
   ```

4. **Copia el Token generado**
   - Lo usaremos como `GHL_API_KEY`

5. **Obtén tu Location ID**
   - Ve a tu dashboard de GoHighLevel
   - La URL será algo como: `https://app.gohighlevel.com/location/ABC123XYZ`
   - Copia el ID después de `/location/` → Este es tu `GHL_LOCATION_ID`

---

## ⚙️ Configuración en el Dashboard

### Opción A: Usando el Dashboard Manager

1. **Abre el MCP Dashboard**
   - Ve a: https://mcp-dashboard-manager.vercel.app

2. **Navega a MCPs**
   - Click en "MCP Servers" en el sidebar

3. **Encuentra GoHighLevel**
   - Busca "GoHighLevel" en la lista
   - Click en "Configurar"

4. **Ingresa tus credenciales**:
   ```
   GHL_API_KEY: [Tu token aquí]
   GHL_LOCATION_ID: [Tu location ID aquí]
   ```

5. **Test de Conexión**
   - Click en "Test Connection"
   - Deberías ver: ✅ "Conexión exitosa"

6. **Habilita el MCP**
   - Toggle "Enabled" → ON
   - Click "Guardar"

### Opción B: Configuración Manual

Si prefieres configurar manualmente, edita tu archivo `.env.local`:

```bash
# GoHighLevel MCP Configuration
GHL_API_KEY=tu_token_privado_aqui
GHL_LOCATION_ID=tu_location_id_aqui

# Opcional: Endpoint personalizado
GHL_MCP_ENDPOINT=https://services.leadconnectorhq.com/mcp/
```

---

## 🤖 Usar el Agente

### En Claude Desktop / Cursor / Windsurf

1. **Asegúrate de que el MCP esté configurado**
   - El agente necesita acceso al tool `ghl`

2. **Inicia una conversación con el System Prompt**

Copia y pega este prompt al inicio de tu conversación:

```
Eres un agente especializado de GoHighLevel con acceso directo al CRM a través del tool 'ghl'.

Puedes ayudarme con:
- Información de contactos, leads y clientes
- Estado del pipeline y oportunidades de venta
- Rendimiento del equipo y staff
- Tareas pendientes y follow-ups
- Calendario y citas
- Conversaciones y comunicaciones
- Pagos, transacciones y revenue
- Reportes y analytics del negocio

Usa el tool 'ghl' para acceder a datos reales y en tiempo real. Formatea tus respuestas de manera clara, con emojis, y siempre incluye insights accionables.

¿Listo para ayudarme?
```

3. **Empieza a hacer preguntas**:

```
"Muéstrame mi pipeline actual"
"Contactos VIP con oportunidades mayores a $10k"
"Qué tareas tengo hoy?"
"Cómo va el equipo este mes?"
```

### En tu Dashboard Manager

1. **Navega a "Agentes"**
2. **Click en "Crear Nuevo Agente"**
3. **Selecciona la plantilla "GoHighLevel Business Intelligence"**
4. **El agente se configurará automáticamente con**:
   - System prompt optimizado
   - Acceso al MCP de GHL
   - Routing rules pre-configuradas
5. **Click "Crear Agente"**
6. **Empieza a chatear**

---

## 📝 Ejemplos de Uso

### Caso 1: Morning Briefing

```
Usuario: "Dame un resumen de lo que debo hacer hoy"

Agente responderá con:
📅 Hoy - Lunes, Diciembre 30, 2024

✅ TAREAS (5 pendientes):
1. 📞 Llamar a Acme Corp - Deal en riesgo
2. 📧 Send proposal a Beta Inc
3. 🤝 Demo con Gamma LLC - 2:00 PM

💰 DEALS IMPORTANTES:
1. Acme Corp ($45k) - Cierra mañana
2. Beta Inc ($22k) - Esperando propuesta

⚠️ ATENCIÓN:
- 2 conversaciones sin responder (48hrs+)
- 1 tarea vencida de Sarah

💡 PRIORIDAD: Cerrar deal de Acme Corp hoy
```

### Caso 2: Pipeline Review

```
Usuario: "Análisis completo de mi pipeline"

Agente mostrará:
📊 PIPELINE OVERVIEW - Diciembre 2024

Total: 47 oportunidades | $487,500

Por Etapa:
🔵 New (12): $45,000
🟡 Qualified (18): $182,000
🟠 Proposal (10): $175,000
🟢 Negotiation (5): $68,500
✅ Closed Won (2): $17,000

📈 Métricas:
• Win Rate: 23% (↑ 5% vs mes pasado)
• Avg Deal Size: $10,372
• Sales Cycle: 32 días

⚠️ En Riesgo:
• 3 deals sin actualizar en 30+ días
• 2 deals pasados de fecha de cierre

💡 Sugerencia: Enfócate en los 5 deals en Negotiation - representan $68.5k
```

### Caso 3: Team Performance

```
Usuario: "Rendimiento del equipo esta semana"

Agente mostrará:
👥 TEAM PERFORMANCE - Semana del Dic 23-30

🏆 TOP PERFORMERS:
1. Sarah Johnson: 3 deals cerrados ($47k)
2. John Smith: 2 deals cerrados ($29k)
3. Mike Chen: 1 deal cerrado ($15k)

📊 ACTIVIDAD:
• Llamadas totales: 127
• Meetings realizados: 34
• Propuestas enviadas: 12

📈 PIPELINE TEAM:
• Valor total: $487,500
• Deals activos: 47
• Avg por rep: $162,500

⚠️ ATENCIÓN NECESARIA:
• Mike Chen: 15 días sin cerrar un deal
• 8 tareas overdue en el equipo

💡 Next Steps: Review pipeline de Mike, reasignar deals si es necesario
```

---

## 🎯 Queries Comunes

### Contactos y Leads
```
"Nuevos leads de hoy"
"Contactos con tag VIP"
"Leads que no han respondido en 30 días"
"Info de maria@example.com"
```

### Pipeline y Ventas
```
"Mi pipeline"
"Deals mayores a $20k"
"Oportunidades que cierran esta semana"
"Deals estancados"
```

### Tareas y Follow-ups
```
"Qué tengo que hacer hoy?"
"Tareas vencidas"
"Follow-ups pendientes"
"Tareas de Sarah"
```

### Analytics y Reportes
```
"Revenue del mes"
"Tasa de conversión"
"Top performers"
"Dashboard del negocio"
```

---

## 🔧 Troubleshooting

### Error: "No puedo conectar con GHL"

**Solución**:
1. Verifica que el token sea válido
2. Confirma que el Location ID sea correcto
3. Revisa que los scopes estén habilitados
4. Intenta generar un nuevo token

### Error: "Tool 'ghl' not found"

**Solución**:
1. Confirma que el MCP de GHL esté habilitado en tu dashboard
2. Reinicia tu aplicación (Claude Desktop, Cursor, etc.)
3. Verifica que el MCP server esté corriendo

### Error: "Permission denied"

**Solución**:
1. Ve a Settings → Private Integrations en GHL
2. Agrega los scopes faltantes
3. Regenera el token si es necesario

### Datos desactualizados

**Solución**:
- El agente usa datos en tiempo real
- Si ves datos viejos, puede ser cache del MCP
- Reinicia el MCP server o espera 5 minutos

---

## 📚 Recursos Adicionales

- **System Prompt Completo**: [ghl-agent-prompt.md](./ghl-agent-prompt.md)
- **Ejemplos de Queries**: [ghl-query-examples.md](./ghl-query-examples.md)
- **Configuración Avanzada**: [ghl-agent-config.json](./ghl-agent-config.json)
- **Documentación GHL API**: https://highlevel.stoplight.io/docs/integrations/
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## 🎓 Tips Pro

### 1. Usa Variables de Contexto

En lugar de repetir información:
```
❌ "Deals de Sarah mayores a $10k en diciembre"
✅ "Actualiza el contexto: USER=Sarah, THRESHOLD=$10k, PERIOD=diciembre"
    Luego: "Muéstrame los deals"
```

### 2. Combina Queries

```
"Dame un dashboard con:
1. Mi pipeline total
2. Tareas de hoy
3. Deals en riesgo
4. Revenue del mes"
```

### 3. Programa Reportes Automáticos

```
"Cada lunes a las 9am, envíame:
- Resumen de la semana anterior
- Deals que cierran esta semana
- Tareas críticas del equipo"
```

### 4. Usa Comparaciones

```
"Compara diciembre 2024 vs noviembre 2024"
"Mi performance vs el promedio del equipo"
"Este Q4 vs Q4 del año pasado"
```

---

## 🚀 Próximos Pasos

1. **Configura tu primer agente** siguiendo esta guía
2. **Prueba con queries simples** para familiarizarte
3. **Lee los ejemplos** en [ghl-query-examples.md](./ghl-query-examples.md)
4. **Personaliza el system prompt** según tus necesidades
5. **Integra con otros MCPs** (Notion, Slack, etc.)

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar múltiples locations?**
R: Sí, crea un agente separado para cada location con su propio `GHL_LOCATION_ID`.

**P: ¿Los datos se guardan en algún lugar?**
R: No, el agente consulta datos en tiempo real de GHL. Nada se guarda localmente.

**P: ¿Puedo modificar contactos y deals?**
R: Sí, si tu token tiene los scopes `contacts.write` y `opportunities.write`.

**P: ¿Funciona con sub-accounts?**
R: Sí, cada sub-account tiene su propio Location ID.

**P: ¿Cuántas requests puedo hacer?**
R: GHL tiene rate limits de API. El agente está configurado para 60 req/min.

---

¿Listo para empezar? ¡Configura tu agente ahora y transforma la manera en que gestionas tu CRM!

**Need help?** Revisa la documentación completa o contacta soporte.
