// app/(dashboard)/broker/[brokerId]/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { brokerQueries } from '@/lib/supabase';
import DashboardHeader from '../components/DashboardHeader';
import LevelProgress from '../components/LevelProgress';
import MetricsGrid from '../components/MetricsGrid';
import GrowthPath from '../components/GrowthPath';
import DailyTasks from '../components/DailyTasks';
import MiniLeaderboard from '../components/MiniLeaderboard';
import AchievementsBadges from '../components/AchievementsBadges';

interface BrokerDashboardPageProps {
  params: {
    brokerId: string;
  };
}

export default async function BrokerDashboardPage({ params }: BrokerDashboardPageProps) {
  const { brokerId } = params;

  // Verificar autenticación y autorización
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Verificar que el usuario puede ver este dashboard
  if (user.role === 'broker' && user.brokerId !== brokerId) {
    redirect(`/broker/${user.brokerId}`);
  }

  // Obtener datos del dashboard
  const dashboardData = await brokerQueries.getBrokerDashboard(brokerId);

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Broker no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo cargar la información del dashboard.
          </p>
          <a
            href="/executive"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Ir al Dashboard Ejecutivo
          </a>
        </div>
      </div>
    );
  }

  const { broker, metricas, proyecciones, tareasPendientes, logrosRecientes, ranking } = dashboardData;

  // Handler para completar tareas (cliente-side necesario)
  const handleCompleteTask = async (taskId: string) => {
    'use server';
    // Implementar lógica de completar tarea
    // Actualizar en base de datos y recalcular puntos
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header del broker */}
      <DashboardHeader
        broker={broker}
        notificacionesPendientes={3}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto pb-12">
        {/* Progreso de nivel */}
        <LevelProgress broker={broker} />

        {/* Métricas principales */}
        <div className="px-4 mt-6">
          <MetricsGrid metricas={metricas} />
        </div>

        {/* Proyecciones y camino de crecimiento */}
        <GrowthPath proyecciones={proyecciones} />

        {/* Tareas diarias */}
        <DailyTasks
          tareas={tareasPendientes}
          onCompleteTask={handleCompleteTask}
        />

        {/* Mini Leaderboard */}
        <MiniLeaderboard
          ranking={ranking}
          currentBrokerId={brokerId}
        />

        {/* Logros recientes */}
        {logrosRecientes.length > 0 && (
          <AchievementsBadges logros={logrosRecientes} />
        )}

        {/* Footer motivacional */}
        <div className="px-4 mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  ¡Sigue así, {broker.nombre.split(' ')[0]}! 🚀
                </h3>
                <p className="text-blue-100">
                  Estás haciendo un gran trabajo. Mantén el impulso y alcanzarás tus metas.
                </p>
              </div>
              <div className="text-6xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white hover:bg-gray-50 rounded-xl p-4 shadow-md border border-gray-100 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Registrar Llamada</p>
                  <p className="text-xs text-gray-500">+5 puntos</p>
                </div>
              </div>
            </button>

            <button className="bg-white hover:bg-gray-50 rounded-xl p-4 shadow-md border border-gray-100 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Agendar Cita</p>
                  <p className="text-xs text-gray-500">+3 puntos</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
