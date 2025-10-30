// app/(dashboard)/executive/components/ExecutiveSummary.tsx
'use client';

import { TrendingUp, TrendingDown, Users, Target, DollarSign, Percent } from 'lucide-react';

interface SummaryMetric {
  valor: number;
  cambio: number;
  tendencia: 'up' | 'down' | 'neutral';
}

interface ExecutiveSummaryProps {
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
}

export default function ExecutiveSummary({
  totalBrokers,
  brokersActivos,
  pipelineTotal,
  revenueMes,
  conversionPromedio,
  cambios
}: ExecutiveSummaryProps) {
  const metrics = [
    {
      titulo: 'Equipo Activo',
      valor: brokersActivos,
      total: totalBrokers,
      cambio: cambios.brokers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      formato: 'number'
    },
    {
      titulo: 'Pipeline Total',
      valor: pipelineTotal.leads + pipelineTotal.oportunidades,
      subtexto: `${pipelineTotal.leads} leads + ${pipelineTotal.oportunidades} oport.`,
      cambio: cambios.pipeline,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      formato: 'number'
    },
    {
      titulo: 'Revenue del Mes',
      valor: revenueMes,
      cambio: cambios.revenue,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
      formato: 'currency'
    },
    {
      titulo: 'Conversión Promedio',
      valor: conversionPromedio,
      cambio: cambios.conversion,
      icon: Percent,
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
      formato: 'percentage'
    }
  ];

  const formatValue = (value: number, formato: string) => {
    switch (formato) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('es-MX');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.cambio > 0;
        const isNeutral = metric.cambio === 0;

        return (
          <div
            key={metric.titulo}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Gradient top border */}
            <div className={`h-1 bg-gradient-to-r ${metric.color}`}></div>

            <div className="p-6">
              {/* Header con icono */}
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.bgLight} p-3 rounded-xl`}>
                  <Icon className={metric.textColor} size={24} />
                </div>

                {/* Trending indicator */}
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {!isNeutral && (
                    isPositive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )
                  )}
                  <span>
                    {isNeutral ? '—' : `${isPositive ? '+' : ''}${metric.cambio}%`}
                  </span>
                </div>
              </div>

              {/* Título */}
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {metric.titulo}
              </h3>

              {/* Valor principal */}
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-800">
                  {formatValue(metric.valor, metric.formato)}
                </p>
                {metric.total && (
                  <span className="text-lg text-gray-400">
                    / {metric.total}
                  </span>
                )}
              </div>

              {/* Subtexto */}
              {metric.subtexto && (
                <p className="text-xs text-gray-500 mt-2">
                  {metric.subtexto}
                </p>
              )}

              {/* Barra de progreso (solo para Equipo Activo) */}
              {metric.total && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                      style={{ width: `${(metric.valor / metric.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {((metric.valor / metric.total) * 100).toFixed(0)}% activos
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
