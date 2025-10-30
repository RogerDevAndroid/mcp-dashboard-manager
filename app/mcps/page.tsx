'use client'

import { useState } from 'react'
import { ServerIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function MCPsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const mcps = [
    { id: 1, name: 'Stripe', category: 'Payments', status: 'active', description: 'Payment processing and subscriptions' },
    { id: 2, name: 'GoHighLevel', category: 'CRM', status: 'active', description: 'CRM and pipeline management' },
    { id: 3, name: 'Linear', category: 'Project Management', status: 'active', description: 'Issue tracking and project management' },
    { id: 4, name: 'Notion', category: 'Documentation', status: 'inactive', description: 'Docs, pages, and databases' },
    { id: 5, name: 'Supabase RAG', category: 'Database', status: 'active', description: 'RAG agent with memory and knowledge' },
    { id: 6, name: 'Sentry', category: 'Monitoring', status: 'inactive', description: 'Error monitoring and debugging' },
  ]

  const filteredMcps = mcps.filter(mcp =>
    mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mcp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MCP Servers</h1>
          <p className="text-gray-300">Gestiona tus integraciones y conexiones</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar MCPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* MCP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMcps.map((mcp) => (
            <div
              key={mcp.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <ServerIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{mcp.name}</h3>
                    <p className="text-sm text-gray-400">{mcp.category}</p>
                  </div>
                </div>
                {mcp.status === 'active' ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4">{mcp.description}</p>

              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  Configurar
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New MCP Button */}
        <div className="mt-8">
          <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg">
            + Conectar Nuevo MCP
          </button>
        </div>
      </div>
    </div>
  )
}
