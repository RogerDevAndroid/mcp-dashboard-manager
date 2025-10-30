// app/(dashboard)/broker/components/GrowthPath.tsx
'use client';

import { Proyecciones } from '@/lib/types';
import { TrendingUp, Phone, Presentation, DollarSign, Calendar, Target, Zap } from 'lucide-react';

interface GrowthPathProps {
  proyecciones: Proyecciones;
}

export default function GrowthPath({ proyecciones }: GrowthPathProps) {
  const actividades = [
    {
      icon: Phone,
      label: 'Llamadas diarias',
      value: proyecciones.actividades.llamadasDiarias,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Presentation,
      label: 'Presentaciones/semana',
      value: proyecciones.actividades.presentacionesSemanales,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: DollarSign,
      label: 'Ventas proyectadas',
      value: proyecciones.actividades.ventasProyectadas,
      color: 'text-green-600',
      bg: 'bg-green-50',
      bgGradient: 'from-green-500 to-green-600'
    }
  ];

  const isOnTrack = proyecciones.promedioActual >= proyecciones.promedioNecesario;

  return (
    <div className="px-4 mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-600" />
        Tu Ruta de Crecimiento
      </h3>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        {/* Header con estado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={24} />
            <h4 className="font-bold text-lg">Objetivo del Mes</h4>
          </div>
          {isOnTrack ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap size={12} />
              En buen camino
            </span>
          ) : (
            <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Acelera el ritmo
            </span>
          )}
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="opacity-90" />
              <span className="text-sm opacity-90">Puntos necesarios</span>
            </div>
            <p className="text-3xl font-bold">{proyecciones.puntosNecesarios}</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="opacity-90" />
              <span className="text-sm opacity-90">Días restantes</span>
            </div>
            <p className="text-3xl font-bold">{proyecciones.diasRestantes}</p>
          </div>
        </div>

        {/* Promedios */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs opacity-75 mb-1">Promedio actual</p>
              <p className="text-2xl font-bold">{proyecciones.promedioActual}</p>
              <p className="text-xs opacity-75">pts/día</p>
            </div>
            <div>
              <p className="text-xs opacity-75 mb-1">Promedio necesario</p>
              <p className="text-2xl font-bold">{proyecciones.promedioNecesario}</p>
              <p className="text-xs opacity-75">pts/día</p>
            </div>
          </div>

          {/* Barra de comparación */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isOnTrack ? 'bg-green-400' : 'bg-yellow-400'} transition-all duration-500`}
                  style={{ width: `${Math.min((proyecciones.promedioActual / proyecciones.promedioNecesario) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold">
                {((proyecciones.promedioActual / proyecciones.promedioNecesario) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actividades necesarias */}
        <div className="border-t border-white/30 pt-4">
          <p className="text-sm font-semibold mb-3 opacity-90">
            Para alcanzar tu objetivo, necesitas:
          </p>

          <div className="space-y-3">
            {actividades.map((act, index) => {
              const Icon = act.icon;
              return (
                <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-br ${act.bgGradient} rounded-lg p-2 shadow-lg`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <span className="text-sm font-medium">{act.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{act.value}</span>
                    {act.value > 0 && (
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consejo motivacional */}
        <div className="mt-6 bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-400 rounded-full p-2 mt-0.5">
              <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">💡 Consejo del día</p>
              <p className="text-xs opacity-90">
                {isOnTrack
                  ? '¡Excelente! Mantén este ritmo y superarás tu objetivo. Enfócate en la calidad de tus presentaciones.'
                  : 'Aumenta tu actividad diaria. Programa más llamadas en las mañanas y enfócate en leads calientes.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
