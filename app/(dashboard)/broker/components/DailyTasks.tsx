// app/(dashboard)/broker/components/DailyTasks.tsx
'use client';

import { useState } from 'react';
import { TareaBroker } from '@/lib/types';
import { CheckCircle2, Circle, Clock, Flame, Phone, Mail, Video, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DailyTasksProps {
  tareas: TareaBroker[];
  onCompleteTask?: (taskId: string) => void;
}

export default function DailyTasks({ tareas, onCompleteTask }: DailyTasksProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleComplete = async (taskId: string) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));

    if (onCompleteTask) {
      try {
        await onCompleteTask(taskId);
      } catch (error) {
        // Revertir si falla
        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    }
  };

  const getPriorityIcon = (prioridad: string) => {
    if (prioridad === 'alta') return <Flame className="text-red-500" size={16} />;
    return null;
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'border-l-red-500 bg-red-50/50';
      case 'media': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'baja': return 'border-l-green-500 bg-green-50/50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const getTaskIcon = (tipo: string) => {
    switch (tipo) {
      case 'llamada': return <Phone size={16} className="text-blue-600" />;
      case 'email': return <Mail size={16} className="text-purple-600" />;
      case 'presentacion': return <Video size={16} className="text-green-600" />;
      case 'seguimiento': return <Users size={16} className="text-orange-600" />;
      default: return <Circle size={16} className="text-gray-400" />;
    }
  };

  const tareasOrdenadas = [...tareas].sort((a, b) => {
    const prioridadOrden = { 'alta': 0, 'media': 1, 'baja': 2 };
    return prioridadOrden[a.prioridad as keyof typeof prioridadOrden] - prioridadOrden[b.prioridad as keyof typeof prioridadOrden];
  });

  const tareasPendientes = tareasOrdenadas.filter(t => !completedTasks.has(t.id));
  const tareasCompletadas = tareasOrdenadas.filter(t => completedTasks.has(t.id));

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">Tareas del Día</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {tareasPendientes.length} pendientes
          </span>
          {tareasCompletadas.length > 0 && (
            <span className="text-sm text-green-600 font-medium">
              • {tareasCompletadas.length} completadas
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Tareas pendientes */}
        {tareasPendientes.map((tarea) => (
          <div
            key={tarea.id}
            className={`${getPriorityColor(tarea.prioridad)} rounded-xl shadow-sm border-l-4 p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleComplete(tarea.id)}
                className="mt-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              >
                <Circle className="text-gray-400 hover:text-blue-600" size={24} />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-gray-800 flex-1">
                    {tarea.descripcion}
                  </h4>
                  {getPriorityIcon(tarea.prioridad)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  {/* Tipo de tarea */}
                  <div className="flex items-center gap-1">
                    {getTaskIcon(tarea.tipo)}
                    <span className="capitalize">{tarea.tipo}</span>
                  </div>

                  {/* Fecha de vencimiento */}
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatDate(tarea.vence)}</span>
                  </div>

                  {/* Puntos */}
                  <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    +{tarea.puntos} pts
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Tareas completadas */}
        {tareasCompletadas.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-3">✅ Completadas Hoy</p>
            {tareasCompletadas.map((tarea) => (
              <div
                key={tarea.id}
                className="bg-gray-50 rounded-xl p-3 mb-2 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 line-through flex-1">
                    {tarea.descripcion}
                  </span>
                  <span className="text-xs text-green-600 font-medium">
                    +{tarea.puntos} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío */}
        {tareasPendientes.length === 0 && tareasCompletadas.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg font-semibold text-gray-700">¡No hay tareas pendientes!</p>
            <p className="text-sm text-gray-500 mt-2">Buen trabajo hoy. Disfruta tu día.</p>
          </div>
        )}
      </div>

      {/* Resumen de puntos disponibles */}
      {tareasPendientes.length > 0 && (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Puntos Disponibles</p>
              <p className="text-xs text-gray-600 mt-1">
                Completa todas las tareas para ganar
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                +{tareasPendientes.reduce((sum, t) => sum + t.puntos, 0)}
              </p>
              <p className="text-xs text-gray-600">puntos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
