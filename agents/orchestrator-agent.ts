#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';

/**
 * AGENTE ORQUESTADOR
 *
 * Este agente coordina múltiples MCP servers y decide
 * cuál usar según el contexto de la tarea.
 */

interface MCPServerConfig {
  id: string;
  name: string;
  transport_type: 'http' | 'sse' | 'stdio';
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  tools?: Array<{
    name: string;
    description: string;
    input_schema: any;
  }>;
}

interface RoutingRule {
  condition: string; // Expresión para evaluar
  mcp_server: string; // Nombre del MCP a usar
  priority: number;
}

interface OrchestratorConfig {
  user_id: string;
  enabled_mcps: string[];
  routing_rules: RoutingRule[];
  fallback_behavior: 'ask_user' | 'skip' | 'error';
  max_iterations: number;
  timeout_seconds: number;
}

class MCPOrchestratorAgent {
  private server: Server;
  private supabase: SupabaseClient;
  private mcpServers: Map<string, MCPServerConfig> = new Map();
  private config: OrchestratorConfig;
  private activeConnections: Map<string, any> = new Map();

  constructor(userId: string) {
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    this.server = new Server(
      {
        name: 'mcp-orchestrator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      user_id: userId,
      enabled_mcps: [],
      routing_rules: [],
      fallback_behavior: 'ask_user',
      max_iterations: 10,
      timeout_seconds: 300,
    };

    this.setupHandlers();

    this.server.onerror = (error) => console.error('[Orchestrator Error]', error);
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      await this.loadConfiguration();
      const tools: any[] = [];

      // Agregar herramienta de orquestación
      tools.push({
        name: 'orchestrate_task',
        description: 'Orquesta una tarea usando múltiples MCPs según sea necesario',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'Descripción de la tarea a realizar',
            },
            context: {
              type: 'object',
              description: 'Contexto adicional para la tarea',
            },
            preferred_mcps: {
              type: 'array',
              items: { type: 'string' },
              description: 'MCPs preferidos para esta tarea (opcional)',
            },
          },
          required: ['task'],
        },
      });

      // Herramientas de gestión
      tools.push(
        {
          name: 'list_available_mcps',
          description: 'Lista todos los MCPs disponibles y habilitados',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_mcp_capabilities',
          description: 'Obtiene las capacidades de un MCP específico',
          inputSchema: {
            type: 'object',
            properties: {
              mcp_name: { type: 'string', description: 'Nombre del MCP' },
            },
            required: ['mcp_name'],
          },
        },
        {
          name: 'execute_mcp_tool',
          description: 'Ejecuta una herramienta específica de un MCP',
          inputSchema: {
            type: 'object',
            properties: {
              mcp_name: { type: 'string', description: 'Nombre del MCP' },
              tool_name: { type: 'string', description: 'Nombre de la herramienta' },
              arguments: { type: 'object', description: 'Argumentos para la herramienta' },
            },
            required: ['mcp_name', 'tool_name'],
          },
        },
        {
          name: 'add_routing_rule',
          description: 'Agrega una regla de enrutamiento para decisiones automáticas',
          inputSchema: {
            type: 'object',
            properties: {
              condition: { type: 'string', description: 'Condición para activar esta regla' },
              mcp_server: { type: 'string', description: 'MCP a usar cuando se cumpla' },
              priority: { type: 'number', description: 'Prioridad (mayor = más importante)' },
            },
            required: ['condition', 'mcp_server'],
          },
        }
      );

      return { tools };
    });

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'orchestrate_task':
            return await this.orchestrateTask(request.params.arguments);
          case 'list_available_mcps':
            return await this.listAvailableMCPs();
          case 'get_mcp_capabilities':
            return await this.getMCPCapabilities(request.params.arguments);
          case 'execute_mcp_tool':
            return await this.executeMCPTool(request.params.arguments);
          case 'add_routing_rule':
            return await this.addRoutingRule(request.params.arguments);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
        };
      }
    });
  }

  /**
   * Carga la configuración del usuario desde Supabase
   */
  private async loadConfiguration() {
    // Cargar configuración del orquestador
    const { data: orchestratorData, error: orchestratorError } = await this.supabase
      .from('agent_orchestrator')
      .select('*')
      .eq('user_id', this.config.user_id)
      .single();

    if (orchestratorData) {
      this.config = {
        ...this.config,
        ...orchestratorData,
      };
    }

    // Cargar MCPs habilitados del usuario
    const { data: mcpsData, error: mcpsError } = await this.supabase
      .from('mcp_configurations')
      .select(`
        *,
        mcp_servers (*)
      `)
      .eq('user_id', this.config.user_id)
      .eq('enabled', true);

    if (mcpsData) {
      for (const config of mcpsData) {
        const server = config.mcp_servers;
        this.mcpServers.set(server.name, {
          id: server.id,
          name: server.name,
          transport_type: server.transport_type,
          url: server.url,
          command: server.command,
          args: server.args,
          env: { ...server.env_vars, ...config.credentials },
        });
      }
    }

    // Cargar herramientas de cada MCP
    for (const [name, mcpConfig] of this.mcpServers) {
      const { data: tools } = await this.supabase
        .from('mcp_tools')
        .select('*')
        .eq('mcp_server_id', mcpConfig.id);

      if (tools) {
        mcpConfig.tools = tools.map((t) => ({
          name: t.tool_name,
          description: t.description,
          input_schema: t.input_schema,
        }));
      }
    }
  }

  /**
   * Orquesta una tarea usando múltiples MCPs
   */
  private async orchestrateTask(args: any) {
    const { task, context = {}, preferred_mcps = [] } = args;

    console.error(`[Orchestrator] Task: ${task}`);

    // 1. Analizar la tarea y determinar qué MCPs necesitamos
    const requiredMCPs = await this.analyzeTaskRequirements(task, context, preferred_mcps);

    console.error(`[Orchestrator] Required MCPs: ${requiredMCPs.join(', ')}`);

    // 2. Ejecutar la tarea en etapas
    const results = [];
    for (const mcpName of requiredMCPs) {
      const mcpConfig = this.mcpServers.get(mcpName);
      if (!mcpConfig) {
        console.error(`[Orchestrator] MCP not found: ${mcpName}`);
        continue;
      }

      // Determinar qué herramienta usar
      const toolToUse = await this.selectToolForTask(mcpConfig, task, context);
      if (toolToUse) {
        console.error(`[Orchestrator] Using ${mcpName}.${toolToUse.name}`);
        const result = await this.executeMCPTool({
          mcp_name: mcpName,
          tool_name: toolToUse.name,
          arguments: toolToUse.arguments,
        });
        results.push({
          mcp: mcpName,
          tool: toolToUse.name,
          result,
        });
      }
    }

    // 3. Log de uso
    await this.logUsage(task, requiredMCPs, results);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              task,
              mcps_used: requiredMCPs,
              results,
              summary: this.generateSummary(results),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Analiza la tarea y determina qué MCPs son necesarios
   */
  private async analyzeTaskRequirements(
    task: string,
    context: any,
    preferred_mcps: string[]
  ): Promise<string[]> {
    const taskLower = task.toLowerCase();
    const required: Set<string> = new Set();

    // Si hay MCPs preferidos, usarlos
    if (preferred_mcps.length > 0) {
      preferred_mcps.forEach((mcp) => {
        if (this.mcpServers.has(mcp)) {
          required.add(mcp);
        }
      });
    }

    // Aplicar reglas de enrutamiento
    for (const rule of this.config.routing_rules) {
      if (this.evaluateCondition(rule.condition, task, context)) {
        if (this.mcpServers.has(rule.mcp_server)) {
          required.add(rule.mcp_server);
        }
      }
    }

    // Análisis basado en keywords (fallback)
    if (required.size === 0) {
      // Database/CRM keywords
      if (
        taskLower.includes('contact') ||
        taskLower.includes('crm') ||
        taskLower.includes('customer')
      ) {
        if (this.mcpServers.has('gohighlevel')) required.add('gohighlevel');
        if (this.mcpServers.has('hubspot')) required.add('hubspot');
        if (this.mcpServers.has('supabase-rag')) required.add('supabase-rag');
      }

      // Payment keywords
      if (taskLower.includes('payment') || taskLower.includes('transaction')) {
        if (this.mcpServers.has('stripe')) required.add('stripe');
        if (this.mcpServers.has('paypal')) required.add('paypal');
      }

      // Project management keywords
      if (taskLower.includes('task') || taskLower.includes('project') || taskLower.includes('issue')) {
        if (this.mcpServers.has('linear')) required.add('linear');
        if (this.mcpServers.has('asana')) required.add('asana');
        if (this.mcpServers.has('notion')) required.add('notion');
      }

      // Knowledge/RAG keywords
      if (taskLower.includes('search') || taskLower.includes('find') || taskLower.includes('know')) {
        if (this.mcpServers.has('supabase-rag')) required.add('supabase-rag');
      }

      // Design keywords
      if (taskLower.includes('design') || taskLower.includes('figma') || taskLower.includes('ui')) {
        if (this.mcpServers.has('figma')) required.add('figma');
        if (this.mcpServers.has('canva')) required.add('canva');
      }
    }

    return Array.from(required);
  }

  /**
   * Evalúa una condición para reglas de enrutamiento
   */
  private evaluateCondition(condition: string, task: string, context: any): boolean {
    try {
      // Simple evaluation - en producción usar un parser seguro
      const taskLower = task.toLowerCase();
      return taskLower.includes(condition.toLowerCase());
    } catch {
      return false;
    }
  }

  /**
   * Selecciona la herramienta apropiada para una tarea
   */
  private async selectToolForTask(
    mcpConfig: MCPServerConfig,
    task: string,
    context: any
  ): Promise<{ name: string; arguments: any } | null> {
    if (!mcpConfig.tools || mcpConfig.tools.length === 0) {
      return null;
    }

    // Por ahora selección simple basada en keywords
    // En producción, usar un modelo de IA para esto
    const taskLower = task.toLowerCase();

    for (const tool of mcpConfig.tools) {
      const toolNameLower = tool.name.toLowerCase();
      const toolDescLower = tool.description?.toLowerCase() || '';

      // Match básico
      if (taskLower.includes(toolNameLower) || toolDescLower.includes(taskLower.split(' ')[0])) {
        // Extraer argumentos del contexto
        const args = this.extractArgumentsFromContext(tool.input_schema, context);
        return {
          name: tool.name,
          arguments: args,
        };
      }
    }

    // Default: usar la primera herramienta
    return {
      name: mcpConfig.tools[0].name,
      arguments: {},
    };
  }

  /**
   * Extrae argumentos del contexto basado en el schema
   */
  private extractArgumentsFromContext(schema: any, context: any): any {
    const args: any = {};
    if (schema?.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (context[key] !== undefined) {
          args[key] = context[key];
        }
      }
    }
    return args;
  }

  /**
   * Lista MCPs disponibles
   */
  private async listAvailableMCPs() {
    await this.loadConfiguration();
    const mcps = Array.from(this.mcpServers.values()).map((mcp) => ({
      name: mcp.name,
      transport: mcp.transport_type,
      tools_count: mcp.tools?.length || 0,
      tools: mcp.tools?.map((t) => t.name) || [],
    }));

    return {
      content: [{ type: 'text', text: JSON.stringify(mcps, null, 2) }],
    };
  }

  /**
   * Obtiene capacidades de un MCP
   */
  private async getMCPCapabilities(args: any) {
    const { mcp_name } = args;
    const mcp = this.mcpServers.get(mcp_name);

    if (!mcp) {
      throw new Error(`MCP not found: ${mcp_name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              name: mcp.name,
              transport: mcp.transport_type,
              tools: mcp.tools || [],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Ejecuta una herramienta de un MCP específico
   */
  private async executeMCPTool(args: any) {
    const { mcp_name, tool_name, arguments: toolArgs = {} } = args;
    const mcp = this.mcpServers.get(mcp_name);

    if (!mcp) {
      throw new Error(`MCP not found: ${mcp_name}`);
    }

    // Aquí se haría la llamada real al MCP
    // Por ahora retornamos un placeholder
    console.error(`[Orchestrator] Executing ${mcp_name}.${tool_name}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              mcp: mcp_name,
              tool: tool_name,
              status: 'executed',
              result: 'Placeholder - real execution would happen here',
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Agrega una regla de enrutamiento
   */
  private async addRoutingRule(args: any) {
    const { condition, mcp_server, priority = 5 } = args;

    this.config.routing_rules.push({
      condition,
      mcp_server,
      priority,
    });

    // Guardar en base de datos
    await this.supabase
      .from('agent_orchestrator')
      .update({
        routing_rules: this.config.routing_rules,
      })
      .eq('user_id', this.config.user_id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, rule: { condition, mcp_server, priority } }, null, 2),
        },
      ],
    };
  }

  /**
   * Genera un resumen de los resultados
   */
  private generateSummary(results: any[]): string {
    if (results.length === 0) return 'No se ejecutó ninguna herramienta';

    const summary = results.map((r) => `${r.mcp}.${r.tool}: completado`).join(', ');

    return `Ejecutadas ${results.length} herramientas: ${summary}`;
  }

  /**
   * Registra el uso en la base de datos
   */
  private async logUsage(task: string, mcps: string[], results: any[]) {
    for (const mcpName of mcps) {
      const mcp = this.mcpServers.get(mcpName);
      if (mcp) {
        await this.supabase.from('mcp_usage_logs').insert({
          user_id: this.config.user_id,
          mcp_server_id: mcp.id,
          tool_name: results.find((r) => r.mcp === mcpName)?.tool || 'orchestrate',
          session_id: Date.now().toString(),
          success: true,
          metadata: { task },
        });
      }
    }
  }

  /**
   * Limpieza al cerrar
   */
  private async cleanup() {
    console.error('[Orchestrator] Cleaning up...');
    for (const [name, connection] of this.activeConnections) {
      try {
        // Cerrar conexiones activas
        console.error(`[Orchestrator] Closing connection to ${name}`);
      } catch (error) {
        console.error(`[Orchestrator] Error closing ${name}:`, error);
      }
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MCP Orchestrator Agent running');
  }
}

// Iniciar el agente
const userId = process.env.USER_ID || 'default_user';
const orchestrator = new MCPOrchestratorAgent(userId);
orchestrator.run().catch(console.error);
