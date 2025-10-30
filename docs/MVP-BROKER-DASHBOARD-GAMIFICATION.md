# MVP: Dashboard Mobile para Brokers con Gamificación

**Proyecto**: Selvadentro Tulum - Sistema de Gestión de Brokers
**Fecha**: 2025-10-30
**Objetivo**: Dashboard mobile gamificado con proyecciones de crecimiento

---

## 🎯 VISIÓN DEL MVP

Un sistema completo de gamificación y seguimiento para brokers inmobiliarios que:

1. **Calcula puntos en tiempo real** basado en actividades y resultados
2. **Muestra una ruta de crecimiento** con proyecciones personalizadas
3. **Gamifica el proceso** con leaderboards, badges y logros
4. **Proyecta acciones necesarias** para subir de puesto
5. **Dashboard ejecutivo** para dirección con vista 360°

---

## 📊 SISTEMA DE PUNTUACIÓN

### Estructura de Puntos (Basada en tu Imagen)

```typescript
interface PuntuacionSystem {
  // PRESENTACIONES (Actividades)
  presentaciones: {
    zoomBroker: 1,                    // Reunión virtual con otro broker
    eventosBroker: 1,                 // Evento de networking
    zoomInmobiliarias: 2,             // Presentación a desarrolladora (+3 = 5 total)
    zoomClienteFinal: 3,              // Presentación directa a cliente
    fisicaBroker: 3,                  // Reunión física con broker
    fisicaInmobiliarias: 4,           // Visita física a desarrolladora (+3 = 7 total)
    fisicaClienteFinal: 5             // Visita física con cliente (cierre)
  };

  // RESULTADOS (Conversiones)
  resultados: {
    apartado: 10,                     // Cliente apartó propiedad
    ventaAlianzaBroker: 5,            // Venta con alianza/referencia
    ventaPropia: 10                   // Venta directa del broker
  };

  // METAS GRUPALES (Bonos)
  metasGrupales: {
    puntosMes: number,                // Puntos acumulados vs meta
    ventasMes: number                 // Ventas completadas vs meta
  };
}
```

### Ejemplo de Cálculo Real

```javascript
// Actividades de Pablo Saracho hoy:
const actividadesHoy = {
  zoomClienteFinal: 2,      // 2 presentaciones virtuales = 6 pts
  fisicaInmobiliarias: 1,   // 1 visita a desarrolladora = 7 pts
  llamadasCalificacion: 15, // 15 llamadas (nuevo) = 15 pts
  emailsEnviados: 10        // 10 emails de seguimiento = 5 pts
};

// Resultados de la semana:
const resultadosSemana = {
  apartado: 1,              // 1 apartado = 10 pts
  ventaPropia: 0            // Sin ventas = 0 pts
};

// Total:
const puntosHoy = 6 + 7 + 15 + 5 = 33 puntos
const puntosSemana = 33 * 5 dias + 10 apartado = 175 puntos
const puntosMes = 483 puntos (como en tu imagen)
```

---

## 🏆 SISTEMA DE GAMIFICACIÓN EXTENDIDO

### Niveles y Rangos

```typescript
interface BrokerLevel {
  nivel: string;
  puntosMinimos: number;
  puntosMaximos: number;
  beneficios: string[];
  badge: string;
  color: string;
}

const BROKER_LEVELS: BrokerLevel[] = [
  {
    nivel: "Rookie",
    puntosMinimos: 0,
    puntosMaximos: 100,
    beneficios: [
      "Acceso a plataforma básica",
      "Comisión estándar 3%",
      "Soporte de lunes a viernes"
    ],
    badge: "🌱",
    color: "#94A3B8"
  },
  {
    nivel: "Junior",
    puntosMinimos: 101,
    puntosMaximos: 300,
    beneficios: [
      "Acceso a leads calientes",
      "Comisión 3.5%",
      "1 asistente virtual",
      "Training semanal"
    ],
    badge: "⭐",
    color: "#3B82F6"
  },
  {
    nivel: "Senior",
    puntosMinimos: 301,
    puntosMaximos: 600,
    beneficios: [
      "Prioridad en leads premium",
      "Comisión 4%",
      "Asistente dedicado",
      "Bonos trimestrales",
      "Car allowance"
    ],
    badge: "💎",
    color: "#8B5CF6"
  },
  {
    nivel: "Elite",
    puntosMinimos: 601,
    puntosMaximos: 1000,
    beneficios: [
      "First pick en nuevos proyectos",
      "Comisión 4.5%",
      "Equipo de 2 asistentes",
      "Bonos mensuales",
      "Car + gastos",
      "Viajes incentivo"
    ],
    badge: "👑",
    color: "#F59E0B"
  },
  {
    nivel: "Legend",
    puntosMinimos: 1001,
    puntosMaximos: Infinity,
    beneficios: [
      "Co-ownership en proyectos",
      "Comisión 5% + equity",
      "Equipo completo",
      "Oficina privada",
      "Profit sharing",
      "Libertad total"
    ],
    badge: "🚀",
    color: "#EF4444"
  }
];
```

### Logros y Badges

```typescript
interface Achievement {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  puntos: number;
  criterio: (broker: BrokerData) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  // Velocidad
  {
    id: "flash_responder",
    nombre: "Flash Responder",
    descripcion: "Responder a 10 leads en <5 minutos",
    icono: "⚡",
    puntos: 20,
    criterio: (b) => b.leadsRespondidosRapido >= 10
  },
  {
    id: "early_bird",
    nombre: "Early Bird",
    descripcion: "Primera llamada del día antes de 8:30 AM",
    icono: "🌅",
    puntos: 5,
    criterio: (b) => b.primeraLlamada < "08:30"
  },

  // Volumen
  {
    id: "call_machine",
    nombre: "Call Machine",
    descripcion: "50 llamadas en un día",
    icono: "📞",
    puntos: 30,
    criterio: (b) => b.llamadasHoy >= 50
  },
  {
    id: "meeting_master",
    nombre: "Meeting Master",
    descripcion: "5 presentaciones en un día",
    icono: "🎯",
    puntos: 25,
    criterio: (b) => b.presentacionesHoy >= 5
  },

  // Conversión
  {
    id: "closer",
    nombre: "The Closer",
    descripcion: "3 ventas en una semana",
    icono: "💰",
    puntos: 100,
    criterio: (b) => b.ventasSemana >= 3
  },
  {
    id: "perfect_week",
    nombre: "Perfect Week",
    descripcion: "100% de metas semanales cumplidas",
    icono: "✨",
    puntos: 50,
    criterio: (b) => b.metasSemanalesCumplidas === 100
  },

  // Consistencia
  {
    id: "iron_man",
    nombre: "Iron Man",
    descripcion: "30 días consecutivos con actividad",
    icono: "🦾",
    puntos: 75,
    criterio: (b) => b.diasConsecutivosActivo >= 30
  },
  {
    id: "team_player",
    nombre: "Team Player",
    descripcion: "5 referencias a otros brokers",
    icono: "🤝",
    puntos: 40,
    criterio: (b) => b.referenciasOtrosBrokers >= 5
  },

  // Especiales
  {
    id: "whale_hunter",
    nombre: "Whale Hunter",
    descripcion: "Cerrar deal >$1M MXN",
    icono: "🐋",
    puntos: 150,
    criterio: (b) => b.dealMasGrande >= 1000000
  },
  {
    id: "comeback_kid",
    nombre: "Comeback Kid",
    descripcion: "Recuperar lead perdido y cerrar",
    icono: "🔄",
    puntos: 60,
    criterio: (b) => b.leadsRecuperados >= 1
  }
];
```

---

## 📱 DISEÑO DEL DASHBOARD MOBILE

### Pantalla Principal - Home

```typescript
// src/components/broker/MobileDashboard.tsx

interface BrokerDashboardProps {
  brokerId: string;
  brokerData: BrokerData;
}

export function MobileDashboard({ brokerId, brokerData }: BrokerDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">

      {/* Header con Avatar y Puntos */}
      <DashboardHeader broker={brokerData} />

      {/* Progreso de Nivel */}
      <LevelProgress broker={brokerData} />

      {/* Cards de Métricas Principales */}
      <MetricsGrid broker={brokerData} />

      {/* Ruta de Crecimiento */}
      <GrowthPath broker={brokerData} />

      {/* Tareas del Día */}
      <DailyTasks broker={brokerData} />

      {/* Actividad Reciente */}
      <RecentActivity broker={brokerData} />

      {/* Leaderboard Mini */}
      <MiniLeaderboard />

      {/* Bottom Navigation */}
      <BottomNav activePage="home" />

    </div>
  );
}
```

### Componente: Header

```tsx
// Header con Avatar, Puntos y Notificaciones

function DashboardHeader({ broker }: { broker: BrokerData }) {
  const currentLevel = getCurrentLevel(broker.puntosMes);

  return (
    <div className="bg-white rounded-b-3xl shadow-lg px-6 py-8">
      <div className="flex items-center justify-between">

        {/* Avatar y Nombre */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={broker.avatar}
              alt={broker.nombre}
              className="w-16 h-16 rounded-full border-4 border-blue-500"
            />
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
              <span className="text-2xl">{currentLevel.badge}</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {broker.nombre}
            </h1>
            <p className="text-sm text-slate-600">
              {currentLevel.nivel} • {broker.puntosMes} pts
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        <button className="relative p-2">
          <BellIcon className="w-6 h-6 text-slate-600" />
          {broker.notificacionesPendientes > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {broker.notificacionesPendientes}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
```

### Componente: Progreso de Nivel

```tsx
function LevelProgress({ broker }: { broker: BrokerData }) {
  const currentLevel = getCurrentLevel(broker.puntosMes);
  const nextLevel = getNextLevel(broker.puntosMes);

  const progress = nextLevel
    ? ((broker.puntosMes - currentLevel.puntosMinimos) /
       (nextLevel.puntosMinimos - currentLevel.puntosMinimos)) * 100
    : 100;

  const puntosParaSiguienteNivel = nextLevel
    ? nextLevel.puntosMinimos - broker.puntosMes
    : 0;

  return (
    <div className="mx-6 -mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm opacity-90">Nivel Actual</p>
          <p className="text-2xl font-bold">{currentLevel.nivel}</p>
        </div>

        {nextLevel && (
          <div className="text-right">
            <p className="text-sm opacity-90">Próximo Nivel</p>
            <p className="text-xl font-bold">{nextLevel.nivel}</p>
          </div>
        )}
      </div>

      {/* Barra de Progreso */}
      <div className="relative">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span>{broker.puntosMes} pts</span>
          {nextLevel && (
            <span>{nextLevel.puntosMinimos} pts</span>
          )}
        </div>
      </div>

      {/* Mensaje Motivacional */}
      {puntosParaSiguienteNivel > 0 && (
        <p className="mt-3 text-sm text-center opacity-90">
          🎯 ¡Solo {puntosParaSiguienteNivel} puntos para {nextLevel!.nivel}!
        </p>
      )}
    </div>
  );
}
```

### Componente: Métricas Grid

```tsx
function MetricsGrid({ broker }: { broker: BrokerData }) {
  return (
    <div className="grid grid-cols-2 gap-4 px-6 mt-6">

      {/* Puntos del Mes */}
      <MetricCard
        title="Puntos del Mes"
        value={broker.puntosMes}
        meta={broker.metaPuntosMes}
        icon="🏆"
        trend={broker.tendenciaPuntos}
        color="blue"
      />

      {/* Apartados */}
      <MetricCard
        title="Apartados"
        value={broker.apartados}
        meta={broker.metaApartados}
        icon="🎯"
        progress={broker.apartados / broker.metaApartados * 100}
        color="purple"
      />

      {/* Ventas */}
      <MetricCard
        title="Ventas"
        value={broker.ventas}
        meta={broker.metaVentas}
        icon="💰"
        progress={broker.ventas / broker.metaVentas * 100}
        color="green"
      />

      {/* Agentes Activos */}
      <MetricCard
        title="Leads Activos"
        value={broker.leadsActivos}
        subtitle={`${broker.proximasReuniones} reuniones`}
        icon="👥"
        color="orange"
      />
    </div>
  );
}

function MetricCard({ title, value, meta, icon, trend, progress, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">

      {/* Icono */}
      <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center text-2xl mb-3`}>
        {icon}
      </div>

      {/* Título */}
      <p className="text-sm text-slate-600 mb-1">{title}</p>

      {/* Valor */}
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {meta && (
          <span className="text-sm text-slate-500">/ {meta}</span>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${color}-500 transition-all`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {/* Trend o Subtitle */}
      {trend && (
        <p className={`mt-2 text-xs flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% vs sem anterior
        </p>
      )}

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
```

---

## 🎯 RUTA DE CRECIMIENTO CON PROYECCIONES

### Componente: Growth Path

```tsx
function GrowthPath({ broker }: { broker: BrokerData }) {
  const projections = calculateProjections(broker);
  const nextLevel = getNextLevel(broker.puntosMes);

  return (
    <div className="mx-6 mt-6 bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-xl font-bold text-slate-900 mb-4">
        🚀 Tu Ruta de Crecimiento
      </h2>

      {/* Proyección para siguiente nivel */}
      {nextLevel && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-slate-900 mb-2">
            Para alcanzar {nextLevel.nivel} {nextLevel.badge}
          </h3>

          <div className="space-y-2 text-sm">
            <ProjectionItem
              icon="📞"
              label="Llamadas necesarias"
              current={projections.llamadasHoy}
              target={projections.llamadasParaNivel}
              unit="llamadas/día"
            />

            <ProjectionItem
              icon="🎯"
              label="Presentaciones"
              current={projections.presentacionesSemana}
              target={projections.presentacionesParaNivel}
              unit="esta semana"
            />

            <ProjectionItem
              icon="💰"
              label="Ventas requeridas"
              current={projections.ventasMes}
              target={projections.ventasParaNivel}
              unit="este mes"
            />

            <ProjectionItem
              icon="⏱️"
              label="Tiempo estimado"
              value={projections.diasParaNivel}
              unit="días"
            />
          </div>
        </div>
      )}

      {/* Plan Semanal Sugerido */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
          <span className="mr-2">📋</span>
          Plan Semanal Sugerido
        </h3>

        <div className="space-y-2">
          {projections.planSemanal.map((dia, index) => (
            <WeeklyPlanDay key={index} dia={dia} />
          ))}
        </div>
      </div>

      {/* Botón de Acción */}
      <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-shadow">
        Ver Plan Detallado
      </button>
    </div>
  );
}

function ProjectionItem({ icon, label, current, target, value, unit }: ProjectionItemProps) {
  if (value !== undefined) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-slate-600">
          {icon} {label}
        </span>
        <span className="font-semibold text-slate-900">
          {value} {unit}
        </span>
      </div>
    );
  }

  const progress = current / target * 100;
  const remaining = Math.max(0, target - current);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-600">
          {icon} {label}
        </span>
        <span className="font-semibold text-slate-900">
          {current}/{target}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {remaining > 0 && (
          <span className="text-xs text-slate-500">
            +{remaining} {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function WeeklyPlanDay({ dia }: { dia: WeeklyPlanDay }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-xs text-slate-500">{dia.diaSemana}</p>
        <p className="text-lg font-bold text-slate-900">{dia.numero}</p>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 mb-1">
          {dia.objetivo}
        </p>
        <div className="flex flex-wrap gap-1">
          {dia.tareas.map((tarea, i) => (
            <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-slate-600">
              {tarea}
            </span>
          ))}
        </div>
        <p className="text-xs text-green-600 mt-1">
          +{dia.puntosEstimados} pts estimados
        </p>
      </div>
    </div>
  );
}
```

### Algoritmo de Proyecciones

```typescript
function calculateProjections(broker: BrokerData): Projections {
  const nextLevel = getNextLevel(broker.puntosMes);
  if (!nextLevel) return { /* ya está en nivel máximo */ };

  const puntosNecesarios = nextLevel.puntosMinimos - broker.puntosMes;

  // Calcular promedio de puntos por actividad
  const avgPuntosPorLlamada = 1;
  const avgPuntosPorPresentacion = 3;
  const avgPuntosPorVenta = 10;

  // Baseline de actividad histórica del broker
  const promedioLlamadasDia = broker.historico.avgLlamadasDia || 15;
  const promedioPresentacionesSemana = broker.historico.avgPresentacionesSemana || 5;
  const promedioVentasMes = broker.historico.avgVentasMes || 2;

  // Calcular gap
  const puntosActualesProyectados =
    (promedioLlamadasDia * 30 * avgPuntosPorLlamada) +
    (promedioPresentacionesSemana * 4 * avgPuntosPorPresentacion) +
    (promedioVentasMes * avgPuntosPorVenta);

  const deficit = puntosNecesarios - puntosActualesProyectados;

  // Si ya va bien, mantener ritmo
  if (deficit <= 0) {
    return {
      llamadasParaNivel: promedioLlamadasDia,
      presentacionesParaNivel: promedioPresentacionesSemana,
      ventasParaNivel: promedioVentasMes,
      diasParaNivel: Math.ceil((nextLevel.puntosMinimos - broker.puntosMes) /
        (broker.puntosPromediosDia || 15))
    };
  }

  // Calcular aumento necesario
  // Opción 1: Más llamadas (más fácil)
  const llamadasExtras = Math.ceil(deficit / avgPuntosPorLlamada / 30);

  // Opción 2: Más presentaciones (más efectivo)
  const presentacionesExtras = Math.ceil(deficit / avgPuntosPorPresentacion / 4);

  // Opción 3: Más ventas (más difícil pero más puntos)
  const ventasExtras = Math.ceil(deficit / avgPuntosPorVenta);

  // Generar plan semanal balanceado
  const planSemanal = generateWeeklyPlan(
    promedioLlamadasDia + Math.ceil(llamadasExtras * 0.3),
    promedioPresentacionesSemana + Math.ceil(presentacionesExtras * 0.5),
    promedioVentasMes + Math.ceil(ventasExtras * 0.2)
  );

  return {
    llamadasHoy: broker.llamadasHoy,
    llamadasParaNivel: promedioLlamadasDia + llamadasExtras,
    presentacionesSemana: broker.presentacionesSemana,
    presentacionesParaNivel: promedioPresentacionesSemana + presentacionesExtras,
    ventasMes: broker.ventasMes,
    ventasParaNivel: promedioVentasMes + ventasExtras,
    diasParaNivel: Math.ceil(puntosNecesarios /
      ((promedioLlamadasDia + llamadasExtras) * avgPuntosPorLlamada)),
    planSemanal
  };
}

function generateWeeklyPlan(llamadasDia: number, presentacionesSemana: number, ventasMes: number): WeeklyPlanDay[] {
  return [
    {
      diaSemana: "Lun",
      numero: 3,
      objetivo: "Power Start",
      tareas: [`${llamadasDia} llamadas`, "2 presentaciones", "Review pipeline"],
      puntosEstimados: llamadasDia + 6 + 2
    },
    {
      diaSemana: "Mar",
      numero: 4,
      objetivo: "Follow-up Day",
      tareas: [`${Math.ceil(llamadasDia * 0.8)} llamadas`, "3 cotizaciones", "1 visita física"],
      puntosEstimados: Math.ceil(llamadasDia * 0.8) + 9 + 5
    },
    {
      diaSemana: "Mié",
      numero: 5,
      objetivo: "Closing Focus",
      tareas: [`${llamadasDia} llamadas`, "2 negociaciones", "Cerrar 1 deal"],
      puntosEstimados: llamadasDia + 10 + 10
    },
    {
      diaSemana: "Jue",
      numero: 6,
      objetivo: "Pipeline Building",
      tareas: [`${Math.ceil(llamadasDia * 1.2)} llamadas`, "3 presentaciones", "Qualify leads"],
      puntosEstimados: Math.ceil(llamadasDia * 1.2) + 9 + 3
    },
    {
      diaSemana: "Vie",
      numero: 7,
      objetivo: "Week Closing",
      tareas: [`${llamadasDia} llamadas`, "2 visitas", "Review semanal"],
      puntosEstimados: llamadasDia + 10 + 5
    }
  ];
}
```

---

## 📋 TAREAS DEL DÍA

### Componente: Daily Tasks

```tsx
function DailyTasks({ broker }: { broker: BrokerData }) {
  const tareas = broker.tareasDia.sort((a, b) => b.prioridad - a.prioridad);
  const completadas = tareas.filter(t => t.completada).length;

  return (
    <div className="mx-6 mt-6 bg-white rounded-2xl shadow-lg p-6">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          ✅ Tareas de Hoy
        </h2>
        <span className="text-sm text-slate-600">
          {completadas}/{tareas.length}
        </span>
      </div>

      {/* Progress Circle */}
      <CircularProgress
        completed={completadas}
        total={tareas.length}
        className="mb-4"
      />

      {/* Lista de Tareas */}
      <div className="space-y-3">
        {tareas.map(tarea => (
          <TaskItem key={tarea.id} tarea={tarea} broker={broker} />
        ))}
      </div>

      {/* Add Task Button */}
      <button className="mt-4 w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
        + Agregar Tarea
      </button>
    </div>
  );
}

function TaskItem({ tarea, broker }: { tarea: Tarea; broker: BrokerData }) {
  const priorityColors = {
    alta: 'border-l-red-500 bg-red-50',
    media: 'border-l-yellow-500 bg-yellow-50',
    baja: 'border-l-green-500 bg-green-50'
  };

  const iconos = {
    llamada: '📞',
    presentacion: '🎯',
    reunion: '👥',
    cotizacion: '📝',
    seguimiento: '🔄',
    visita: '🏗️'
  };

  return (
    <div className={`border-l-4 ${priorityColors[tarea.prioridad]} rounded-r-xl p-4 ${tarea.completada ? 'opacity-50' : ''}`}>

      <div className="flex items-start justify-between">

        {/* Checkbox y Contenido */}
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={tarea.completada}
            onChange={() => handleTaskToggle(tarea.id, broker.id)}
            className="mt-1 w-5 h-5 rounded border-slate-300"
          />

          <div className="flex-1">
            <p className={`font-medium ${tarea.completada ? 'line-through text-slate-500' : 'text-slate-900'}`}>
              {iconos[tarea.tipo]} {tarea.titulo}
            </p>

            {tarea.cliente && (
              <p className="text-sm text-slate-600 mt-1">
                👤 {tarea.cliente.nombre}
              </p>
            )}

            {tarea.hora && (
              <p className="text-xs text-slate-500 mt-1">
                🕐 {tarea.hora}
              </p>
            )}
          </div>
        </div>

        {/* Puntos */}
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-green-600">
            +{tarea.puntos}
          </span>
          <span className="text-xs text-slate-500">pts</span>
        </div>
      </div>

      {/* Descripción si existe */}
      {tarea.descripcion && !tarea.completada && (
        <p className="mt-2 text-sm text-slate-600 ml-8">
          {tarea.descripcion}
        </p>
      )}

      {/* Botones de Acción */}
      {!tarea.completada && tarea.cliente && (
        <div className="mt-3 ml-8 flex space-x-2">
          <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200">
            Ver Cliente
          </button>
          {tarea.tipo === 'llamada' && (
            <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
              Llamar Ahora
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🏅 LEADERBOARD Y RANKING

### Componente: Mini Leaderboard

```tsx
function MiniLeaderboard() {
  const { data: leaderboard } = useLeaderboard('mes-actual');
  const currentUser = useCurrentBroker();

  return (
    <div className="mx-6 mt-6 bg-white rounded-2xl shadow-lg p-6">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">
          🏆 Leaderboard del Mes
        </h2>
        <button className="text-sm text-blue-600 font-medium">
          Ver Todo
        </button>
      </div>

      {/* Top 3 */}
      <div className="space-y-3 mb-4">
        {leaderboard?.slice(0, 3).map((broker, index) => (
          <LeaderboardItem
            key={broker.id}
            broker={broker}
            position={index + 1}
            isCurrentUser={broker.id === currentUser.id}
          />
        ))}
      </div>

      {/* Posición del usuario actual si no está en top 3 */}
      {currentUser.ranking > 3 && (
        <>
          <div className="border-t border-dashed my-3" />
          <LeaderboardItem
            broker={currentUser}
            position={currentUser.ranking}
            isCurrentUser={true}
          />
        </>
      )}
    </div>
  );
}

function LeaderboardItem({ broker, position, isCurrentUser }: LeaderboardItemProps) {
  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };

  const currentLevel = getCurrentLevel(broker.puntosMes);

  return (
    <div className={`flex items-center space-x-4 p-4 rounded-xl ${
      isCurrentUser
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300'
        : 'bg-slate-50'
    }`}>

      {/* Posición */}
      <div className="flex-shrink-0 w-12 text-center">
        <span className="text-2xl">
          {medals[position] || position}
        </span>
      </div>

      {/* Avatar y Nombre */}
      <div className="flex items-center flex-1 space-x-3">
        <div className="relative">
          <img
            src={broker.avatar}
            alt={broker.nombre}
            className={`w-12 h-12 rounded-full ${position <= 3 ? 'border-2 border-yellow-400' : ''}`}
          />
          <div className="absolute -bottom-1 -right-1 text-lg">
            {currentLevel.badge}
          </div>
        </div>

        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            {broker.nombre}
          </p>
          <p className="text-xs text-slate-600">
            {currentLevel.nivel}
          </p>
        </div>
      </div>

      {/* Puntos y Trend */}
      <div className="text-right">
        <p className="text-xl font-bold text-slate-900">
          {broker.puntosMes}
        </p>
        <p className="text-xs text-slate-600">puntos</p>
        {broker.tendencia !== undefined && (
          <p className={`text-xs flex items-center justify-end mt-1 ${
            broker.tendencia > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {broker.tendencia > 0 ? '↗' : '↘'} {Math.abs(broker.tendencia)}%
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 🎨 ACTIVIDAD RECIENTE

```tsx
function RecentActivity({ broker }: { broker: BrokerData }) {
  const actividades = broker.actividadesRecientes;

  return (
    <div className="mx-6 mt-6 bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-xl font-bold text-slate-900 mb-4">
        ⚡ Actividad Reciente
      </h2>

      <div className="space-y-4">
        {actividades.map(actividad => (
          <ActivityItem key={actividad.id} actividad={actividad} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ actividad }: { actividad: Actividad }) {
  const iconos = {
    llamada: { icon: '📞', color: 'bg-blue-100 text-blue-600' },
    presentacion: { icon: '🎯', color: 'bg-purple-100 text-purple-600' },
    venta: { icon: '💰', color: 'bg-green-100 text-green-600' },
    apartado: { icon: '🎯', color: 'bg-yellow-100 text-yellow-600' },
    reunion: { icon: '👥', color: 'bg-indigo-100 text-indigo-600' }
  };

  const config = iconos[actividad.tipo] || iconos.llamada;

  return (
    <div className="flex items-start space-x-3">

      {/* Icono */}
      <div className={`flex-shrink-0 w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-xl`}>
        {config.icon}
      </div>

      {/* Contenido */}
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          {actividad.descripcion}
        </p>
        {actividad.cliente && (
          <p className="text-xs text-slate-600">
            👤 {actividad.cliente}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          {formatearTiempo(actividad.fecha)}
        </p>
      </div>

      {/* Puntos ganados */}
      <div className="flex-shrink-0">
        <span className="text-sm font-bold text-green-600">
          +{actividad.puntos}
        </span>
      </div>
    </div>
  );
}
```

Continuaré en el siguiente mensaje con:
- Schema de base de datos completo
- API endpoints
- Dashboard ejecutivo para dirección
- Sistema de sincronización con GHL

¿Continúo con la implementación técnica?