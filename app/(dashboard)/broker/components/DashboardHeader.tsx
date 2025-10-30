// app/(dashboard)/broker/components/DashboardHeader.tsx
'use client';

import { Bell, Settings } from 'lucide-react';
import { BrokerProfile } from '@/lib/types';
import { NIVEL_CONFIG } from '@/lib/utils';

interface DashboardHeaderProps {
  broker: BrokerProfile;
  notificacionesPendientes?: number;
}

export default function DashboardHeader({ broker, notificacionesPendientes = 0 }: DashboardHeaderProps) {
  const nivelConfig = NIVEL_CONFIG[broker.nivel];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-white shadow-lg">
              {broker.avatar ? (
                <img
                  src={broker.avatar}
                  alt={broker.nombre}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                broker.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              )}
            </div>
            {/* Indicador de nivel */}
            <div className={`absolute -bottom-1 -right-1 ${nivelConfig.color} text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white`}>
              {broker.nivel.slice(0, 1)}
            </div>
          </div>

          {/* Info del broker */}
          <div>
            <h1 className="text-2xl font-bold">
              {broker.nombre.split(' ')[0]}
            </h1>
            <div className={`inline-flex items-center gap-1 ${nivelConfig.bgLight} ${nivelConfig.textColor} px-3 py-1 rounded-full text-sm font-semibold mt-1`}>
              <span className={`w-2 h-2 ${nivelConfig.color} rounded-full`}></span>
              {broker.nivel} Broker
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm">
            <Bell size={24} />
            {notificacionesPendientes > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {notificacionesPendientes}
              </span>
            )}
          </button>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition backdrop-blur-sm">
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Puntos este mes</p>
          <p className="text-4xl font-bold">{broker.puntosMes.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">
            {broker.progreso.puntosNecesarios} para siguiente nivel
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-1">Ranking</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold">#{broker.rangoActual}</p>
            <span className="text-lg opacity-75">/ 7</span>
          </div>
          <p className="text-xs opacity-75 mt-1">
            {broker.rangoActual <= 3 ? '🔥 Top 3!' : 'Sigue subiendo'}
          </p>
        </div>
      </div>
    </div>
  );
}
