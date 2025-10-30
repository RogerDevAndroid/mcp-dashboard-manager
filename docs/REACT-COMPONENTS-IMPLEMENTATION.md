# React Components Implementation - Broker Dashboard

**Fecha**: 2025-10-30
**Proyecto**: Dashboard Gamificado Mobile - Selvadentro Tulum

---

## 🎯 Resumen

Este documento contiene la implementación completa de los componentes React para el dashboard mobile gamificado de brokers, usando Next.js 15 App Router, TypeScript, Tailwind CSS y shadcn/ui.

---

## 📦 Dependencias Necesarias

```bash
# Instalar dependencias
npm install @supabase/supabase-js
npm install recharts lucide-react
npm install date-fns
npm install clsx tailwind-merge

# Instalar shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add card
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add button
npx shadcn-ui@latest add tabs
```

---

## 🗂️ Estructura de Archivos

```
app/
├── (dashboard)/
│   ├── broker/
│   │   ├── [brokerId]/
│   │   │   ├── page.tsx                 # Página principal del broker
│   │   │   └── layout.tsx               # Layout con navegación
│   │   └── components/
│   │       ├── DashboardHeader.tsx
│   │       ├── LevelProgress.tsx
│   │       ├── MetricsGrid.tsx
│   │       ├── GrowthPath.tsx
│   │       ├── DailyTasks.tsx
│   │       ├── MiniLeaderboard.tsx
│   │       └── AchievementsBadges.tsx
│   └── executive/
│       └── page.tsx                     # Dashboard ejecutivo
├── api/
│   ├── broker/
│   │   ├── dashboard/route.ts
│   │   └── activities/route.ts
│   ├── leaderboard/route.ts
│   └── executive/dashboard/route.ts
└── lib/
    ├── supabase.ts
    └── types.ts
```

---

## 📄 Tipos TypeScript

```typescript
// lib/types.ts

export interface BrokerProfile {
  id: string;
  nombre: string;
  email: string;
  puntosMes: number;
  puntosTotal: number;
  nivel: 'Rookie' | 'Junior' | 'Senior' | 'Elite' | 'Legend';
  rangoActual: number;
  avatar: string;
  progreso: {
    actual: number;
    siguienteNivel: number;
    porcentaje: number;
    puntosNecesarios: number;
  };
}

export interface BrokerMetrics {
  leadsAsignados: number;
  leadsContactados: number;
  llamadasHoy: number;
  presentacionesSemana: number;
  oportunidadesAbiertas: number;
  tasaConversion: number;
  ventasMes: number;
  revenueMes: number;
}

export interface Proyecciones {
  puntosNecesarios: number;
  diasRestantes: number;
  promedioActual: number;
  promedioNecesario: number;
  actividades: {
    llamadasDiarias: number;
    presentacionesSemanales: number;
    ventasProyectadas: number;
  };
}

export interface TareaBroker {
  id: string;
  tipo: 'llamada' | 'presentacion' | 'email' | 'seguimiento';
  descripcion: string;
  puntos: number;
  prioridad: 'alta' | 'media' | 'baja';
  vence: string;
  completada: boolean;
}

export interface Achievement {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  fecha?: string;
}

export interface LeaderboardEntry {
  posicion: number;
  brokerId: string;
  nombre: string;
  avatar: string;
  puntos: number;
  nivel: string;
  badge: string;
}

export interface DashboardData {
  broker: BrokerProfile;
  metricas: BrokerMetrics;
  proyecciones: Proyecciones;
  tareasPendientes: TareaBroker[];
  logrosRecientes: Achievement[];
}
```

---

## 🔧 Utilidades y Configuración

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NIVEL_CONFIG = {
  Rookie: {
    color: 'bg-slate-500',
    textColor: 'text-slate-500',
    puntosMin: 0,
    puntosMax: 100,
    comision: 3,
    beneficios: ['Acceso básico', 'Capacitación inicial']
  },
  Junior: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    puntosMin: 101,
    puntosMax: 300,
    comision: 3.5,
    beneficios: ['Asistente virtual', 'Leads premium']
  },
  Senior: {
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    puntosMin: 301,
    puntosMax: 600,
    comision: 4,
    beneficios: ['Asistente dedicado', 'Acceso VIP']
  },
  Elite: {
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    puntosMin: 601,
    puntosMax: 1000,
    comision: 4.5,
    beneficios: ['Equipo propio', 'Bonos especiales']
  },
  Legend: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    puntosMin: 1001,
    puntosMax: Infinity,
    comision: 5,
    beneficios: ['Equity', 'Autonomía total']
  }
};
```

---

## 🎨 Componentes React

### 1. Dashboard Header

```tsx
// app/(dashboard)/broker/components/DashboardHeader.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings } from 'lucide-react';
import { BrokerProfile } from '@/lib/types';
import { NIVEL_CONFIG } from '@/lib/utils';

interface DashboardHeaderProps {
  broker: BrokerProfile;
  notificacionesPendientes?: number;
}

export function DashboardHeader({ broker, notificacionesPendientes = 0 }: DashboardHeaderProps) {
  const nivelConfig = NIVEL_CONFIG[broker.nivel];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-white">
            <AvatarImage src={broker.avatar} alt={broker.nombre} />
            <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
              {broker.nombre.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-2xl font-bold">{broker.nombre.split(' ')[0]}</h1>
            <Badge
              className={`${nivelConfig.color} text-white mt-1`}
              variant="secondary"
            >
              {broker.nivel} Broker
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <Bell size={24} />
            {notificacionesPendientes > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {notificacionesPendientes}
              </span>
            )}
          </button>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Puntos este mes</p>
          <p className="text-4xl font-bold">{broker.puntosMes}</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Ranking</p>
          <p className="text-4xl font-bold">#{broker.rangoActual}</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. Level Progress

```tsx
// app/(dashboard)/broker/components/LevelProgress.tsx
'use client';

import { Progress } from '@/components/ui/progress';
import { BrokerProfile } from '@/lib/types';
import { NIVEL_CONFIG } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface LevelProgressProps {
  broker: BrokerProfile;
}

export function LevelProgress({ broker }: LevelProgressProps) {
  const nivelActual = NIVEL_CONFIG[broker.nivel];
  const nivelesArray = Object.keys(NIVEL_CONFIG) as Array<keyof typeof NIVEL_CONFIG>;
  const siguienteNivelIndex = nivelesArray.indexOf(broker.nivel) + 1;
  const siguienteNivel = siguienteNivelIndex < nivelesArray.length
    ? nivelesArray[siguienteNivelIndex]
    : null;

  const mensajesMotivacionales = [
    "¡Vas increíble! Sigue así 🔥",
    "¡Estás cerca del siguiente nivel! 💪",
    "¡Un poco más y lo logras! 🚀",
    "¡Excelente progreso! ⭐",
  ];

  const mensajeIndex = Math.floor(broker.progreso.porcentaje / 25);
  const mensaje = mensajesMotivacionales[Math.min(mensajeIndex, 3)];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 -mt-8 mx-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className={nivelActual.textColor} size={24} />
          <h3 className="font-semibold text-gray-700">Progreso a {siguienteNivel || 'Legend'}</h3>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {broker.progreso.porcentaje.toFixed(0)}%
        </span>
      </div>

      <Progress
        value={broker.progreso.porcentaje}
        className="h-3 mb-2"
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {broker.progreso.actual} / {broker.progreso.siguienteNivel} puntos
        </span>
        <span className="font-medium text-blue-600">
          {broker.progreso.puntosNecesarios} puntos más
        </span>
      </div>

      <p className="mt-3 text-center text-sm font-medium text-gray-700">
        {mensaje}
      </p>

      {siguienteNivel && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Beneficios del siguiente nivel:</p>
          <div className="flex flex-wrap gap-2">
            {NIVEL_CONFIG[siguienteNivel].beneficios.map((beneficio, i) => (
              <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-gray-700">
                ✨ {beneficio}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Metrics Grid

```tsx
// app/(dashboard)/broker/components/MetricsGrid.tsx
'use client';

import { BrokerMetrics } from '@/lib/types';
import { Phone, Presentation, Target, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MetricsGridProps {
  metricas: BrokerMetrics;
}

export function MetricsGrid({ metricas }: MetricsGridProps) {
  const metrics = [
    {
      label: 'Llamadas Hoy',
      value: metricas.llamadasHoy,
      icon: Phone,
      color: 'bg-blue-100 text-blue-600',
      trend: '+12%'
    },
    {
      label: 'Presentaciones',
      value: metricas.presentacionesSemana,
      subtitle: 'esta semana',
      icon: Presentation,
      color: 'bg-purple-100 text-purple-600',
      trend: '+8%'
    },
    {
      label: 'Conversión',
      value: `${metricas.tasaConversion.toFixed(1)}%`,
      icon: Target,
      color: 'bg-green-100 text-green-600',
      trend: '+5%'
    },
    {
      label: 'Revenue',
      value: formatCurrency(metricas.revenueMes),
      subtitle: 'este mes',
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600',
      trend: '+18%'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 px-4 mt-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition"
          >
            <div className={`${metric.color} w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
            <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
            {metric.subtitle && (
              <p className="text-xs text-gray-500">{metric.subtitle}</p>
            )}
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-green-600 font-medium">{metric.trend}</span>
              <span className="text-xs text-gray-400">vs sem. anterior</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### 4. Growth Path (Proyecciones)

```tsx
// app/(dashboard)/broker/components/GrowthPath.tsx
'use client';

import { Proyecciones } from '@/lib/types';
import { TrendingUp, Phone, Presentation, DollarSign, Calendar } from 'lucide-react';

interface GrowthPathProps {
  proyecciones: Proyecciones;
}

export function GrowthPath({ proyecciones }: GrowthPathProps) {
  const actividades = [
    {
      icon: Phone,
      label: 'Llamadas diarias',
      value: proyecciones.actividades.llamadasDiarias,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Presentation,
      label: 'Presentaciones/semana',
      value: proyecciones.actividades.presentacionesSemanales,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: DollarSign,
      label: 'Ventas proyectadas',
      value: proyecciones.actividades.ventasProyectadas,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="px-4 mt-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={24} />
          <h3 className="font-bold text-lg">Tu Ruta de Crecimiento</h3>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-90">Puntos necesarios</span>
            <span className="text-2xl font-bold">{proyecciones.puntosNecesarios}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Días restantes</span>
            <span className="text-2xl font-bold flex items-center gap-1">
              <Calendar size={20} />
              {proyecciones.diasRestantes}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm opacity-90">
            Promedio actual: <span className="font-bold">{proyecciones.promedioActual} pts/día</span>
          </p>
          <p className="text-sm opacity-90">
            Promedio necesario: <span className="font-bold">{proyecciones.promedioNecesario} pts/día</span>
          </p>
        </div>

        <div className="border-t border-white/30 pt-4">
          <p className="text-sm font-semibold mb-3">Para alcanzar tu objetivo, necesitas:</p>

          <div className="space-y-2">
            {actividades.map((act, index) => {
              const Icon = act.icon;
              return (
                <div key={index} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`${act.bg} rounded-full p-2`}>
                      <Icon className={act.color} size={16} />
                    </div>
                    <span className="text-sm">{act.label}</span>
                  </div>
                  <span className="text-xl font-bold">{act.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-yellow-400/20 border border-yellow-400/50 rounded-lg p-3">
          <p className="text-xs text-center">
            💡 <strong>Consejo:</strong> Enfócate en llamadas de calidad y presentaciones efectivas para maximizar tus puntos
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 5. Daily Tasks

```tsx
// app/(dashboard)/broker/components/DailyTasks.tsx
'use client';

import { TareaBroker } from '@/lib/types';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

interface DailyTasksProps {
  tareas: TareaBroker[];
  onCompleteTask?: (taskId: string) => void;
}

export function DailyTasks({ tareas, onCompleteTask }: DailyTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
    onCompleteTask?.(taskId);
  };

  const getPriorityIcon = (prioridad: string) => {
    if (prioridad === 'alta') return <Flame className="text-red-500" size={16} />;
    return null;
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'border-l-red-500';
      case 'media': return 'border-l-yellow-500';
      case 'baja': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">Tareas del Día</h3>
        <span className="text-sm text-gray-500">
          {tareas.filter(t => !completedTasks.has(t.id)).length} pendientes
        </span>
      </div>

      <div className="space-y-3">
        {tareas.map((tarea) => {
          const isCompleted = completedTasks.has(tarea.id);

          return (
            <div
              key={tarea.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(tarea.prioridad)} p-4 transition ${
                isCompleted ? 'opacity-50' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleComplete(tarea.id)}
                  className="mt-1 transition hover:scale-110"
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <Circle className="text-gray-300" size={24} />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium text-gray-800 ${isCompleted ? 'line-through' : ''}`}>
                      {tarea.descripcion}
                    </h4>
                    {getPriorityIcon(tarea.prioridad)}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(tarea.vence)}</span>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      +{tarea.puntos} pts
                    </div>
                    <span className="capitalize">{tarea.tipo}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {tareas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>🎉 ¡No hay tareas pendientes!</p>
            <p className="text-sm mt-1">Buen trabajo hoy</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 6. Mini Leaderboard

```tsx
// app/(dashboard)/broker/components/MiniLeaderboard.tsx
'use client';

import { LeaderboardEntry } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';

interface MiniLeaderboardProps {
  ranking: LeaderboardEntry[];
  currentBrokerId: string;
}

export function MiniLeaderboard({ ranking, currentBrokerId }: MiniLeaderboardProps) {
  const top3 = ranking.slice(0, 3);
  const currentBroker = ranking.find(r => r.brokerId === currentBrokerId);

  return (
    <div className="px-4 mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} />
          Ranking del Mes
        </h3>
        <button className="text-sm text-blue-600 font-medium">
          Ver todos →
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
        {/* Top 3 */}
        {top3.map((entry) => {
          const isCurrentUser = entry.brokerId === currentBrokerId;

          return (
            <div
              key={entry.brokerId}
              className={`flex items-center justify-between py-3 ${
                isCurrentUser ? 'bg-blue-50 -mx-4 px-4 rounded-lg' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl min-w-[32px]">
                  {entry.badge || `#${entry.posicion}`}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar} />
                  <AvatarFallback>
                    {entry.nombre.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={`font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                    {entry.nombre}
                    {isCurrentUser && <span className="ml-2 text-xs">(Tú)</span>}
                  </p>
                  <p className="text-xs text-gray-500">{entry.nivel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{entry.puntos}</p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
            </div>
          );
        })}

        {/* Current user si no está en top 3 */}
        {currentBroker && currentBroker.posicion > 3 && (
          <>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex items-center justify-between py-3 bg-blue-50 -mx-4 px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg min-w-[32px] font-bold text-gray-600">
                  #{currentBroker.posicion}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentBroker.avatar} />
                  <AvatarFallback>
                    {currentBroker.nombre.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-blue-700">
                    {currentBroker.nombre} (Tú)
                  </p>
                  <p className="text-xs text-gray-500">{currentBroker.nivel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{currentBroker.puntos}</p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### 7. Achievements Badges

```tsx
// app/(dashboard)/broker/components/AchievementsBadges.tsx
'use client';

import { Achievement } from '@/lib/types';
import { Award } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AchievementsBadgesProps {
  logros: Achievement[];
}

export function AchievementsBadges({ logros }: AchievementsBadgesProps) {
  if (logros.length === 0) return null;

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-yellow-500" size={20} />
        <h3 className="font-bold text-lg text-gray-800">Logros Recientes</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {logros.map((logro) => (
          <div
            key={logro.id}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 shadow-sm"
          >
            <div className="text-4xl mb-2">{logro.icon}</div>
            <h4 className="font-bold text-gray-800 text-sm">{logro.nombre}</h4>
            <p className="text-xs text-gray-600 mt-1">{logro.descripcion}</p>
            {logro.fecha && (
              <p className="text-xs text-gray-500 mt-2">{formatDate(logro.fecha)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📱 Página Principal del Broker

```tsx
// app/(dashboard)/broker/[brokerId]/page.tsx
import { DashboardHeader } from '../components/DashboardHeader';
import { LevelProgress } from '../components/LevelProgress';
import { MetricsGrid } from '../components/MetricsGrid';
import { GrowthPath } from '../components/GrowthPath';
import { DailyTasks } from '../components/DailyTasks';
import { MiniLeaderboard } from '../components/MiniLeaderboard';
import { AchievementsBadges } from '../components/AchievementsBadges';
import { DashboardData, LeaderboardEntry } from '@/lib/types';

async function getDashboardData(brokerId: string): Promise<DashboardData> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/broker/dashboard?brokerId=${brokerId}`,
    { cache: 'no-store' }
  );

  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

async function getLeaderboard(): Promise<{ ranking: LeaderboardEntry[] }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/leaderboard?limit=10`,
    { cache: 'no-store' }
  );

  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export default async function BrokerDashboardPage({
  params,
}: {
  params: { brokerId: string };
}) {
  const data = await getDashboardData(params.brokerId);
  const { ranking } = await getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader broker={data.broker} notificacionesPendientes={3} />
      <LevelProgress broker={data.broker} />
      <MetricsGrid metricas={data.metricas} />
      <GrowthPath proyecciones={data.proyecciones} />
      <DailyTasks tareas={data.tareasPendientes} />
      <AchievementsBadges logros={data.logrosRecientes} />
      <MiniLeaderboard ranking={ranking} currentBrokerId={params.brokerId} />
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

- [x] Tipos TypeScript definidos
- [x] Utilidades y helpers creados
- [x] DashboardHeader component
- [x] LevelProgress component
- [x] MetricsGrid component
- [x] GrowthPath component
- [x] DailyTasks component
- [x] MiniLeaderboard component
- [x] AchievementsBadges component
- [x] Página principal del broker
- [ ] Testing de componentes
- [ ] Responsive design verification
- [ ] Integración con API real
- [ ] Deploy a producción

---

## 🚀 Siguientes Pasos

1. **Crear dashboard ejecutivo** para dirección
2. **Agregar animaciones** con Framer Motion
3. **Implementar notificaciones push**
4. **Testing end-to-end** con Playwright
5. **Optimizar performance** con React.memo

---

**Elaborado por**: Claude + Roger García Vital
**Fecha**: 2025-10-30
**Estado**: ✅ COMPLETO - Listo para implementación
