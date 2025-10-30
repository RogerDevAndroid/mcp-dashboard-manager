// lib/types.ts
// TypeScript types for Broker Dashboard

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
  metricas?: {
    llamadas: number;
    presentaciones: number;
    ventas: number;
  };
}

export interface DashboardData {
  broker: BrokerProfile;
  metricas: BrokerMetrics;
  proyecciones: Proyecciones;
  tareasPendientes: TareaBroker[];
  logrosRecientes: Achievement[];
}

export interface ExecutiveSummary {
  totalBrokers: number;
  brokersActivos: number;
  puntosPromedioEquipo: number;
  leadsAsignadosTotal: number;
  oportunidadesAbiertas: number;
  ventasMes: number;
  revenueMes: number;
  tasaConversionPromedio: number;
}

export interface Alert {
  id: string;
  tipo: 'rendimiento' | 'inactividad' | 'meta' | 'oportunidad' | 'sistema';
  titulo: string;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha: string;
  brokerId?: string;
  brokerNombre?: string;
  accion?: string;
}

export interface BrokerPerformance {
  brokerId: string;
  nombre: string;
  email?: string;
  avatar?: string;
  nivel: 'Rookie' | 'Junior' | 'Senior' | 'Elite' | 'Legend';
  puntos: number;
  posicion: number;
  cambio: number;
  metricas: {
    llamadas: number;
    presentaciones: number;
    ventas: number;
    revenue: number;
    tasaConversion: number;
  };
}

export interface Tendencias {
  semanas: string[];
  llamadas: number[];
  presentaciones: number[];
  ventas: number[];
  revenue: number[];
  tasasConversion: number[];
  objetivoSemanal?: number;
  promedioConversion: number;
}

export interface ExecutiveDashboardData {
  lastUpdate: string;
  resumen: {
    totalBrokers: number;
    brokersActivos: number;
    pipelineTotal: {
      leads: number;
      oportunidades: number;
    };
    revenueMes: number;
    conversionPromedio: number;
    cambios: {
      brokers: number;
      pipeline: number;
      revenue: number;
      conversion: number;
    };
  };
  alertas: Alert[];
  topPerformers: BrokerPerformance[];
  tendencias: Tendencias;
  pipeline: Array<{
    etapa: string;
    cantidad: number;
    valor: number;
    tasaConversion: number;
  }>;
}

// Database types
export interface Database {
  broker_profiles: {
    broker_id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    avatar: string | null;
    puntos_mes: number;
    puntos_total: number;
    nivel: string;
    activo: boolean;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  actividades: {
    id: string;
    broker_id: string;
    tipo: string;
    subtipo: string | null;
    lead_id: string | null;
    descripcion: string | null;
    puntos: number;
    metadata: Record<string, any>;
    fecha: string;
    created_at: string;
  };
  leads_asignados: {
    lead_id: string;
    broker_id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    estado: string;
    presupuesto: number | null;
    fecha_asignacion: string;
    fecha_ultimo_contacto: string | null;
    contactado: boolean;
    score: number;
    metadata: Record<string, any>;
    ultima_actualizacion: string;
  };
  oportunidades_broker: {
    oportunidad_id: string;
    broker_id: string;
    lead_id: string | null;
    nombre: string;
    valor: number;
    etapa: string;
    estado: string;
    probabilidad: number;
    fecha_creacion: string;
    fecha_cierre_estimada: string | null;
    fecha_cierre_real: string | null;
    fuente: string | null;
    metadata: Record<string, any>;
    ultima_actualizacion: string;
  };
}
