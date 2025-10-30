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
    bgLight: 'bg-slate-100',
    borderColor: 'border-slate-500',
    puntosMin: 0,
    puntosMax: 100,
    comision: 3.0,
    beneficios: ['Acceso básico', 'Capacitación inicial']
  },
  Junior: {
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgLight: 'bg-green-100',
    borderColor: 'border-green-500',
    puntosMin: 101,
    puntosMax: 300,
    comision: 3.5,
    beneficios: ['Asistente virtual', 'Leads premium']
  },
  Senior: {
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-100',
    borderColor: 'border-blue-500',
    puntosMin: 301,
    puntosMax: 600,
    comision: 4.0,
    beneficios: ['Asistente dedicado', 'Acceso VIP']
  },
  Elite: {
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    bgLight: 'bg-purple-100',
    borderColor: 'border-purple-500',
    puntosMin: 601,
    puntosMax: 1000,
    comision: 4.5,
    beneficios: ['Equipo propio', 'Bonos especiales']
  },
  Legend: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgLight: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    puntosMin: 1001,
    puntosMax: Infinity,
    comision: 5.0,
    beneficios: ['Equity', 'Autonomía total', 'Partner']
  }
} as const;

export function getNivelPuntos(nivelActual: string): number {
  const niveles: Record<string, number> = {
    'Rookie': 100,
    'Junior': 300,
    'Senior': 600,
    'Elite': 1000,
    'Legend': 2000
  };
  return niveles[nivelActual] || 100;
}

export function calcularNivel(puntos: number): keyof typeof NIVEL_CONFIG {
  if (puntos >= NIVEL_CONFIG.Legend.puntosMin) return 'Legend';
  if (puntos >= NIVEL_CONFIG.Elite.puntosMin) return 'Elite';
  if (puntos >= NIVEL_CONFIG.Senior.puntosMin) return 'Senior';
  if (puntos >= NIVEL_CONFIG.Junior.puntosMin) return 'Junior';
  return 'Rookie';
}

// Sistema de puntuación basado en el screenshot del usuario
export const PUNTUACION_SYSTEM = {
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
} as const;

export function calcularPuntos(tipo: string, subtipo: string, resultado?: string): number {
  // Presentaciones
  if (tipo === 'presentacion') {
    const puntos = (PUNTUACION_SYSTEM.presentaciones as any)[subtipo];
    return puntos || 1;
  }

  // Resultados (ventas)
  if (tipo === 'venta' || tipo === 'resultado') {
    const puntos = (PUNTUACION_SYSTEM.resultados as any)[resultado || subtipo];
    return puntos || 5;
  }

  // Actividades generales
  const puntos = (PUNTUACION_SYSTEM.actividades as any)[tipo];
  return puntos || 1;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins === 1) return 'Hace 1 minuto';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours === 1) return 'Hace 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(date);
}
