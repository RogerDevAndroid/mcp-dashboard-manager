// app/(dashboard)/executive/components/DynamicFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Filter, Save, X } from 'lucide-react';

export interface FilterConfig {
  dateRange: {
    start: string;
    end: string;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  };
  brokers: string[];
  pipelines: string[];
  stages: string[];
  minRevenue?: number;
  maxRevenue?: number;
  leadSource?: string[];
  activityTypes?: string[];
}

interface DynamicFiltersProps {
  initialFilters?: FilterConfig;
  availableBrokers: Array<{ id?: string; broker_id?: string; nombre?: string; name?: string; email?: string }>;
  availablePipelines?: Array<{ id: string; name: string }>;
  onFilterChange?: (filters: FilterConfig) => void;
  onApplyFilters?: (filters: FilterConfig) => void;
  onSaveFilter?: (name: string, filters: FilterConfig) => void;
}

export default function DynamicFilters({
  initialFilters,
  availableBrokers,
  availablePipelines = [],
  onFilterChange,
  onApplyFilters,
  onSaveFilter,
}: DynamicFiltersProps) {
  const handleFilterChange = onFilterChange || onApplyFilters;
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Estado de filtros
  const [filters, setFilters] = useState<FilterConfig>(
    initialFilters || {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        preset: 'month',
      },
      brokers: [],
      pipelines: [],
      stages: [],
      minRevenue: undefined,
      maxRevenue: undefined,
      leadSource: [],
      activityTypes: [],
    }
  );

  // Presets de fecha
  const datePresets = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta Semana', value: 'week' },
    { label: 'Este Mes', value: 'month' },
    { label: 'Este Trimestre', value: 'quarter' },
    { label: 'Este Año', value: 'year' },
    { label: 'Personalizado', value: 'custom' },
  ];

  // Etapas del pipeline
  const pipelineStages = [
    { value: 'prospecto', label: 'Prospecto' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'calificado', label: 'Calificado' },
    { value: 'presentacion', label: 'Presentación' },
    { value: 'negociacion', label: 'Negociación' },
    { value: 'propuesta', label: 'Propuesta' },
    { value: 'cierre', label: 'Cierre' },
  ];

  // Aplicar preset de fecha
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date();
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    setFilters({
      ...filters,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        preset: preset as any,
      },
    });
  };

  // Toggle broker selection
  const toggleBroker = (brokerId: string) => {
    const newBrokers = filters.brokers.includes(brokerId)
      ? filters.brokers.filter(id => id !== brokerId)
      : [...filters.brokers, brokerId];

    setFilters({ ...filters, brokers: newBrokers });
  };

  // Toggle stage selection
  const toggleStage = (stage: string) => {
    const newStages = filters.stages.includes(stage)
      ? filters.stages.filter(s => s !== stage)
      : [...filters.stages, stage];

    setFilters({ ...filters, stages: newStages });
  };

  // Aplicar filtros
  const applyFilters = () => {
    handleFilterChange?.(filters);
    setIsOpen(false);
  };

  // Limpiar filtros
  const clearFilters = () => {
    const defaultFilters: FilterConfig = {
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        preset: 'month',
      },
      brokers: [],
      pipelines: [],
      stages: [],
      minRevenue: undefined,
      maxRevenue: undefined,
      leadSource: [],
      activityTypes: [],
    };
    setFilters(defaultFilters);
    handleFilterChange?.(defaultFilters);
  };

  // Guardar filtro
  const handleSaveFilter = () => {
    if (filterName && onSaveFilter) {
      onSaveFilter(filterName, filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  // Contar filtros activos
  const activeFiltersCount =
    filters.brokers.length +
    filters.stages.length +
    (filters.minRevenue ? 1 : 0) +
    (filters.maxRevenue ? 1 : 0);

  return (
    <div className="relative">
      {/* Botón de filtros */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={20} />
        <span className="font-medium">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Filtros Avanzados</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Rango de Fechas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={16} />
                Rango de Fechas
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {datePresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => applyDatePreset(preset.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      filters.dateRange.preset === preset.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {filters.dateRange.preset === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Desde</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: { ...filters.dateRange, start: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: { ...filters.dateRange, end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Brokers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users size={16} />
                Brokers
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableBrokers.map(broker => (
                  <label
                    key={broker.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brokers.includes(broker.id)}
                      onChange={() => toggleBroker(broker.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{broker.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Etapas del Pipeline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                Etapas del Pipeline
              </label>
              <div className="grid grid-cols-2 gap-2">
                {pipelineStages.map(stage => (
                  <label
                    key={stage.value}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.stages.includes(stage.value)}
                      onChange={() => toggleStage(stage.value)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{stage.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rango de Revenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rango de Revenue (MXN)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={filters.minRevenue || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, minRevenue: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                  <input
                    type="number"
                    value={filters.maxRevenue || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, maxRevenue: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="Sin límite"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Limpiar todo
              </button>
              {onSaveFilter && (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Save size={16} />
                  Guardar filtro
                </button>
              )}
            </div>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Dialog para guardar filtro */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Guardar Filtro</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nombre del filtro"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
