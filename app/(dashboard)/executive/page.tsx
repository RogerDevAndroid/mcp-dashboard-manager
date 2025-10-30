// app/(dashboard)/executive/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ExecutiveHeader from './components/ExecutiveHeader';
import DynamicFilters, { FilterConfig } from './components/DynamicFilters';
import ExecutiveSummary from './components/ExecutiveSummary';
import AlertsPanel from './components/AlertsPanel';
import TopPerformersTable from './components/TopPerformersTable';
import TrendsChart from './components/TrendsChart';
import PipelineFunnel from './components/PipelineFunnel';
import { ExecutiveDashboardData, BrokerProfile } from '@/lib/types';

export default function ExecutiveDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; role: string } | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      end: new Date().toISOString(),
      preset: 'month'
    },
    brokers: [],
    pipelines: [],
    stages: []
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Verificar autenticación
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Verificar permisos
      if (!['director', 'admin', 'manager'].includes(user.role)) {
        router.push(`/broker/${user.brokerId}`);
        return;
      }

      setCurrentUser({ nombre: user.nombre, role: user.role });

      // Construir query params para filtros
      const params = new URLSearchParams({
        dateStart: filters.dateRange.start,
        dateEnd: filters.dateRange.end
      });

      if (filters.brokers.length > 0) {
        params.append('brokers', filters.brokers.join(','));
      }
      if (filters.stages.length > 0) {
        params.append('stages', filters.stages.join(','));
      }
      if (filters.minRevenue) {
        params.append('minRevenue', filters.minRevenue.toString());
      }
      if (filters.maxRevenue) {
        params.append('maxRevenue', filters.maxRevenue.toString());
      }

      // Fetch dashboard data
      const response = await fetch(`/api/executive/dashboard?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const dashboardData = await response.json();
      setData(dashboardData);

      // Fetch brokers list for filters
      const brokersResponse = await fetch('/api/broker/list');
      if (brokersResponse.ok) {
        const brokersData = await brokersResponse.json();
        setBrokers(brokersData.brokers || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    // Implementar exportación a Excel/CSV
    console.log('Exportando datos...');
    alert('Funcionalidad de exportación en desarrollo');
  };

  const handleApplyFilters = (newFilters: FilterConfig) => {
    setFilters(newFilters);
  };

  const handleDismissAlert = async (alertId: string) => {
    // Implementar dismissal de alerta en backend
    console.log('Dismissing alert:', alertId);
  };

  const handleViewBrokerDetails = (brokerId: string) => {
    router.push(`/broker/${brokerId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar datos
          </h1>
          <p className="text-gray-600 mb-6">
            No se pudo cargar la información del dashboard ejecutivo.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* Header */}
      <ExecutiveHeader
        lastUpdate={data.lastUpdate}
        userName={currentUser?.nombre}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filtros dinámicos */}
        <DynamicFilters
          onApplyFilters={handleApplyFilters}
          initialFilters={filters}
          availableBrokers={brokers}
        />

        {/* Summary cards */}
        <ExecutiveSummary
          totalBrokers={data.resumen.totalBrokers}
          brokersActivos={data.resumen.brokersActivos}
          pipelineTotal={data.resumen.pipelineTotal}
          revenueMes={data.resumen.revenueMes}
          conversionPromedio={data.resumen.conversionPromedio}
          cambios={data.resumen.cambios}
        />

        {/* Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Alerts (1/3 width) */}
          <div className="lg:col-span-1">
            <AlertsPanel
              alertas={data.alertas}
              onDismiss={handleDismissAlert}
            />
          </div>

          {/* Right column - Top Performers (2/3 width) */}
          <div className="lg:col-span-2">
            <TopPerformersTable
              brokers={data.topPerformers}
              onViewDetails={handleViewBrokerDetails}
            />
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends chart */}
          <div>
            <TrendsChart tendencias={data.tendencias} />
          </div>

          {/* Pipeline funnel */}
          <div>
            <PipelineFunnel
              stages={data.pipeline}
              totalLeads={data.resumen.pipelineTotal.leads + data.resumen.pipelineTotal.oportunidades}
              totalRevenue={data.resumen.revenueMes}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Nuevo Broker</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Generar Reporte</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Configuración</span>
            </button>

            <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Notificaciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
