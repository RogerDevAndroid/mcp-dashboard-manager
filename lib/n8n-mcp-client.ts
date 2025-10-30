/**
 * N8N MCP Client
 *
 * Cliente TypeScript para interactuar con el workflow MCP Orchestrator en n8n.
 * Proporciona una interfaz type-safe para todas las acciones disponibles.
 */

export interface MCPRequest {
  action: string;
  params?: Record<string, any>;
  userId?: string;
}

export interface MCPResponse<T = any> {
  success: boolean;
  action: string;
  requestId: string;
  timestamp: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata: {
    count?: number;
    source: string;
    processingTime?: number;
    userId: string;
  };
}

export interface GHLContact {
  id: string;
  contactName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  dateAdded?: string;
  lastActivityDate?: string;
  assignedTo?: string;
  customField?: Record<string, any>;
  city?: string;
  state?: string;
}

export interface GHLOpportunity {
  id: string;
  name: string;
  contactId: string;
  monetaryValue?: number;
  pipelineStage?: string;
  stage?: string;
  status: 'open' | 'won' | 'lost';
  assignedTo?: string;
  dateAdded?: string;
  dateUpdated?: string;
  expectedCloseDate?: string;
  source?: string;
  customField?: Record<string, any>;
}

export interface GHLCalendarEvent {
  id: string;
  calendarId: string;
  contactId?: string;
  appointmentTitle?: string;
  notes?: string;
  startTime: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export class N8NMCPClient {
  private webhookUrl: string;
  private defaultUserId: string;

  constructor(webhookUrl?: string, defaultUserId: string = 'anonymous') {
    this.webhookUrl = webhookUrl || process.env.N8N_WEBHOOK_URL || '';
    this.defaultUserId = defaultUserId;

    if (!this.webhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured. Set it in environment or pass to constructor.');
    }
  }

  /**
   * Ejecuta una solicitud MCP genérica
   */
  private async executeRequest<T>(
    action: string,
    params: Record<string, any> = {},
    userId?: string
  ): Promise<MCPResponse<T>> {
    const request: MCPRequest = {
      action,
      params,
      userId: userId || this.defaultUserId
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: MCPResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Unknown error');
      }

      return data;
    } catch (error) {
      console.error('MCP Request failed:', error);
      throw error;
    }
  }

  // ========================================
  // CONTACTS
  // ========================================

  /**
   * Lista contactos de GoHighLevel
   */
  async listContacts(params: {
    limit?: number;
    skip?: number;
  } = {}, userId?: string): Promise<MCPResponse<GHLContact[]>> {
    return this.executeRequest<GHLContact[]>('list_contacts', params, userId);
  }

  /**
   * Obtiene un contacto específico por ID
   */
  async getContact(contactId: string, userId?: string): Promise<MCPResponse<GHLContact>> {
    return this.executeRequest<GHLContact>('get_contact', { contactId }, userId);
  }

  /**
   * Crea un nuevo contacto
   */
  async createContact(contact: Partial<GHLContact>, userId?: string): Promise<MCPResponse<GHLContact>> {
    return this.executeRequest<GHLContact>('create_contact', contact, userId);
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContact(
    contactId: string,
    updates: Partial<GHLContact>,
    userId?: string
  ): Promise<MCPResponse<GHLContact>> {
    return this.executeRequest<GHLContact>('update_contact', { contactId, ...updates }, userId);
  }

  // ========================================
  // OPPORTUNITIES
  // ========================================

  /**
   * Lista oportunidades de GoHighLevel
   */
  async listOpportunities(params: {
    limit?: number;
    skip?: number;
    status?: 'open' | 'won' | 'lost';
  } = {}, userId?: string): Promise<MCPResponse<GHLOpportunity[]>> {
    return this.executeRequest<GHLOpportunity[]>('list_opportunities', params, userId);
  }

  /**
   * Obtiene una oportunidad específica
   */
  async getOpportunity(opportunityId: string, userId?: string): Promise<MCPResponse<GHLOpportunity>> {
    return this.executeRequest<GHLOpportunity>('get_opportunity', { opportunityId }, userId);
  }

  /**
   * Crea una nueva oportunidad
   */
  async createOpportunity(
    opportunity: Partial<GHLOpportunity>,
    userId?: string
  ): Promise<MCPResponse<GHLOpportunity>> {
    return this.executeRequest<GHLOpportunity>('create_opportunity', opportunity, userId);
  }

  /**
   * Actualiza una oportunidad existente
   */
  async updateOpportunity(
    opportunityId: string,
    updates: Partial<GHLOpportunity>,
    userId?: string
  ): Promise<MCPResponse<GHLOpportunity>> {
    return this.executeRequest<GHLOpportunity>('update_opportunity', { opportunityId, ...updates }, userId);
  }

  // ========================================
  // CALENDAR
  // ========================================

  /**
   * Lista eventos del calendario
   */
  async listCalendarEvents(params: {
    brokerId?: string;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}, userId?: string): Promise<MCPResponse<GHLCalendarEvent[]>> {
    return this.executeRequest<GHLCalendarEvent[]>('list_calendar_events', params, userId);
  }

  /**
   * Crea un nuevo evento de calendario
   */
  async createCalendarEvent(
    event: Partial<GHLCalendarEvent>,
    userId?: string
  ): Promise<MCPResponse<GHLCalendarEvent>> {
    return this.executeRequest<GHLCalendarEvent>('create_calendar_event', event, userId);
  }

  // ========================================
  // BROKER SYNC
  // ========================================

  /**
   * Sincroniza datos de un broker específico
   */
  async syncBrokerData(params: {
    brokerId: string;
    syncType?: 'full' | 'incremental';
  }, userId?: string): Promise<MCPResponse<any>> {
    return this.executeRequest('sync_broker_data', params, userId);
  }

  /**
   * Obtiene estadísticas de un broker
   */
  async getBrokerStats(brokerId: string, userId?: string): Promise<MCPResponse<any>> {
    return this.executeRequest('get_broker_stats', { brokerId }, userId);
  }

  /**
   * Obtiene el ranking actual de brokers
   */
  async getRanking(userId?: string): Promise<MCPResponse<any>> {
    return this.executeRequest('get_ranking', {}, userId);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Crea una instancia del cliente MCP
 */
export function createMCPClient(webhookUrl?: string, userId?: string): N8NMCPClient {
  return new N8NMCPClient(webhookUrl, userId);
}

/**
 * Cliente singleton para uso global
 */
let globalClient: N8NMCPClient | null = null;

export function getMCPClient(webhookUrl?: string, userId?: string): N8NMCPClient {
  if (!globalClient) {
    globalClient = new N8NMCPClient(webhookUrl, userId);
  }
  return globalClient;
}

// ========================================
// REACT HOOKS (opcional)
// ========================================

/**
 * Hook de React para usar el cliente MCP
 * Requiere 'use client' en Next.js
 */
export function useMCPClient(userId?: string) {
  const client = getMCPClient(undefined, userId);

  return {
    listContacts: (params?: any) => client.listContacts(params, userId),
    getContact: (id: string) => client.getContact(id, userId),
    createContact: (contact: Partial<GHLContact>) => client.createContact(contact, userId),
    updateContact: (id: string, updates: Partial<GHLContact>) => client.updateContact(id, updates, userId),

    listOpportunities: (params?: any) => client.listOpportunities(params, userId),
    getOpportunity: (id: string) => client.getOpportunity(id, userId),
    createOpportunity: (opp: Partial<GHLOpportunity>) => client.createOpportunity(opp, userId),
    updateOpportunity: (id: string, updates: Partial<GHLOpportunity>) =>
      client.updateOpportunity(id, updates, userId),

    listCalendarEvents: (params?: any) => client.listCalendarEvents(params, userId),
    createCalendarEvent: (event: Partial<GHLCalendarEvent>) => client.createCalendarEvent(event, userId),

    syncBrokerData: (params: { brokerId: string; syncType?: 'full' | 'incremental' }) =>
      client.syncBrokerData(params, userId),
    getBrokerStats: (brokerId: string) => client.getBrokerStats(brokerId, userId),
    getRanking: () => client.getRanking(userId)
  };
}

export default N8NMCPClient;
