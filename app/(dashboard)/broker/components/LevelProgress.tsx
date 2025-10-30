// app/(dashboard)/broker/components/LevelProgress.tsx
'use client';

import { Trophy } from 'lucide-react';
import { BrokerProfile } from '@/lib/types';
import { NIVEL_CONFIG } from '@/lib/utils';

interface LevelProgressProps {
  broker: BrokerProfile;
}

export default function LevelProgress({ broker }: LevelProgressProps) {
  const nivelActual = NIVEL_CONFIG[broker.nivel];
  const nivelesArray = Object.keys(NIVEL_CONFIG) as Array<keyof typeof NIVEL_CONFIG>;
  const siguienteNivelIndex = nivelesArray.indexOf(broker.nivel) + 1;
  const siguienteNivel = siguienteNivelIndex < nivelesArray.length
    ? nivelesArray[siguienteNivelIndex]
    : null;

  const mensajesMotivacionales = [
    "¡Recién empezando! 💪",
    "¡Vas bien! Sigue así 🔥",
    "¡Estás cerca del siguiente nivel! 🚀",
    "¡Un poco más y lo logras! ⭐",
    "¡Excelente progreso! 🎯",
  ];

  const mensajeIndex = Math.min(Math.floor(broker.progreso.porcentaje / 20), 4);
  const mensaje = mensajesMotivacionales[mensajeIndex];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 -mt-8 mx-4 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className={nivelActual.textColor} size={24} />
          <h3 className="font-semibold text-gray-700">
            {siguienteNivel ? `Progreso a ${siguienteNivel}` : 'Nivel Máximo Alcanzado'}
          </h3>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {broker.progreso.porcentaje.toFixed(0)}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="relative">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${nivelActual.color} transition-all duration-500 ease-out relative`}
            style={{ width: `${Math.min(broker.progreso.porcentaje, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        {/* Indicadores de nivel */}
        <div className="flex justify-between mt-1">
          {nivelesArray.map((nivel, index) => {
            const config = NIVEL_CONFIG[nivel];
            const isPassed = index < nivelesArray.indexOf(broker.nivel);
            const isCurrent = nivel === broker.nivel;

            return (
              <div key={nivel} className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${
                  isPassed || isCurrent ? config.color : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs mt-1 ${
                  isCurrent ? config.textColor + ' font-bold' : 'text-gray-400'
                }`}>
                  {nivel.slice(0, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info de puntos */}
      <div className="flex items-center justify-between text-sm mt-3">
        <span className="text-gray-600">
          <span className="font-bold text-gray-800">{broker.progreso.actual}</span> / {broker.progreso.siguienteNivel} puntos
        </span>
        <span className="font-medium text-blue-600">
          +{broker.progreso.puntosNecesarios} más
        </span>
      </div>

      {/* Mensaje motivacional */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
        <p className="text-sm font-medium text-gray-700">
          {mensaje}
        </p>
      </div>

      {/* Beneficios del siguiente nivel */}
      {siguienteNivel && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Beneficios de {siguienteNivel}:
          </p>
          <div className="flex flex-wrap gap-2">
            {NIVEL_CONFIG[siguienteNivel].beneficios.map((beneficio, i) => (
              <span
                key={i}
                className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 border border-gray-200"
              >
                ✨ {beneficio}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">Comisión:</span>
            <span className="text-sm font-bold text-green-600">
              {NIVEL_CONFIG[siguienteNivel].comision}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
