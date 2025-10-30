// app/(dashboard)/executive/components/AlertsPanel.tsx
'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle, X, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface AlertsPanelProps {
  alertas: Alert[];
  onDismiss?: (alertId: string) => void;
}

export default function AlertsPanel({ alertas, onDismiss }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlertas = alertas.filter(alerta => !dismissedAlerts.has(alerta.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onDismiss) {
      onDismiss(alertId);
    }
  };

  const getAlertConfig = (tipo: Alert['tipo'], prioridad: Alert['prioridad']) => {
    const configs = {
      rendimiento: {
        icon: TrendingDown,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      inactividad: {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      meta: {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      oportunidad: {
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      sistema: {
        icon: CheckCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      }
    };

    return configs[tipo] || configs.sistema;
  };

  const getPriorityBadge = (prioridad: Alert['prioridad']) => {
    const badges = {
      alta: { text: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' },
      media: { text: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      baja: { text: 'Baja', color: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    return badges[prioridad];
  };

  if (visibleAlertas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <div className="text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Todo está bajo control
          </h3>
          <p className="text-sm text-gray-500">
            No hay alertas que requieran tu atención en este momento.
          </p>
        </div>
      </div>
    );
  }

  // Agrupar alertas por prioridad
  const alertasPorPrioridad = {
    alta: visibleAlertas.filter(a => a.prioridad === 'alta'),
    media: visibleAlertas.filter(a => a.prioridad === 'media'),
    baja: visibleAlertas.filter(a => a.prioridad === 'baja')
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Centro de Alertas</h3>
              <p className="text-sm text-gray-600">
                {visibleAlertas.length} alerta{visibleAlertas.length !== 1 ? 's' : ''} activa{visibleAlertas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Resumen por prioridad */}
          <div className="flex gap-3">
            {alertasPorPrioridad.alta.length > 0 && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                {alertasPorPrioridad.alta.length} Alta
              </div>
            )}
            {alertasPorPrioridad.media.length > 0 && (
              <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                {alertasPorPrioridad.media.length} Media
              </div>
            )}
            {alertasPorPrioridad.baja.length > 0 && (
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                {alertasPorPrioridad.baja.length} Baja
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {visibleAlertas.map((alerta) => {
          const config = getAlertConfig(alerta.tipo, alerta.prioridad);
          const priorityBadge = getPriorityBadge(alerta.prioridad);
          const Icon = config.icon;

          return (
            <div
              key={alerta.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${config.bgColor} bg-opacity-20`}
            >
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className={`${config.bgColor} p-2 rounded-lg flex-shrink-0 border ${config.borderColor}`}>
                  <Icon className={config.color} size={20} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800">
                        {alerta.titulo}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityBadge.color}`}>
                        {priorityBadge.text}
                      </span>
                    </div>

                    {/* Botón dismiss */}
                    <button
                      onClick={() => handleDismiss(alerta.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      title="Descartar alerta"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {alerta.mensaje}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDate(alerta.fecha)}</span>
                    {alerta.brokerId && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="font-medium text-gray-600">
                          {alerta.brokerNombre}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Acción recomendada */}
                  {alerta.accion && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Acción recomendada:</span> {alerta.accion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con acciones */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDismissedAlerts(new Set(alertas.map(a => a.id)))}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Descartar todas
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Ver historial completo →
          </button>
        </div>
      </div>
    </div>
  );
}
