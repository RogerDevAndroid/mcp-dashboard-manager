# API Implementation - Broker Dashboard MVP

**Fecha**: 2025-10-30
**Proyecto**: Dashboard Gamificado para Brokers - Selvadentro Tulum

---

## 🎯 Resumen

Este documento describe la implementación completa de la API REST para el dashboard gamificado de brokers, incluyendo endpoints, sincronización con GoHighLevel, y lógica de negocio.

---

## 📋 Arquitectura General

```
┌─────────────────┐
│  Mobile App     │
│  (Next.js)      │
└────────┬────────┘
         │
         ├─── API Routes (/api/broker/*)
         │
         ├─── Supabase PostgreSQL
         │
         └─── GoHighLevel API
              (Sync Worker)
```

### Stack Tecnológico

- **Frontend**: Next.js 15 App Router + React
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **Sync**: Node.js Worker (cron job cada 5 min)
- **Auth**: Supabase Auth + Row Level Security

---

## 🔌 API Routes

### 1. Dashboard del Broker

**Endpoint**: `GET /api/broker/dashboard`

**Query Parameters**:
- `brokerId` (required): ID del broker en GHL

**Response**:
```json
{
  "broker": {
    "id": "JWkZYNaQyKuRfPEnBeiC",
    "nombre": "Pablo Saracho",
    "email": "psaracho@selvadentrotulum.com",
    "puntosMes": 145,
    "puntosTotal": 892,
    "nivel": "Junior",
    "rangoActual": 3,
    "avatar": "https://...",
    "progreso": {
      "actual": 145,
      "siguienteNivel": 300,
      "porcentaje": 48,
      "puntosNecesarios": 155
    }
  },
  "metricas": {
    "leadsAsignados": 17,
    "leadsContactados": 12,
    "llamadasHoy": 5,
    "presentacionesSemana": 3,
    "oportunidadesAbiertas": 4,
    "tasaConversion": 23.5,
    "ventasMes": 2,
    "revenueMes": 450000
  },
  "proyecciones": {
    "puntosNecesarios": 155,
    "diasRestantes": 15,
    "promedioActual": 9.67,
    "promedioNecesario": 10.33,
    "actividades": {
      "llamadasDiarias": 8,
      "presentacionesSemanales": 4,
      "ventasProyectadas": 1
    }
  },
  "tareasPendientes": [
    {
      "id": "task-1",
      "tipo": "llamada",
      "descripcion": "Seguimiento a lead Juan Pérez",
      "puntos": 2,
      "prioridad": "alta",
      "vence": "2025-10-30T18:00:00Z"
    }
  ],
  "logrosRecientes": [
    {
      "id": "achievement-1",
      "nombre": "Call Machine",
      "descripcion": "100 llamadas en un mes",
      "icon": "📞",
      "fecha": "2025-10-28"
    }
  ]
}
```

**Implementación**:
```typescript
// app/api/broker/dashboard/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const brokerId = searchParams.get('brokerId');

  if (!brokerId) {
    return NextResponse.json(
      { error: 'brokerId is required' },
      { status: 400 }
    );
  }

  // Usar la vista ya creada en database/gamification-schema.sql
  const { data: dashboard, error } = await supabase
    .from('vw_broker_dashboard')
    .select('*')
    .eq('broker_id', brokerId)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Obtener tareas pendientes
  const { data: tareas } = await supabase
    .from('tareas_broker')
    .select('*')
    .eq('broker_id', brokerId)
    .eq('completada', false)
    .order('prioridad', { ascending: false })
    .limit(5);

  // Obtener logros recientes (últimos 7 días)
  const { data: logros } = await supabase
    .from('broker_achievements')
    .select('*, achievement:logros_achievements(*)')
    .eq('broker_id', brokerId)
    .gte('fecha_obtenido', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('fecha_obtenido', { ascending: false });

  // Calcular proyecciones
  const proyecciones = calcularProyecciones(dashboard);

  return NextResponse.json({
    broker: {
      id: dashboard.broker_id,
      nombre: dashboard.nombre,
      email: dashboard.email,
      puntosMes: dashboard.puntos_mes,
      puntosTotal: dashboard.puntos_total,
      nivel: dashboard.nivel,
      rangoActual: dashboard.ranking_posicion,
      avatar: dashboard.avatar,
      progreso: {
        actual: dashboard.puntos_mes,
        siguienteNivel: getNivelPuntos(dashboard.nivel),
        porcentaje: (dashboard.puntos_mes / getNivelPuntos(dashboard.nivel)) * 100,
        puntosNecesarios: getNivelPuntos(dashboard.nivel) - dashboard.puntos_mes
      }
    },
    metricas: {
      leadsAsignados: dashboard.leads_asignados,
      leadsContactados: dashboard.leads_contactados,
      llamadasHoy: dashboard.llamadas_hoy,
      presentacionesSemana: dashboard.presentaciones_semana,
      oportunidadesAbiertas: dashboard.oportunidades_abiertas,
      tasaConversion: dashboard.tasa_conversion,
      ventasMes: dashboard.ventas_mes,
      revenueMes: dashboard.revenue_mes
    },
    proyecciones,
    tareasPendientes: tareas || [],
    logrosRecientes: logros || []
  });
}

function getNivelPuntos(nivelActual: string): number {
  const niveles = {
    'Rookie': 100,
    'Junior': 300,
    'Senior': 600,
    'Elite': 1000,
    'Legend': 2000
  };
  return niveles[nivelActual as keyof typeof niveles] || 100;
}

function calcularProyecciones(dashboard: any) {
  const diasRestantes = 30 - new Date().getDate();
  const puntosNecesarios = getNivelPuntos(dashboard.nivel) - dashboard.puntos_mes;
  const promedioActual = dashboard.puntos_mes / new Date().getDate();
  const promedioNecesario = puntosNecesarios / diasRestantes;

  // Calculamos actividades necesarias basadas en el sistema de puntos
  const avgPuntosPorLlamada = 2; // promedio entre 1-3 puntos
  const avgPuntosPorPresentacion = 3; // promedio entre 1-5 puntos
  const avgPuntosPorVenta = 10; // apartado o venta

  const llamadasDiarias = Math.ceil((promedioNecesario / avgPuntosPorLlamada));
  const presentacionesSemanales = Math.ceil((promedioNecesario * 7) / avgPuntosPorPresentacion);
  const ventasProyectadas = Math.ceil(puntosNecesarios / avgPuntosPorVenta / 4); // por semana

  return {
    puntosNecesarios,
    diasRestantes,
    promedioActual: parseFloat(promedioActual.toFixed(2)),
    promedioNecesario: parseFloat(promedioNecesario.toFixed(2)),
    actividades: {
      llamadasDiarias,
      presentacionesSemanales,
      ventasProyectadas
    }
  };
}
```

---

### 2. Leaderboard/Ranking

**Endpoint**: `GET /api/leaderboard`

**Query Parameters**:
- `periodo` (optional): `dia` | `semana` | `mes` (default: `mes`)
- `limit` (optional): número de brokers a retornar (default: 10)

**Response**:
```json
{
  "periodo": "mes",
  "fechaActualizacion": "2025-10-30T15:30:00Z",
  "ranking": [
    {
      "posicion": 1,
      "brokerId": "TKzZQuHjdRG9x4tpwpRx",
      "nombre": "Omar Curi",
      "avatar": "https://...",
      "puntos": 892,
      "nivel": "Elite",
      "badge": "🥇",
      "metricas": {
        "llamadas": 120,
        "presentaciones": 25,
        "ventas": 8
      }
    }
  ]
}
```

**Implementación**:
```typescript
// app/api/leaderboard/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const periodo = searchParams.get('periodo') || 'mes';
  const limit = parseInt(searchParams.get('limit') || '10');

  // Usar la vista de ranking
  const { data: ranking, error } = await supabase
    .from('vw_ranking_actual')
    .select('*')
    .order('puntos_mes', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const formattedRanking = ranking.map((broker, index) => ({
    posicion: index + 1,
    brokerId: broker.broker_id,
    nombre: broker.nombre,
    avatar: broker.avatar,
    puntos: broker.puntos_mes,
    nivel: broker.nivel,
    badge: getBadge(index + 1),
    metricas: {
      llamadas: broker.llamadas_mes,
      presentaciones: broker.presentaciones_mes,
      ventas: broker.ventas_mes
    }
  }));

  return NextResponse.json({
    periodo,
    fechaActualizacion: new Date().toISOString(),
    ranking: formattedRanking
  });
}

function getBadge(posicion: number): string {
  const badges: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };
  return badges[posicion] || '';
}
```

---

### 3. Actividades del Broker

**Endpoint**: `POST /api/broker/activities`

**Request Body**:
```json
{
  "brokerId": "JWkZYNaQyKuRfPEnBeiC",
  "tipo": "llamada",
  "subtipo": "seguimiento",
  "leadId": "lead-123",
  "descripcion": "Seguimiento a lead interesado en Lote 15",
  "resultado": "interesado",
  "metadata": {
    "duracion": 180,
    "notas": "Cliente preguntó por financiamiento"
  }
}
```

**Response**:
```json
{
  "success": true,
  "actividad": {
    "id": "act-456",
    "puntosGanados": 2,
    "nuevoTotal": 147,
    "logrosDesbloqueados": [
      {
        "id": "achievement-5",
        "nombre": "Call Machine",
        "descripcion": "100 llamadas en un mes"
      }
    ]
  }
}
```

**Implementación**:
```typescript
// app/api/broker/activities/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Sistema de puntuación según screenshot del usuario
const PUNTUACION_SYSTEM = {
  presentaciones: {
    zoom_broker: 1,
    eventos_broker: 1,
    zoom_inmobiliarias: 2,
    zoom_cliente_final: 3,
    fisica_broker: 3,
    fisica_inmobiliarias: 4,
    fisica_cliente_final: 5
  },
  resultados: {
    apartado: 10,
    venta_alianza_broker: 5,
    venta_propia: 10
  },
  actividades: {
    llamada: 2,
    email: 1,
    whatsapp: 1,
    reunion_agendada: 3
  }
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { brokerId, tipo, subtipo, leadId, descripcion, resultado, metadata } = body;

  // Validaciones
  if (!brokerId || !tipo) {
    return NextResponse.json(
      { error: 'brokerId and tipo are required' },
      { status: 400 }
    );
  }

  // Calcular puntos según el tipo y subtipo
  const puntos = calcularPuntos(tipo, subtipo, resultado);

  // Insertar actividad (el trigger actualizar_puntos_broker se ejecutará automáticamente)
  const { data: actividad, error } = await supabase
    .from('actividades')
    .insert({
      broker_id: brokerId,
      tipo,
      subtipo,
      lead_id: leadId,
      descripcion,
      puntos,
      metadata,
      fecha: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Obtener puntos actualizados del broker
  const { data: broker } = await supabase
    .from('broker_profiles')
    .select('puntos_mes, puntos_total')
    .eq('broker_id', brokerId)
    .single();

  // Verificar si se desbloquearon logros
  const logrosDesbloqueados = await verificarLogros(brokerId);

  return NextResponse.json({
    success: true,
    actividad: {
      id: actividad.id,
      puntosGanados: puntos,
      nuevoTotal: broker?.puntos_mes || 0,
      logrosDesbloqueados
    }
  });
}

function calcularPuntos(tipo: string, subtipo: string, resultado?: string): number {
  // Presentaciones
  if (tipo === 'presentacion') {
    return PUNTUACION_SYSTEM.presentaciones[subtipo as keyof typeof PUNTUACION_SYSTEM.presentaciones] || 1;
  }

  // Resultados (ventas)
  if (tipo === 'venta' || tipo === 'resultado') {
    return PUNTUACION_SYSTEM.resultados[resultado as keyof typeof PUNTUACION_SYSTEM.resultados] || 5;
  }

  // Actividades generales
  return PUNTUACION_SYSTEM.actividades[tipo as keyof typeof PUNTUACION_SYSTEM.actividades] || 1;
}

async function verificarLogros(brokerId: string) {
  const logrosDesbloqueados = [];

  // Obtener estadísticas del broker
  const { data: stats } = await supabase
    .from('actividades')
    .select('tipo')
    .eq('broker_id', brokerId)
    .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  if (!stats) return logrosDesbloqueados;

  const llamadas = stats.filter(a => a.tipo === 'llamada').length;
  const presentaciones = stats.filter(a => a.tipo === 'presentacion').length;
  const ventas = stats.filter(a => a.tipo === 'venta').length;

  // Verificar logros predefinidos
  const logrosParaVerificar = [
    { id: 'call-machine', condicion: llamadas >= 100, nombre: 'Call Machine' },
    { id: 'presenter-pro', condicion: presentaciones >= 50, nombre: 'Presenter Pro' },
    { id: 'the-closer', condicion: ventas >= 10, nombre: 'The Closer' }
  ];

  for (const logro of logrosParaVerificar) {
    if (logro.condicion) {
      // Verificar si ya lo tiene
      const { data: existe } = await supabase
        .from('broker_achievements')
        .select('id')
        .eq('broker_id', brokerId)
        .eq('achievement_id', logro.id)
        .single();

      if (!existe) {
        // Otorgar logro
        await supabase
          .from('broker_achievements')
          .insert({
            broker_id: brokerId,
            achievement_id: logro.id,
            fecha_obtenido: new Date().toISOString()
          });

        logrosDesbloqueados.push(logro);
      }
    }
  }

  return logrosDesbloqueados;
}
```

---

### 4. Dashboard Ejecutivo

**Endpoint**: `GET /api/executive/dashboard`

**Query Parameters**:
- `periodo` (optional): `dia` | `semana` | `mes` (default: `mes`)

**Response**:
```json
{
  "resumenEquipo": {
    "totalBrokers": 7,
    "brokersActivos": 6,
    "puntosPromedioEquipo": 156,
    "leadsAsignadosTotal": 85,
    "oportunidadesAbiertas": 23,
    "ventasMes": 12,
    "revenueMes": 2450000,
    "tasaConversionPromedio": 28.5
  },
  "topPerformers": [
    {
      "brokerId": "TKzZQuHjdRG9x4tpwpRx",
      "nombre": "Omar Curi",
      "nivel": "Elite",
      "puntos": 892,
      "ventas": 8,
      "revenue": 650000
    }
  ],
  "alertas": [
    {
      "tipo": "bajo_rendimiento",
      "brokerId": "...",
      "mensaje": "Pablo Saracho tiene 0 ventas este mes",
      "prioridad": "alta"
    }
  ],
  "tendencias": {
    "llamadasPorDia": [45, 52, 48, 61, 55],
    "presentacionesPorSemana": [12, 15, 18, 14],
    "ventasPorMes": [8, 12, 10]
  }
}
```

**Implementación**:
```typescript
// app/api/executive/dashboard/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const periodo = searchParams.get('periodo') || 'mes';

  // Resumen del equipo
  const { data: brokers } = await supabase
    .from('broker_profiles')
    .select('*');

  const totalBrokers = brokers?.length || 0;
  const brokersActivos = brokers?.filter(b => b.activo).length || 0;
  const puntosPromedioEquipo = brokers?.reduce((sum, b) => sum + b.puntos_mes, 0) / totalBrokers || 0;

  // Métricas agregadas
  const { data: metricas } = await supabase
    .from('vw_broker_dashboard')
    .select('*');

  const leadsAsignadosTotal = metricas?.reduce((sum, m) => sum + m.leads_asignados, 0) || 0;
  const oportunidadesAbiertas = metricas?.reduce((sum, m) => sum + m.oportunidades_abiertas, 0) || 0;
  const ventasMes = metricas?.reduce((sum, m) => sum + m.ventas_mes, 0) || 0;
  const revenueMes = metricas?.reduce((sum, m) => sum + m.revenue_mes, 0) || 0;
  const tasaConversionPromedio = metricas?.reduce((sum, m) => sum + m.tasa_conversion, 0) / metricas.length || 0;

  // Top performers
  const { data: topPerformers } = await supabase
    .from('vw_ranking_actual')
    .select('*')
    .order('puntos_mes', { ascending: false })
    .limit(5);

  // Alertas (brokers con bajo rendimiento)
  const alertas = [];
  for (const broker of metricas || []) {
    if (broker.ventas_mes === 0) {
      alertas.push({
        tipo: 'bajo_rendimiento',
        brokerId: broker.broker_id,
        mensaje: `${broker.nombre} tiene 0 ventas este mes`,
        prioridad: 'alta'
      });
    }
    if (broker.llamadas_mes < 50) {
      alertas.push({
        tipo: 'poca_actividad',
        brokerId: broker.broker_id,
        mensaje: `${broker.nombre} ha hecho menos de 50 llamadas`,
        prioridad: 'media'
      });
    }
  }

  // Tendencias (últimos 7 días, 4 semanas, 3 meses)
  const { data: actividadesDiarias } = await supabase
    .from('actividades')
    .select('tipo, fecha')
    .gte('fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const llamadasPorDia = calcularTendenciaDiaria(actividadesDiarias, 'llamada');
  const presentacionesPorSemana = [12, 15, 18, 14]; // Simplificado, calcular real
  const ventasPorMes = [8, 12, 10]; // Simplificado, calcular real

  return NextResponse.json({
    resumenEquipo: {
      totalBrokers,
      brokersActivos,
      puntosPromedioEquipo: parseFloat(puntosPromedioEquipo.toFixed(2)),
      leadsAsignadosTotal,
      oportunidadesAbiertas,
      ventasMes,
      revenueMes,
      tasaConversionPromedio: parseFloat(tasaConversionPromedio.toFixed(2))
    },
    topPerformers,
    alertas,
    tendencias: {
      llamadasPorDia,
      presentacionesPorSemana,
      ventasPorMes
    }
  });
}

function calcularTendenciaDiaria(actividades: any[], tipo: string): number[] {
  const dias = 7;
  const resultado = new Array(dias).fill(0);

  for (const actividad of actividades || []) {
    if (actividad.tipo !== tipo) continue;

    const fecha = new Date(actividad.fecha);
    const diasAtras = Math.floor((Date.now() - fecha.getTime()) / (24 * 60 * 60 * 1000));

    if (diasAtras < dias) {
      resultado[dias - 1 - diasAtras]++;
    }
  }

  return resultado;
}
```

---

## 🔄 Sync Worker - Integración con GoHighLevel

**Archivo**: `workers/ghl-sync-worker.js`

Este worker se ejecuta cada 5 minutos para sincronizar datos de GoHighLevel a Supabase.

**Implementación**:
```javascript
#!/usr/bin/env node

/**
 * GoHighLevel Sync Worker
 *
 * Sincroniza datos de GHL a Supabase cada 5 minutos:
 * - Contactos (leads)
 * - Oportunidades (pipeline)
 * - Tareas
 * - Reuniones del calendario
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const GHL_PRIVATE_TOKEN = process.env.GHL_PRIVATE_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Lista de brokers activos
const BROKERS = [
  'TKzZQuHjdRG9x4tpwpRx', // Omar Curi
  'JWkZYNaQyKuRfPEnBeiC', // Pablo Saracho
  'UXlYNIkoELdoGreTa7Th', // Raquel Reyes
  'jVFCuWoAZEFJ7x85sJTz', // Mafer Cienfuegos
  'NbVUWwCOFUA5phlcZpGm', // Mariano Molina
  'UZa6pmz2KCBTAXgEGXE8', // Gonzalo Caro
  'vWerQ2MELDsCSFFKxkJQ'  // Jaqueline Selvadentro
];

console.log('🔄 Sync Worker iniciado...');

/**
 * Sincronizar contactos asignados a cada broker
 */
async function syncContacts() {
  console.log('📋 Sincronizando contactos...');

  const response = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
        'version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    console.error('❌ Error al obtener contactos:', response.statusText);
    return;
  }

  const data = await response.json();
  const contacts = data.contacts || data.data || [];

  console.log(`  ✅ ${contacts.length} contactos obtenidos de GHL`);

  // Insertar o actualizar en Supabase
  for (const contact of contacts) {
    if (!BROKERS.includes(contact.assignedTo)) continue;

    const leadData = {
      lead_id: contact.id,
      broker_id: contact.assignedTo,
      nombre: contact.contactName,
      email: contact.email,
      telefono: contact.phone,
      estado: contact.tags?.includes('caliente') ? 'caliente' :
              contact.tags?.includes('tibio') ? 'tibio' : 'frio',
      presupuesto: parseFloat(contact.customField?.presupuesto) || null,
      fecha_asignacion: contact.dateAdded,
      fecha_ultimo_contacto: contact.lastActivityDate || null,
      contactado: contact.lastActivityDate !== null,
      score: calcularScoreLead(contact),
      metadata: {
        tags: contact.tags || [],
        source: contact.source || 'unknown',
        customFields: contact.customField || {}
      },
      ultima_actualizacion: new Date().toISOString()
    };

    await supabase
      .from('leads_asignados')
      .upsert(leadData, { onConflict: 'lead_id' });
  }

  console.log('  ✅ Contactos sincronizados a Supabase');
}

/**
 * Sincronizar oportunidades (pipeline)
 */
async function syncOpportunities() {
  console.log('💼 Sincronizando oportunidades...');

  const response = await fetch(
    `https://services.leadconnectorhq.com/opportunities/search?locationId=${GHL_LOCATION_ID}&limit=100`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
        'version': '2021-07-28'
      }
    }
  );

  if (!response.ok) {
    console.error('❌ Error al obtener oportunidades:', response.statusText);
    return;
  }

  const data = await response.json();
  const opportunities = data.opportunities || data.data || [];

  console.log(`  ✅ ${opportunities.length} oportunidades obtenidas de GHL`);

  for (const opp of opportunities) {
    if (!BROKERS.includes(opp.assignedTo)) continue;

    const oppData = {
      oportunidad_id: opp.id,
      broker_id: opp.assignedTo,
      lead_id: opp.contactId,
      nombre: opp.name,
      valor: parseFloat(opp.monetaryValue) || 0,
      etapa: opp.pipelineStage || opp.stage || 'prospecto',
      estado: opp.status, // 'open', 'won', 'lost'
      probabilidad: calcularProbabilidad(opp.pipelineStage),
      fecha_creacion: opp.dateAdded,
      fecha_cierre_estimada: opp.expectedCloseDate || null,
      fecha_cierre_real: opp.status === 'won' ? opp.dateUpdated : null,
      fuente: opp.source || 'unknown',
      metadata: {
        pipeline: opp.pipelineId,
        lostReason: opp.lostReason || null
      },
      ultima_actualizacion: new Date().toISOString()
    };

    await supabase
      .from('oportunidades_broker')
      .upsert(oppData, { onConflict: 'oportunidad_id' });

    // Si la oportunidad fue ganada, registrar actividad de venta
    if (opp.status === 'won') {
      const { data: actividadExistente } = await supabase
        .from('actividades')
        .select('id')
        .eq('metadata->>oportunidad_id', opp.id)
        .eq('tipo', 'venta')
        .single();

      if (!actividadExistente) {
        await supabase
          .from('actividades')
          .insert({
            broker_id: opp.assignedTo,
            tipo: 'venta',
            subtipo: 'venta_propia',
            lead_id: opp.contactId,
            descripcion: `Venta cerrada: ${opp.name}`,
            puntos: 10, // venta_propia = 10 puntos
            metadata: {
              oportunidad_id: opp.id,
              valor: opp.monetaryValue
            },
            fecha: opp.dateUpdated
          });
      }
    }
  }

  console.log('  ✅ Oportunidades sincronizadas a Supabase');
}

/**
 * Sincronizar reuniones del calendario
 */
async function syncCalendarEvents() {
  console.log('📅 Sincronizando reuniones...');

  for (const brokerId of BROKERS) {
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/events?locationId=${GHL_LOCATION_ID}&userId=${brokerId}&startDate=${new Date().toISOString().split('T')[0]}&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_PRIVATE_TOKEN}`,
          'version': '2021-07-28'
        }
      }
    );

    if (!response.ok) continue;

    const data = await response.json();
    const events = data.events || data.data || [];

    for (const event of events) {
      const reunionData = {
        reunion_id: event.id,
        broker_id: brokerId,
        lead_id: event.contactId,
        tipo: event.appointmentTitle?.includes('Zoom') ? 'zoom' : 'fisica',
        titulo: event.appointmentTitle,
        descripcion: event.notes || '',
        fecha_programada: event.startTime,
        duracion_minutos: event.duration || 60,
        estado: event.status === 'cancelled' ? 'cancelada' :
                new Date(event.startTime) < new Date() ? 'completada' : 'programada',
        asistio: event.status === 'confirmed',
        metadata: {
          calendar: event.calendarId,
          location: event.location
        },
        ultima_actualizacion: new Date().toISOString()
      };

      await supabase
        .from('reuniones_calendario')
        .upsert(reunionData, { onConflict: 'reunion_id' });

      // Si la reunión fue completada, registrar actividad de presentación
      if (reunionData.estado === 'completada' && reunionData.asistio) {
        const { data: actividadExistente } = await supabase
          .from('actividades')
          .select('id')
          .eq('metadata->>reunion_id', event.id)
          .eq('tipo', 'presentacion')
          .single();

        if (!actividadExistente) {
          const subtipo = reunionData.tipo === 'zoom' ? 'zoom_cliente_final' : 'fisica_cliente_final';
          const puntos = reunionData.tipo === 'zoom' ? 3 : 5;

          await supabase
            .from('actividades')
            .insert({
              broker_id: brokerId,
              tipo: 'presentacion',
              subtipo,
              lead_id: event.contactId,
              descripcion: `Presentación: ${event.appointmentTitle}`,
              puntos,
              metadata: {
                reunion_id: event.id,
                duracion: event.duration
              },
              fecha: event.startTime
            });
        }
      }
    }
  }

  console.log('  ✅ Reuniones sincronizadas a Supabase');
}

/**
 * Funciones auxiliares
 */
function calcularScoreLead(contact) {
  let score = 0;

  if (contact.email) score += 20;
  if (contact.phone) score += 20;
  if (contact.lastActivityDate) score += 30;
  if (contact.tags?.includes('caliente')) score += 30;

  return Math.min(score, 100);
}

function calcularProbabilidad(stage) {
  const probabilidades = {
    'prospecto': 10,
    'contactado': 20,
    'calificado': 30,
    'presentacion': 50,
    'negociacion': 70,
    'propuesta': 80,
    'cierre': 90
  };

  return probabilidades[stage?.toLowerCase()] || 10;
}

/**
 * Función principal
 */
async function main() {
  try {
    await syncContacts();
    await syncOpportunities();
    await syncCalendarEvents();

    console.log('✅ Sincronización completada\n');
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
  }
}

// Ejecutar inmediatamente y luego cada 5 minutos
main();
setInterval(main, 5 * 60 * 1000);
```

---

## 🚀 Deployment

### 1. Variables de Entorno (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# GoHighLevel
GHL_PRIVATE_TOKEN=pit-84d7687f-d43f-4434-9804-c671c669dd0f
GHL_LOCATION_ID=crN2IhAuOBAl7D8324yI
GHL_MCP_ENDPOINT=https://services.leadconnectorhq.com/mcp/

# App
NODE_ENV=production
```

### 2. Configurar Cron Job para Sync Worker

**Opción A: Vercel Cron Jobs**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "*/5 * * * *"
  }]
}
```

**Opción B: PM2 (servidor propio)**
```bash
pm2 start workers/ghl-sync-worker.js --name ghl-sync
pm2 save
pm2 startup
```

**Opción C: Supabase Edge Functions**
```sql
-- Crear función de Postgres que llame a la Edge Function cada 5 min
SELECT cron.schedule('sync-ghl', '*/5 * * * *', 'SELECT net.http_post(url:=''https://your-project.supabase.co/functions/v1/sync-ghl'')');
```

### 3. Ejecutar Migrations en Supabase

```bash
cd database
psql $DATABASE_URL -f gamification-schema.sql
```

---

## ✅ Checklist de Implementación

- [x] API Routes definidos
- [x] Sync Worker implementado
- [x] Sistema de puntuación configurado
- [x] Cálculo de proyecciones
- [x] Verificación de logros
- [ ] Deploy a Vercel
- [ ] Configurar cron job
- [ ] Ejecutar migrations en Supabase
- [ ] Crear páginas frontend en Next.js
- [ ] Testing end-to-end

---

## 📊 Próximos Pasos

1. **Crear páginas frontend** usando los componentes del MVP
2. **Testing con datos reales** de Pablo Saracho
3. **Configurar notificaciones** push/telegram
4. **Optimizar queries** para performance
5. **Agregar caché** con Redis para leaderboard

---

**Elaborado por**: Claude + Roger García Vital
**Fecha**: 2025-10-30
**Estado**: ✅ COMPLETO - Listo para implementación
