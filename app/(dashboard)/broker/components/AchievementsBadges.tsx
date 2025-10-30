// app/(dashboard)/broker/components/AchievementsBadges.tsx
'use client';

import { Achievement } from '@/lib/types';
import { Award, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AchievementsBadgesProps {
  logros: Achievement[];
}

export default function AchievementsBadges({ logros }: AchievementsBadgesProps) {
  if (logros.length === 0) return null;

  return (
    <div className="px-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="text-yellow-500" size={20} />
        <h3 className="font-bold text-lg text-gray-800">Logros Recientes</h3>
        {logros.length > 0 && (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
            {logros.length} nuevo{logros.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {logros.map((logro, index) => (
          <div
            key={logro.id}
            className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-yellow-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Badge de "nuevo" */}
            {index < 2 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                <Sparkles size={10} />
                ¡Nuevo!
              </div>
            )}

            {/* Emoji del logro */}
            <div className="text-5xl mb-3 text-center animate-pulse">
              {logro.icon}
            </div>

            {/* Nombre del logro */}
            <h4 className="font-bold text-gray-800 text-sm text-center mb-1">
              {logro.nombre}
            </h4>

            {/* Descripción */}
            <p className="text-xs text-gray-600 text-center leading-tight">
              {logro.descripcion}
            </p>

            {/* Fecha */}
            {logro.fecha && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs text-gray-500 text-center">
                  {formatDate(logro.fecha)}
                </p>
              </div>
            )}

            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Progreso de logros (opcional - mostrar cuántos logros ha desbloqueado de todos) */}
      <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progreso de Logros</span>
          <span className="text-sm text-gray-600">{logros.length} / 8</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
            style={{ width: `${(logros.length / 8) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {logros.length < 8
            ? `¡${8 - logros.length} logro${8 - logros.length !== 1 ? 's' : ''} más por desbloquear!`
            : '¡Has desbloqueado todos los logros! 🎉'}
        </p>
      </div>

      {/* Call to action para seguir */}
      {logros.length < 8 && (
        <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Próximos Logros
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {!logros.find(l => l.id === 'call-machine') && (
                  <li>• 📞 <strong>Call Machine:</strong> 100 llamadas en un mes</li>
                )}
                {!logros.find(l => l.id === 'presenter-pro') && (
                  <li>• 🎤 <strong>Presenter Pro:</strong> 50 presentaciones</li>
                )}
                {!logros.find(l => l.id === 'the-closer') && (
                  <li>• 💰 <strong>The Closer:</strong> 10 ventas cerradas</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
