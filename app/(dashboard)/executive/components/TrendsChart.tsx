// app/(dashboard)/executive/components/TrendsChart.tsx
'use client';

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Tendencias } from '@/lib/types';
import { useState } from 'react';

interface TrendsChartProps {
  tendencias: Tendencias;
}

type ChartType = 'actividad' | 'revenue' | 'conversion';

export default function TrendsChart({ tendencias }: TrendsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('actividad');

  // Formatear datos para cada tipo de gráfico
  const actividadData = tendencias.semanas.map((semana, index) => ({
    semana: `Sem ${index + 1}`,
    llamadas: tendencias.llamadas[index] || 0,
    presentaciones: tendencias.presentaciones[index] || 0,
    ventas: tendencias.ventas[index] || 0
  }));

  const revenueData = tendencias.semanas.map((semana, index) => ({
    semana: `Sem ${index + 1}`,
    revenue: tendencias.revenue[index] || 0,
    objetivo: tendencias.objetivoSemanal || 0
  }));

  const conversionData = tendencias.semanas.map((semana, index) => ({
    semana: `Sem ${index + 1}`,
    conversion: tendencias.tasasConversion[index] || 0,
    promedio: tendencias.promedioConversion || 0
  }));

  const chartConfig = {
    actividad: {
      title: 'Actividad del Equipo',
      subtitle: 'Llamadas, presentaciones y ventas por semana',
      data: actividadData,
      lines: [
        { key: 'llamadas', name: 'Llamadas', color: '#3B82F6', strokeWidth: 2 },
        { key: 'presentaciones', name: 'Presentaciones', color: '#8B5CF6', strokeWidth: 2 },
        { key: 'ventas', name: 'Ventas', color: '#10B981', strokeWidth: 3 }
      ]
    },
    revenue: {
      title: 'Revenue Semanal',
      subtitle: 'Ingresos generados vs objetivo',
      data: revenueData,
      lines: [
        { key: 'revenue', name: 'Revenue', color: '#10B981', strokeWidth: 3 },
        { key: 'objetivo', name: 'Objetivo', color: '#6B7280', strokeWidth: 2, strokeDasharray: '5 5' }
      ]
    },
    conversion: {
      title: 'Tasa de Conversión',
      subtitle: 'Porcentaje de conversión semanal',
      data: conversionData,
      lines: [
        { key: 'conversion', name: 'Conversión', color: '#F59E0B', strokeWidth: 3 },
        { key: 'promedio', name: 'Promedio', color: '#6B7280', strokeWidth: 2, strokeDasharray: '5 5' }
      ]
    }
  };

  const config = chartConfig[chartType];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-bold text-gray-800">
                {chartType === 'revenue'
                  ? new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      minimumFractionDigits: 0
                    }).format(entry.value)
                  : chartType === 'conversion'
                  ? `${entry.value.toFixed(1)}%`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.subtitle}</p>
            </div>
          </div>

          {/* Selector de tipo de gráfico */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setChartType('actividad')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'actividad'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Actividad
            </button>
            <button
              onClick={() => setChartType('revenue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'revenue'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType('conversion')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'conversion'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Conversión
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'revenue' ? (
            <AreaChart data={config.data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="semana"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('es-MX', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              {config.lines.map((line) => (
                <Area
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  fill={line.key === 'revenue' ? 'url(#colorRevenue)' : 'none'}
                  strokeDasharray={line.strokeDasharray}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="semana"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) =>
                  chartType === 'conversion' ? `${value}%` : value.toLocaleString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              />
              {config.lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  strokeDasharray={line.strokeDasharray}
                  dot={{ fill: line.color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {chartType === 'actividad' && (
            <>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Llamadas</p>
                <p className="text-lg font-bold text-blue-600">
                  {tendencias.llamadas.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Presentaciones</p>
                <p className="text-lg font-bold text-purple-600">
                  {tendencias.presentaciones.reduce((a, b) => a + b, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Ventas</p>
                <p className="text-lg font-bold text-green-600">
                  {tendencias.ventas.reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </>
          )}
          {chartType === 'revenue' && (
            <>
              <div>
                <p className="text-xs text-gray-600 mb-1">Revenue Total</p>
                <p className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0
                  }).format(tendencias.revenue.reduce((a, b) => a + b, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Promedio Semanal</p>
                <p className="text-lg font-bold text-gray-800">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0
                  }).format(
                    tendencias.revenue.reduce((a, b) => a + b, 0) / tendencias.semanas.length
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">vs Objetivo</p>
                <p className={`text-lg font-bold ${
                  tendencias.revenue.reduce((a, b) => a + b, 0) >=
                  (tendencias.objetivoSemanal || 0) * tendencias.semanas.length
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {(
                    (tendencias.revenue.reduce((a, b) => a + b, 0) /
                      ((tendencias.objetivoSemanal || 1) * tendencias.semanas.length)) *
                    100
                  ).toFixed(0)}
                  %
                </p>
              </div>
            </>
          )}
          {chartType === 'conversion' && (
            <>
              <div>
                <p className="text-xs text-gray-600 mb-1">Conv. Promedio</p>
                <p className="text-lg font-bold text-orange-600">
                  {tendencias.promedioConversion.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Mejor Semana</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.max(...tendencias.tasasConversion).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Tendencia</p>
                <p className={`text-lg font-bold ${
                  tendencias.tasasConversion[tendencias.tasasConversion.length - 1] >
                  tendencias.tasasConversion[0]
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {tendencias.tasasConversion[tendencias.tasasConversion.length - 1] >
                  tendencias.tasasConversion[0]
                    ? '↑ Subiendo'
                    : '↓ Bajando'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
