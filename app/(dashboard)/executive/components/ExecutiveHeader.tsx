// app/(dashboard)/executive/components/ExecutiveHeader.tsx
'use client';

import { Calendar, Download, RefreshCw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ExecutiveHeaderProps {
  lastUpdate: string;
  userName?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

export default function ExecutiveHeader({ lastUpdate, userName, onRefresh, onExport }: ExecutiveHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white p-6 shadow-xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
              <p className="text-slate-300 mt-1 flex items-center gap-2">
                Selvadentro Tulum - Performance del Equipo
                {userName && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-sm">Bienvenido, {userName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {/* Última actualización */}
            <div className="text-right mr-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-xs text-slate-400">Última actualización</p>
              <p className="text-sm font-medium flex items-center gap-1 mt-1">
                <Calendar size={14} />
                {new Date(lastUpdate).toLocaleString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Botón refresh */}
            <button
              onClick={handleRefresh}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              title="Actualizar datos"
            >
              <RefreshCw size={16} />
              <span className="text-sm font-medium">Actualizar</span>
            </button>

            {/* Botón export */}
            {onExport && (
              <button
                onClick={onExport}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
                title="Exportar datos"
              >
                <Download size={16} />
                <span className="text-sm font-medium">Exportar</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación secundaria (opcional) */}
        <div className="mt-6 flex items-center gap-2">
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Vista General
          </button>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Brokers
          </button>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Pipeline
          </button>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
