import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common queries
export const mcpQueries = {
  // Get all MCP servers
  getAllServers: async () => {
    const { data, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw error
    return data
  },

  // Get MCP servers by category
  getServersByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('category', category)
      .order('display_name', { ascending: true })

    if (error) throw error
    return data
  },

  // Get user's configured MCPs
  getUserConfigurations: async (userId: string) => {
    const { data, error } = await supabase
      .from('mcp_configurations')
      .select(`
        *,
        mcp_servers (
          id,
          name,
          display_name,
          category,
          icon,
          transport_type
        )
      `)
      .eq('user_id', userId)
      .eq('enabled', true)

    if (error) throw error
    return data
  },

  // Get MCP usage statistics
  getUsageStats: async (userId?: string) => {
    let query = supabase
      .from('mcp_usage_logs')
      .select('*', { count: 'exact' })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { logs: data, count }
  }
}

export const agentQueries = {
  // Get all specialized agents
  getAllAgents: async (userId: string) => {
    const { data, error } = await supabase
      .from('specialized_agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get orchestrator configuration
  getOrchestratorConfig: async (userId: string) => {
    const { data, error } = await supabase
      .from('agent_orchestrator')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  }
}

export const analyticsQueries = {
  // Get usage over time
  getUsageOverTime: async (userId?: string, days: number = 7) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from('mcp_usage_logs')
      .select('executed_at, success, execution_time_ms')
      .gte('executed_at', startDate.toISOString())
      .order('executed_at', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  // Get success rate by MCP
  getSuccessRateByMCP: async (userId?: string) => {
    let query = supabase
      .from('mcp_usage_logs')
      .select(`
        mcp_name,
        success,
        mcp_server_id,
        mcp_servers (
          display_name,
          category
        )
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error} = await query

    if (error) throw error
    return data
  }
}

// Broker Dashboard Queries
export const brokerQueries = {
  // Get broker dashboard data
  getBrokerDashboard: async (brokerId: string) => {
    const { data, error } = await supabase
      .from('vw_broker_dashboard')
      .select('*')
      .eq('broker_id', brokerId)
      .single()

    if (error) throw error
    return data
  },

  // Get broker profile
  getBrokerProfile: async (brokerId: string) => {
    const { data, error } = await supabase
      .from('broker_profiles')
      .select('*')
      .eq('broker_id', brokerId)
      .single()

    if (error) throw error
    return data
  },

  // Get broker tasks
  getBrokerTasks: async (brokerId: string, limit: number = 10) => {
    const { data, error } = await supabase
      .from('tareas_broker')
      .select('*')
      .eq('broker_id', brokerId)
      .eq('completada', false)
      .order('prioridad', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get broker achievements
  getBrokerAchievements: async (brokerId: string, days: number = 7) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('broker_achievements')
      .select('*, achievement:logros_achievements(*)')
      .eq('broker_id', brokerId)
      .gte('fecha_obtenido', startDate.toISOString())
      .order('fecha_obtenido', { ascending: false })

    if (error) throw error
    return data
  },

  // Get leaderboard
  getLeaderboard: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from('vw_ranking_actual')
      .select('*')
      .order('puntos_mes', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

// Server-side client with service role
export function getServiceSupabase() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_KEY')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY
  )
}
