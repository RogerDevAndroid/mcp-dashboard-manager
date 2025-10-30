// app/(dashboard)/executive/components/TopPerformersTable.tsx
'use client';

import { TrendingUp, TrendingDown, Award, Eye } from 'lucide-react';
import { BrokerPerformance } from '@/lib/types';
import { NIVEL_CONFIG, formatCurrency } from '@/lib/utils';

interface TopPerformersTableProps {
  brokers: BrokerPerformance[];
  onViewDetails?: (brokerId: string) => void;
}

export default function TopPerformersTable({ brokers, onViewDetails }: TopPerformersTableProps) {
  const getBadgeForPosition = (posicion: number) => {
    const badges: Record<number, string> = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };
    return badges[posicion] || `#${posicion}`;
  };

  const getTrendIcon = (cambio: number) => {
    if (cambio > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (cambio < 0) return <TrendingDown className="text-red-500" size={16} />;
    return <span className="text-gray-400 text-xs">—</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <Award className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">Top Performers del Mes</h3>
            <p className="text-sm text-gray-600">
              Ranking de brokers por desempeño general
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ranking
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Broker
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nivel
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ventas
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Conv. %
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cambio
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brokers.map((broker) => {
              const nivelConfig = NIVEL_CONFIG[broker.nivel as keyof typeof NIVEL_CONFIG];

              return (
                <tr
                  key={broker.brokerId}
                  className={`hover:bg-gray-50 transition-colors ${
                    broker.posicion <= 3 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  {/* Ranking */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getBadgeForPosition(broker.posicion)}
                      </span>
                      {broker.posicion <= 3 && (
                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full"></div>
                      )}
                    </div>
                  </td>

                  {/* Broker */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
                        {broker.posicion <= 3 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            {broker.posicion}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{broker.nombre}</p>
                        <p className="text-xs text-gray-500">{broker.email || 'Sin email'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Nivel */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${nivelConfig.bgLight} ${nivelConfig.textColor}`}>
                      <span className={`w-2 h-2 ${nivelConfig.color} rounded-full`}></span>
                      {broker.nivel}
                    </span>
                  </td>

                  {/* Puntos */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <p className="text-lg font-bold text-gray-800">
                      {broker.puntos.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </td>

                  {/* Ventas */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <p className="text-lg font-bold text-green-600">
                      {broker.metricas.ventas}
                    </p>
                    <p className="text-xs text-gray-500">cerradas</p>
                  </td>

                  {/* Revenue */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatCurrency(broker.metricas.revenue)}
                    </p>
                  </td>

                  {/* Conversión */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <p className={`text-sm font-bold ${
                        broker.metricas.tasaConversion >= 15 ? 'text-green-600' :
                        broker.metricas.tasaConversion >= 10 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {broker.metricas.tasaConversion.toFixed(1)}%
                      </p>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            broker.metricas.tasaConversion >= 15 ? 'bg-green-500' :
                            broker.metricas.tasaConversion >= 10 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(broker.metricas.tasaConversion * 5, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Cambio de posición */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(broker.cambio)}
                      {broker.cambio !== 0 && (
                        <span className={`text-sm font-medium ${
                          broker.cambio > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(broker.cambio)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onViewDetails && onViewDetails(broker.brokerId)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas del equipo */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Promedio Puntos</p>
            <p className="text-lg font-bold text-gray-800">
              {Math.round(brokers.reduce((sum, b) => sum + b.puntos, 0) / brokers.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Ventas</p>
            <p className="text-lg font-bold text-green-600">
              {brokers.reduce((sum, b) => sum + b.metricas.ventas, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Revenue Total</p>
            <p className="text-lg font-bold text-gray-800">
              {formatCurrency(brokers.reduce((sum, b) => sum + b.metricas.revenue, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Conv. Promedio</p>
            <p className="text-lg font-bold text-blue-600">
              {(brokers.reduce((sum, b) => sum + b.metricas.tasaConversion, 0) / brokers.length).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
