# ✅ Usuarios/Staff de GoHighLevel - Selvadentro Tulum

**Fecha**: 2025-10-30
**Endpoint Exitoso**: `GET /users/?locationId={locationId}`
**Total de Usuarios**: 17

---

## 🎯 Resumen

Hemos extraído exitosamente la lista completa de **17 usuarios** del equipo de Selvadentro Tulum en GoHighLevel. Esto nos permite:

1. ✅ Asignar leads automáticamente a agentes específicos
2. ✅ Implementar rotación round-robin de leads
3. ✅ Crear reportes de productividad por usuario
4. ✅ Calcular KPIs individuales de conversión
5. ✅ Personalizar dashboards por agente

---

## 👥 Lista Completa de Usuarios

### Equipo Selvadentro Tulum

1. **Carlos Martinez**
   - ID: `gDXm4rIB6In8qkt5uzJY`
   - Email: carloshmartinez.biz@gmail.com

2. **clara marttinez**
   - ID: `tWduuT0rn3qVlgWKJiRx`
   - Email: clara.marxeting@gmail.com

3. **Gonzalo Caro**
   - ID: `UZa6pmz2KCBTAXgEGXE8`
   - Email: gonzalo.selvadentro@gmail.com

4. **Jaqueline Selvadentro**
   - ID: `vWerQ2MELDsCSFFKxkJQ`
   - Email: crodriguez@selvadentrotulum.com

5. **Luis Paez** (Cuenta 1)
   - ID: `1SNwHCyKPl2ujvlZnTD6`
   - Email: supporr@whatsnap.ai
   - Nota: Usuario duplicado

6. **Luis Paez** (Cuenta 2)
   - ID: `IDRYy2kJeYnt7sQhsXfa`
   - Email: luis@whatsnap.ai
   - Nota: Usuario duplicado

7. **Mafer Cienfuegos**
   - ID: `jVFCuWoAZEFJ7x85sJTz`
   - Email: mcienfuegos@selvadentrotulum.com

8. **Maria VM**
   - ID: `vhdm6etm8bf1ntO6fg9g`
   - Email: recepcion@selvadentrotulum.com
   - Teléfono: +529842686215
   - Rol probable: Recepción

9. **Mariano Molina**
   - ID: `NbVUWwCOFUA5phlcZpGm`
   - Email: mmolina@selvadentrotulum.com

10. **Marxeting Agency**
    - ID: `p5x13k9kFJjB5OpQ1sbk`
    - Email: marxeting.biz@gmail.com
    - Nota: Cuenta de agencia

11. **Omar Curi**
    - ID: `TKzZQuHjdRG9x4tpwpRx`
    - Email: d.comercial@selvadentrotulum.com
    - Rol probable: Director Comercial

12. **Pablo Saracho**
    - ID: `JWkZYNaQyKuRfPEnBeiC`
    - Email: psaracho@selvadentrotulum.com

13. **Raquel Reyes**
    - ID: `UXlYNIkoELdoGreTa7Th`
    - Email: rareyes@selvadentrotulum.com

14. **Roger GV** (¡Tú!)
    - ID: `XpV3Pz9INSFZs3AXnkFe`
    - Email: rgarciavital@gmail.com

15. **Selvadentro Tulum**
    - ID: `CztE6G4AkTVsmt5n2ENW`
    - Email: selvadentromarketing@gmail.com
    - Nota: Cuenta corporativa

16. **What Snap**
    - ID: `YRLuyOgwwtNt58tEGakn`
    - Email: support@whatsnap.ai
    - Nota: Cuenta de servicio

17. **Juan Esteban Camara Camara**
    - ID: `oMl1JU0hlkLyWDhkTwCS`
    - Email: d.general@selvadentrotulum.com
    - Teléfono: +529991119277
    - Rol probable: Director General

---

## 📊 Análisis del Equipo

### Por Categoría

**Equipo de Ventas/Comercial** (7):
- Omar Curi (Director Comercial)
- Pablo Saracho
- Raquel Reyes
- Mafer Cienfuegos
- Mariano Molina
- Gonzalo Caro
- Jaqueline Selvadentro

**Dirección/Administración** (2):
- Juan Esteban Camara (Director General)
- Roger GV

**Soporte/Recepción** (1):
- Maria VM

**Cuentas de Servicio/Agencias** (4):
- Selvadentro Tulum (Corporativa)
- Marxeting Agency
- What Snap
- Luis Paez (2 cuentas)

**Marketing** (3):
- clara marttinez
- Carlos Martinez
- Marxeting Agency

### Observaciones Importantes

1. **Usuario Duplicado**: Luis Paez tiene 2 cuentas
   - Recomendación: Consolidar en una sola cuenta

2. **Cuentas de Servicio**: 4 cuentas no son usuarios humanos
   - Útil para automatizaciones
   - Considerar en reportes de productividad

3. **Solo 2 usuarios con teléfono**:
   - Maria VM: +529842686215
   - Juan Esteban: +529991119277
   - Recomendar completar datos de contacto

---

## 📋 Estructura de Datos de Usuarios

### Campos Disponibles (11)

```typescript
interface GHLUser {
  id: string;                    // ID único del usuario
  name: string;                  // Nombre completo
  firstName: string;             // Nombre
  lastName: string;              // Apellido
  email: string;                 // Email
  deleted: boolean;              // Si está eliminado
  roles: object;                 // Roles asignados
  scopes: string[];              // Permisos/scopes
  scopesAssignedToOnly: string[];// Scopes limitados
  freshdeskContactId: string;    // ID de Freshdesk
  lcPhone: string;               // Teléfono (opcional)
}
```

### Ejemplo de Usuario Completo

```json
{
  "id": "oMl1JU0hlkLyWDhkTwCS",
  "name": "Juan Esteban Camara Camara",
  "firstName": "Juan Esteban",
  "lastName": "Camara Camara",
  "email": "d.general@selvadentrotulum.com",
  "deleted": false,
  "roles": {
    // Información de roles
  },
  "scopes": ["contacts.read", "opportunities.read", ...],
  "scopesAssignedToOnly": [],
  "freshdeskContactId": null,
  "lcPhone": "+529991119277"
}
```

---

## 💡 Casos de Uso con Usuarios

### 1. Asignación Automática de Leads

**Round-Robin por Equipo de Ventas**:

```javascript
const salesTeam = [
  { id: 'TKzZQuHjdRG9x4tpwpRx', name: 'Omar Curi' },
  { id: 'JWkZYNaQyKuRfPEnBeiC', name: 'Pablo Saracho' },
  { id: 'UXlYNIkoELdoGreTa7Th', name: 'Raquel Reyes' },
  { id: 'jVFCuWoAZEFJ7x85sJTz', name: 'Mafer Cienfuegos' },
  { id: 'NbVUWwCOFUA5phlcZpGm', name: 'Mariano Molina' }
];

let currentIndex = 0;

function assignLeadRoundRobin(lead) {
  const assignedAgent = salesTeam[currentIndex];
  currentIndex = (currentIndex + 1) % salesTeam.length;

  // Actualizar lead en GHL
  updateContact(lead.id, {
    assignedTo: assignedAgent.id
  });

  return assignedAgent;
}
```

### 2. Asignación Inteligente con IA

**Basada en Expertise o Carga de Trabajo**:

```javascript
async function assignLeadIntelligent(lead) {
  // 1. Obtener carga actual de cada agente
  const workload = await getAgentWorkloads(salesTeam);

  // 2. Analizar lead con OpenAI
  const leadProfile = await analyzeLeadWithAI(lead);

  // 3. Matchear agente óptimo
  const optimalAgent = workload
    .filter(agent => agent.capacity > 0)
    .sort((a, b) => {
      // Priorizar por expertise y carga
      return (b.expertiseMatch - a.expertiseMatch) ||
             (a.currentLeads - b.currentLeads);
    })[0];

  return optimalAgent;
}
```

### 3. Dashboard de Productividad por Agente

**KPIs Individuales**:

```javascript
const agentKPIs = {
  'TKzZQuHjdRG9x4tpwpRx': { // Omar Curi
    totalLeads: 25,
    convertedLeads: 8,
    conversionRate: 32,
    avgResponseTime: 15, // minutos
    revenue: 450000, // MXN
    callsMade: 120,
    emailsSent: 45
  },
  // ... más agentes
};
```

### 4. Rotación Basada en Horarios

**Asignación por Turnos**:

```javascript
const schedule = {
  morning: [ // 8am - 2pm
    'TKzZQuHjdRG9x4tpwpRx', // Omar
    'jVFCuWoAZEFJ7x85sJTz'  // Mafer
  ],
  afternoon: [ // 2pm - 8pm
    'JWkZYNaQyKuRfPEnBeiC', // Pablo
    'UXlYNIkoELdoGreTa7Th'  // Raquel
  ]
};

function assignByTime(lead) {
  const hour = new Date().getHours();
  const shift = hour < 14 ? 'morning' : 'afternoon';
  const availableAgents = schedule[shift];

  return assignRoundRobin(lead, availableAgents);
}
```

### 5. Notificaciones Personalizadas

**Alertas por Telegram/WhatsApp**:

```javascript
const agentContacts = {
  'TKzZQuHjdRG9x4tpwpRx': {
    telegram: '@omar_curi',
    whatsapp: '+529991234567'
  },
  // ... más agentes
};

async function notifyAgentNewLead(agentId, lead) {
  const contact = agentContacts[agentId];

  await sendTelegramMessage(contact.telegram, `
    🔔 Nuevo lead asignado:
    👤 ${lead.name}
    📧 ${lead.email}
    📱 ${lead.phone}
    💰 Presupuesto: $${lead.budget}
  `);
}
```

---

## 🎯 KPIs Propuestos por Usuario

### Métricas Operacionales

```typescript
interface AgentMetrics {
  // Volumen
  leadsAssigned: number;
  leadsContacted: number;
  opportunitiesCreated: number;
  dealsClosed: number;

  // Eficiencia
  avgResponseTime: number;      // minutos
  contactRate: number;          // %
  conversionRate: number;       // %
  avgDealSize: number;          // MXN

  // Actividad
  callsMade: number;
  emailsSent: number;
  meetingsScheduled: number;
  tasksCompleted: number;

  // Revenue
  totalRevenue: number;         // MXN
  monthlyRecurring: number;     // MRR
  revenuePerLead: number;       // MXN

  // Calidad
  customerSatisfaction: number; // 1-10
  leadQualityScore: number;     // 1-10
  retentionRate: number;        // %
}
```

### Leaderboard del Equipo

```javascript
const leaderboard = [
  {
    rank: 1,
    agent: 'Omar Curi',
    conversionRate: 32,
    revenue: 450000,
    badge: '🥇 Top Closer'
  },
  {
    rank: 2,
    agent: 'Raquel Reyes',
    conversionRate: 28,
    revenue: 380000,
    badge: '🥈 Best Response Time'
  },
  // ... más
];
```

---

## 🔧 Implementación en Workflows

### Workflow n8n: Auto-Assignment

```javascript
// Nodo 1: Webhook Trigger (nuevo lead)
// Nodo 2: HTTP Request - Get Available Agents
const availableAgents = await fetch(
  `https://services.leadconnectorhq.com/users/?locationId=${locationId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Nodo 3: Function - Round Robin Logic
const salesTeam = availableAgents.filter(u =>
  u.email.includes('@selvadentrotulum.com') &&
  !u.deleted
);

const assignedAgent = salesTeam[leadCount % salesTeam.length];

// Nodo 4: HTTP Request - Update Contact in GHL
await updateContact(lead.id, {
  assignedTo: assignedAgent.id
});

// Nodo 5: Telegram/Email Notification
await notifyAgent(assignedAgent, lead);
```

---

## 📊 Visualizaciones Sugeridas para Dashboard

### 1. Gráfico de Barras: Leads por Agente

```
Omar Curi       ████████████████ 25 leads
Raquel Reyes    ███████████████  22 leads
Pablo Saracho   ██████████████   20 leads
Mafer Cienfuegos███████████      18 leads
Mariano Molina  ██████████       15 leads
```

### 2. Pie Chart: Distribución de Revenue

```
Omar:    30% ($450k)
Raquel:  25% ($380k)
Pablo:   20% ($300k)
Mafer:   15% ($225k)
Mariano: 10% ($150k)
```

### 3. Heatmap: Actividad por Hora

```
       8am 10am 12pm 2pm  4pm  6pm  8pm
Omar   ███  ████  ██  ███  ████ ███  █
Raquel ██   ███   ███ ████ ███  ██   █
Pablo  ███  ██    ███ ██   ███  ████ ██
```

---

## 🚀 Próximos Pasos

### Esta Semana

1. **Implementar Round-Robin Básico**
   - Crear workflow en n8n
   - Asignar nuevos leads automáticamente
   - Notificar al agente asignado

2. **Dashboard de Agentes**
   - Vista individual por agente
   - KPIs en tiempo real
   - Historial de leads asignados

### Próxima Semana

3. **Asignación Inteligente con IA**
   - Analizar perfil del lead
   - Matchear con expertise del agente
   - Considerar carga de trabajo actual

4. **Reportes de Productividad**
   - Reporte semanal por agente
   - Comparativa del equipo
   - Identificación de top performers

---

## ✅ Checklist

- [x] Usuarios extraídos exitosamente
- [x] Estructura de datos documentada
- [x] Mapeo JSON creado
- [x] Casos de uso identificados
- [x] KPIs propuestos
- [ ] Workflow de asignación implementado
- [ ] Dashboard de agentes creado
- [ ] Sistema de notificaciones activo
- [ ] Reportes de productividad funcionando

---

**Elaborado por**: Claude + Roger García Vital
**Fecha**: 2025-10-30
**Estado**: ✅ COMPLETO - Listo para implementación
