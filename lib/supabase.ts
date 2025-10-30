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

    const { data, error } = await query

    if (error) throw error
    return data
  }
}
