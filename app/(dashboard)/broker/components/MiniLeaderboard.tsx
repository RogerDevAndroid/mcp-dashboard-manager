// app/(dashboard)/broker/components/MiniLeaderboard.tsx
'use client';

import { LeaderboardEntry } from '@/lib/types';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { NIVEL_CONFIG } from '@/lib/utils';

interface MiniLeaderboardProps {
  ranking: LeaderboardEntry[];
  currentBrokerId: string;
}

export default function MiniLeaderboard({ ranking, currentBrokerId }: MiniLeaderboardProps) {
  const top3 = ranking.slice(0, 3);
  const currentBroker = ranking.find(r => r.brokerId === currentBrokerId);
  const currentBrokerInTop3 = currentBroker && currentBroker.posicion <= 3;

  return (
    <div className="px-4 mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-yellow-500" />
          Ranking del Mes
        </h3>
        <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
          Ver todos
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Top 3 */}
        <div className="p-4 space-y-3">
          {top3.map((entry) => {
            const isCurrentUser = entry.brokerId === currentBrokerId;
            const nivelConfig = NIVEL_CONFIG[entry.nivel as keyof typeof NIVEL_CONFIG];

            return (
              <div
                key={entry.brokerId}
                className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Badge/Posición */}
                  <div className="flex-shrink-0">
                    {entry.badge ? (
                      <span className="text-3xl">{entry.badge}</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-400">#{entry.posicion}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.nombre}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        entry.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                    {/* Indicador de nivel */}
                    <div className={`absolute -bottom-1 -right-1 ${nivelConfig.color} text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white`}>
                      {entry.nivel.slice(0, 1)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                      {entry.nombre}
                      {isCurrentUser && <span className="ml-2 text-xs font-normal">(Tú)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${nivelConfig.bgLight} ${nivelConfig.textColor} font-medium`}>
                        {entry.nivel}
                      </span>
                      {entry.metricas && (
                        <span className="text-xs text-gray-500">
                          {entry.metricas.ventas} ventas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Puntos */}
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-xl font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                    {entry.puntos.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">puntos</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current user si no está en top 3 */}
        {currentBroker && !currentBrokerInTop3 && (
          <>
            <div className="border-t border-gray-200 mx-4"></div>
            <div className="p-4">
              <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg font-bold text-gray-600 min-w-[40px]">
                    #{currentBroker.posicion}
                  </span>

                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                      {currentBroker.avatar ? (
                        <img
                          src={currentBroker.avatar}
                          alt={currentBroker.nombre}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        currentBroker.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-blue-700 truncate">
                      {currentBroker.nombre} <span className="text-xs font-normal">(Tú)</span>
                    </p>
                    <p className="text-xs text-gray-500">{currentBroker.nivel}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xl font-bold text-blue-600">
                    {currentBroker.puntos.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">puntos</p>
                </div>
              </div>

              {/* Mensaje motivacional */}
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-gray-700">
                  💪 <strong>Estás cerca del top 3!</strong> Necesitas{' '}
                  <span className="font-bold text-yellow-700">
                    {ranking[2]?.puntos ? (ranking[2].puntos - currentBroker.puntos + 1) : 0}
                  </span>{' '}
                  puntos más para alcanzar la posición #{3}.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Footer con stats del equipo */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Promedio del equipo</span>
            <span className="font-bold text-gray-800">
              {Math.round(ranking.reduce((sum, r) => sum + r.puntos, 0) / ranking.length).toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores de cambio (si hay trending data) */}
      {currentBroker && (currentBroker as any).trending && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          {(currentBroker as any).trending === 'up' ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-green-600 font-medium">Subiste posiciones</span>
            </>
          ) : (currentBroker as any).trending === 'down' ? (
            <>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-red-600 font-medium">Bajaste posiciones</span>
            </>
          ) : (
            <span className="text-gray-500">Sin cambios</span>
          )}
        </div>
      )}
    </div>
  );
}
