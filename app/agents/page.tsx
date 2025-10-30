'use client'

import { CpuChipIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'

export default function AgentsPage() {
  const agents = [
    { id: 1, name: 'Sales Closer', category: 'Sales', status: 'active', mcps: ['GoHighLevel', 'Stripe'], tasks: 145 },
    { id: 2, name: 'Customer Support', category: 'Support', status: 'active', mcps: ['Intercom', 'Notion'], tasks: 89 },
    { id: 3, name: 'Dev Productivity', category: 'Development', status: 'active', mcps: ['Sentry', 'Linear'], tasks: 234 },
    { id: 4, name: 'Content Creator', category: 'Marketing', status: 'inactive', mcps: ['Canva', 'Asana'], tasks: 56 },
    { id: 5, name: 'Project Manager', category: 'Management', status: 'active', mcps: ['Linear', 'Notion'], tasks: 178 },
    { id: 6, name: 'Finance Analyst', category: 'Finance', status: 'inactive', mcps: ['Stripe', 'PayPal'], tasks: 67 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Agentes Especializados</h1>
          <p className="text-gray-300">Configura y gestiona tus agentes de IA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <CpuChipIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400">{agent.category}</p>
                  </div>
                </div>
                {agent.status === 'active' && (
                  <CheckBadgeIcon className="h-6 w-6 text-green-400" />
                )}
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {agent.mcps.map((mcp) => (
                    <span
                      key={mcp}
                      className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs rounded-full"
                    >
                      {mcp}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tareas completadas</span>
                  <span className="text-white font-semibold">{agent.tasks}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                  Configurar
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                  Stats
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg">
            + Crear Nuevo Agente
          </button>
        </div>
      </div>
    </div>
  )
}
