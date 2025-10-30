// app/(dashboard)/broker/components/MetricsGrid.tsx
'use client';

import { BrokerMetrics } from '@/lib/types';
import { Phone, Presentation, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MetricsGridProps {
  metricas: BrokerMetrics;
}

export default function MetricsGrid({ metricas }: MetricsGridProps) {
  const metrics = [
    {
      label: 'Llamadas Hoy',
      value: metricas.llamadasHoy,
      icon: Phone,
      color: 'bg-blue-100 text-blue-600',
      bgGradient: 'from-blue-500 to-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Presentaciones',
      value: metricas.presentacionesSemana,
      subtitle: 'esta semana',
      icon: Presentation,
      color: 'bg-purple-100 text-purple-600',
      bgGradient: 'from-purple-500 to-purple-600',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Leads',
      value: `${metricas.leadsContactados}/${metricas.leadsAsignados}`,
      subtitle: 'contactados',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      bgGradient: 'from-orange-500 to-orange-600',
      trend: `${metricas.leadsAsignados > 0 ? ((metricas.leadsContactados / metricas.leadsAsignados) * 100).toFixed(0) : 0}%`,
      trendUp: metricas.leadsContactados / metricas.leadsAsignados >= 0.7
    },
    {
      label: 'Conversión',
      value: `${metricas.tasaConversion.toFixed(1)}%`,
      icon: Target,
      color: 'bg-green-100 text-green-600',
      bgGradient: 'from-green-500 to-green-600',
      trend: metricas.tasaConversion >= 20 ? 'Excelente' : 'Mejorando',
      trendUp: metricas.tasaConversion >= 20
    },
    {
      label: 'Oportunidades',
      value: metricas.oportunidadesAbiertas,
      subtitle: 'abiertas',
      icon: CheckCircle,
      color: 'bg-indigo-100 text-indigo-600',
      bgGradient: 'from-indigo-500 to-indigo-600',
      trend: `${metricas.oportunidadesAbiertas} activas`,
      trendUp: metricas.oportunidadesAbiertas > 0
    },
    {
      label: 'Revenue',
      value: formatCurrency(metricas.revenueMes),
      subtitle: 'este mes',
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600',
      bgGradient: 'from-yellow-500 to-yellow-600',
      trend: '+18%',
      trendUp: true
    }
  ];

  return (
    <div className="px-4 mt-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Métricas del Mes</h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {/* Icon con gradient */}
              <div className={`bg-gradient-to-br ${metric.bgGradient} w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                <Icon size={24} className="text-white" />
              </div>

              {/* Valor principal */}
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {metric.value}
              </p>

              {/* Label */}
              <p className="text-xs text-gray-600 font-medium">
                {metric.label}
              </p>

              {/* Subtitle si existe */}
              {metric.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {metric.subtitle}
                </p>
              )}

              {/* Trend indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${metric.trendUp ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                    {metric.trend}
                  </span>
                </div>
                {metric.trendUp && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen rápido */}
      <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Resumen del Mes</p>
            <p className="text-xs text-gray-600 mt-1">
              {metricas.ventasMes} ventas • {metricas.presentacionesSemana} presentaciones
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(metricas.revenueMes)}
            </p>
            <p className="text-xs text-gray-600">Revenue Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
