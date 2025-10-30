import Link from 'next/link'
import { ArrowRightIcon, ServerIcon, CpuChipIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      name: 'MCPs Conectados',
      description: 'Gestiona 30+ MCP Servers',
      icon: ServerIcon,
      href: '/mcps',
      stat: '12',
      color: 'bg-blue-500'
    },
    {
      name: 'Agentes Especializados',
      description: '8 agentes pre-configurados',
      icon: CpuChipIcon,
      href: '/agents',
      stat: '5',
      color: 'bg-purple-500'
    },
    {
      name: 'Analytics',
      description: 'Métricas en tiempo real',
      icon: ChartBarIcon,
      href: '/analytics',
      stat: '1.2K',
      color: 'bg-green-500'
    },
    {
      name: 'Configuración',
      description: 'Personaliza tu sistema',
      icon: Cog6ToothIcon,
      href: '/settings',
      stat: '',
      color: 'bg-orange-500'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            MCP Dashboard Manager
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Gestiona tus MCP Servers, configura agentes especializados y orquesta múltiples servicios con IA
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.name}
                href={feature.href}
                className="relative group bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {feature.description}
                    </p>
                    {feature.stat && (
                      <p className="text-3xl font-bold text-white mt-4">
                        {feature.stat}
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {[
              { mcp: 'Stripe', action: 'Payment processed', time: 'Hace 2 min', status: 'success' },
              { mcp: 'GoHighLevel', action: 'Contact created', time: 'Hace 5 min', status: 'success' },
              { mcp: 'Linear', action: 'Issue updated', time: 'Hace 10 min', status: 'success' },
              { mcp: 'Notion', action: 'Page created', time: 'Hace 15 min', status: 'success' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{activity.mcp}</p>
                    <p className="text-sm text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/mcps/new"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Conectar MCP</h3>
            <p className="text-sm text-blue-100">Agrega un nuevo MCP Server</p>
          </Link>

          <Link
            href="/agents/new"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Crear Agente</h3>
            <p className="text-sm text-purple-100">Configura un agente especializado</p>
          </Link>

          <Link
            href="/analytics"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all"
          >
            <h3 className="text-lg font-semibold mb-2">Ver Analytics</h3>
            <p className="text-sm text-green-100">Analiza tu uso y performance</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
