'use client'

import { ChartBarIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  const stats = [
    { name: 'Total Requests', value: '1,234', change: '+12%', trend: 'up' },
    { name: 'Success Rate', value: '98.5%', change: '+2%', trend: 'up' },
    { name: 'Avg Response Time', value: '245ms', change: '-15%', trend: 'down' },
    { name: 'Active MCPs', value: '12', change: '+3', trend: 'up' },
  ]

  const recentActivity = [
    { mcp: 'Stripe', action: 'Payment processed', time: '2 min ago', status: 'success' },
    { mcp: 'GoHighLevel', action: 'Contact created', time: '5 min ago', status: 'success' },
    { mcp: 'Linear', action: 'Issue updated', time: '10 min ago', status: 'success' },
    { mcp: 'Notion', action: 'Page created', time: '15 min ago', status: 'success' },
    { mcp: 'Sentry', action: 'Error logged', time: '20 min ago', status: 'error' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-300">Monitorea el rendimiento de tu sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="h-8 w-8 text-green-400" />
                <span className={`text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.name}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Usage Over Time</h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 95, 75, 88, 92].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-green-500 to-blue-500 rounded-t-lg"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">MCPs by Category</h2>
            <div className="space-y-4">
              {[
                { category: 'Payments', count: 4, color: 'bg-blue-500', percentage: 30 },
                { category: 'CRM', count: 3, color: 'bg-green-500', percentage: 25 },
                { category: 'Project Mgmt', count: 3, color: 'bg-purple-500', percentage: 25 },
                { category: 'Other', count: 2, color: 'bg-orange-500', percentage: 20 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{item.category}</span>
                    <span className="text-gray-400">{item.count} MCPs</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
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
                <div className="flex items-center space-x-2 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-sm">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
