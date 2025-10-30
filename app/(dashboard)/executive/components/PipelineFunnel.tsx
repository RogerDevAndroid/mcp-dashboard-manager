// app/(dashboard)/executive/components/PipelineFunnel.tsx
'use client';

import { Filter, Users, Phone, Calendar, Target, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PipelineStage {
  etapa: string;
  cantidad: number;
  valor: number;
  tasaConversion: number;
}

interface PipelineFunnelProps {
  stages: PipelineStage[];
  totalLeads: number;
  totalRevenue: number;
}

export default function PipelineFunnel({ stages, totalLeads, totalRevenue }: PipelineFunnelProps) {
  const stageConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    'nuevo': {
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      label: 'Nuevos Leads'
    },
    'contactado': {
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      label: 'Contactados'
    },
    'presentacion': {
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      label: 'Presentaciones'
    },
    'negociacion': {
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      label: 'Negociación'
    },
    'ganado': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      label: 'Ganadas'
    },
    'perdido': {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      label: 'Perdidas'
    }
  };

  // Calcular el ancho máximo para el primer stage (100%)
  const maxCantidad = stages.length > 0 ? stages[0].cantidad : 1;

  // Filtrar stages activos (sin perdido para el funnel principal)
  const funnelStages = stages.filter(s => s.etapa !== 'perdido');
  const lostStage = stages.find(s => s.etapa === 'perdido');

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Filter className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Pipeline de Ventas</h3>
              <p className="text-sm text-gray-600">
                Conversión desde lead hasta venta
              </p>
            </div>
          </div>

          {/* Stats generales */}
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalLeads.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Revenue Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="p-8">
        <div className="space-y-4">
          {funnelStages.map((stage, index) => {
            const config = stageConfig[stage.etapa];
            const Icon = config?.icon || Users;
            const widthPercentage = (stage.cantidad / maxCantidad) * 100;
            const isLastStage = index === funnelStages.length - 1;

            return (
              <div key={stage.etapa} className="relative">
                {/* Stage bar */}
                <div
                  className={`relative ${config?.bgColor || 'bg-gray-500'} rounded-lg overflow-hidden transition-all duration-500 hover:shadow-lg group`}
                  style={{ width: `${widthPercentage}%`, minWidth: '40%' }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>

                  {/* Content */}
                  <div className="relative flex items-center justify-between p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">
                          {config?.label || stage.etapa}
                        </h4>
                        <p className="text-sm opacity-90">
                          {stage.cantidad.toLocaleString()} contactos
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(stage.valor)}
                      </p>
                      {stage.tasaConversion > 0 && (
                        <p className="text-sm opacity-90">
                          {stage.tasaConversion.toFixed(1)}% conversión
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                </div>

                {/* Connector arrow */}
                {!isLastStage && (
                  <div className="flex items-center justify-center my-2 ml-8">
                    <div className="text-gray-400">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lost deals section */}
        {lostStage && lostStage.cantidad > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <XCircle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Oportunidades Perdidas
                    </h4>
                    <p className="text-sm text-gray-600">
                      {lostStage.cantidad.toLocaleString()} contactos no convertidos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(lostStage.valor)}
                  </p>
                  <p className="text-xs text-gray-600">valor potencial perdido</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights y métricas */}
      <div className="bg-gray-50 border-t border-gray-200 p-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Tasa de conversión global */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Conversión Global</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-bold text-green-600">
                {totalLeads > 0
                  ? ((stages.find(s => s.etapa === 'ganado')?.cantidad || 0) / totalLeads * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${totalLeads > 0
                    ? ((stages.find(s => s.etapa === 'ganado')?.cantidad || 0) / totalLeads * 100)
                    : 0}%`
                }}
              ></div>
            </div>
          </div>

          {/* Ticket promedio */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Ticket Promedio</p>
            <p className="text-2xl font-bold text-blue-600">
              {stages.find(s => s.etapa === 'ganado')?.cantidad
                ? formatCurrency(
                    (stages.find(s => s.etapa === 'ganado')?.valor || 0) /
                      (stages.find(s => s.etapa === 'ganado')?.cantidad || 1)
                  )
                : formatCurrency(0)}
            </p>
          </div>

          {/* Oportunidades activas */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">En Pipeline</p>
            <p className="text-2xl font-bold text-orange-600">
              {funnelStages
                .filter(s => s.etapa !== 'ganado')
                .reduce((sum, s) => sum + s.cantidad, 0)
                .toLocaleString()}
            </p>
          </div>

          {/* Valor potencial */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Valor Potencial</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                funnelStages
                  .filter(s => s.etapa !== 'ganado')
                  .reduce((sum, s) => sum + s.valor, 0)
              )}
            </p>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Recomendaciones de Optimización
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {funnelStages[0]?.tasaConversion < 50 && (
                  <li>• Mejorar el seguimiento en etapa inicial para aumentar contactos</li>
                )}
                {stages.find(s => s.etapa === 'negociacion')?.tasaConversion < 30 && (
                  <li>• Reforzar técnicas de cierre en la etapa de negociación</li>
                )}
                {(stages.find(s => s.etapa === 'perdido')?.cantidad || 0) >
                  (stages.find(s => s.etapa === 'ganado')?.cantidad || 0) && (
                  <li>• Analizar razones de pérdida para mejorar proceso de ventas</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
