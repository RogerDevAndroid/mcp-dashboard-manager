/**
 * Ejemplos de Uso: N8N MCP Client
 *
 * Este archivo contiene ejemplos prácticos de cómo usar el cliente MCP
 * para integrar el workflow de n8n con tu aplicación.
 */

import { N8NMCPClient, createMCPClient, useMCPClient } from '../lib/n8n-mcp-client';

// ========================================
// EJEMPLO 1: Setup Básico
// ========================================

async function ejemplo1_setupBasico() {
  console.log('📘 Ejemplo 1: Setup Básico\n');

  // Opción A: Crear cliente directamente
  const client = new N8NMCPClient(
    'https://your-n8n.com/webhook/ghl-orchestrator',
    'user_123'
  );

  // Opción B: Usar factory function
  const client2 = createMCPClient(
    process.env.N8N_WEBHOOK_URL,
    'user_456'
  );

  console.log('✅ Cliente creado correctamente\n');
}

// ========================================
// EJEMPLO 2: Listar Contactos
// ========================================

async function ejemplo2_listarContactos() {
  console.log('📘 Ejemplo 2: Listar Contactos\n');

  const client = createMCPClient();

  try {
    // Listar primeros 10 contactos
    const response = await client.listContacts({ limit: 10 });

    console.log('✅ Respuesta exitosa:');
    console.log(`   Request ID: ${response.requestId}`);
    console.log(`   Total contactos: ${response.metadata.count}`);
    console.log(`   Tiempo de procesamiento: ${response.metadata.processingTime}ms\n`);

    // Procesar contactos
    if (response.data && response.data.length > 0) {
      console.log('📋 Primeros 3 contactos:');
      response.data.slice(0, 3).forEach((contact, i) => {
        console.log(`   ${i + 1}. ${contact.contactName || contact.firstName}`);
        console.log(`      Email: ${contact.email || 'N/A'}`);
        console.log(`      Teléfono: ${contact.phone || 'N/A'}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 3: Crear Contacto
// ========================================

async function ejemplo3_crearContacto() {
  console.log('📘 Ejemplo 3: Crear Contacto\n');

  const client = createMCPClient();

  try {
    const nuevoContacto = {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@example.com',
      phone: '+52 999 555 1234',
      tags: ['lead', 'tulum'],
      customField: {
        presupuesto: '500000',
        zona_interes: 'Tulum Centro'
      }
    };

    const response = await client.createContact(nuevoContacto);

    console.log('✅ Contacto creado:');
    console.log(`   ID: ${response.data?.id}`);
    console.log(`   Nombre: ${response.data?.contactName}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 4: Actualizar Contacto
// ========================================

async function ejemplo4_actualizarContacto() {
  console.log('📘 Ejemplo 4: Actualizar Contacto\n');

  const client = createMCPClient();
  const contactId = 'contact_abc123';

  try {
    const updates = {
      tags: ['caliente', 'alta_prioridad'],
      customField: {
        presupuesto: '750000',
        estado: 'negociacion'
      }
    };

    const response = await client.updateContact(contactId, updates);

    console.log('✅ Contacto actualizado:');
    console.log(`   ID: ${response.data?.id}`);
    console.log(`   Tags: ${response.data?.tags?.join(', ')}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 5: Listar Oportunidades
// ========================================

async function ejemplo5_listarOportunidades() {
  console.log('📘 Ejemplo 5: Listar Oportunidades\n');

  const client = createMCPClient();

  try {
    // Solo oportunidades abiertas
    const response = await client.listOpportunities({
      status: 'open',
      limit: 20
    });

    console.log('✅ Oportunidades abiertas:');
    console.log(`   Total: ${response.metadata.count}\n`);

    if (response.data && response.data.length > 0) {
      let valorTotal = 0;

      response.data.forEach((opp) => {
        console.log(`   • ${opp.name}`);
        console.log(`     Valor: $${opp.monetaryValue?.toLocaleString() || 0}`);
        console.log(`     Etapa: ${opp.pipelineStage || 'N/A'}\n`);

        valorTotal += opp.monetaryValue || 0;
      });

      console.log(`   💰 Valor total del pipeline: $${valorTotal.toLocaleString()}\n`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 6: Crear Oportunidad
// ========================================

async function ejemplo6_crearOportunidad() {
  console.log('📘 Ejemplo 6: Crear Oportunidad\n');

  const client = createMCPClient();

  try {
    const nuevaOportunidad = {
      name: 'Venta Departamento - Tulum',
      contactId: 'contact_xyz789',
      monetaryValue: 650000,
      pipelineStage: 'presentacion',
      status: 'open' as const,
      assignedTo: 'TKzZQuHjdRG9x4tpwpRx', // Omar Curi
      expectedCloseDate: '2025-03-15',
      customField: {
        tipo_propiedad: 'departamento',
        zona: 'Tulum Centro',
        unidades_interes: 2
      }
    };

    const response = await client.createOpportunity(nuevaOportunidad);

    console.log('✅ Oportunidad creada:');
    console.log(`   ID: ${response.data?.id}`);
    console.log(`   Nombre: ${response.data?.name}`);
    console.log(`   Valor: $${response.data?.monetaryValue?.toLocaleString()}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 7: Listar Eventos de Calendario
// ========================================

async function ejemplo7_listarEventosCalendario() {
  console.log('📘 Ejemplo 7: Listar Eventos de Calendario\n');

  const client = createMCPClient();

  try {
    const hoy = new Date();
    const enUnasSemana = new Date();
    enUnasSemana.setDate(enUnasSemana.getDate() + 7);

    const response = await client.listCalendarEvents({
      brokerId: 'TKzZQuHjdRG9x4tpwpRx', // Omar Curi
      limit: 10
    });

    console.log('✅ Eventos próximos:');
    console.log(`   Total: ${response.metadata.count}\n`);

    if (response.data && response.data.length > 0) {
      response.data.forEach((event) => {
        const fecha = new Date(event.startTime);
        console.log(`   📅 ${event.appointmentTitle || 'Reunión'}`);
        console.log(`      Fecha: ${fecha.toLocaleString('es-MX')}`);
        console.log(`      Duración: ${event.duration || 60} min`);
        console.log(`      Estado: ${event.status}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 8: Sincronizar Datos de Broker
// ========================================

async function ejemplo8_sincronizarBroker() {
  console.log('📘 Ejemplo 8: Sincronizar Datos de Broker\n');

  const client = createMCPClient();

  try {
    const response = await client.syncBrokerData({
      brokerId: 'TKzZQuHjdRG9x4tpwpRx',
      syncType: 'incremental'
    });

    console.log('✅ Sincronización completada:');
    console.log(`   Request ID: ${response.requestId}`);
    console.log(`   Tiempo: ${response.metadata.processingTime}ms\n`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 9: Obtener Estadísticas de Broker
// ========================================

async function ejemplo9_statsDelatación() {
  console.log('📘 Ejemplo 9: Estadísticas de Broker\n');

  const client = createMCPClient();

  try {
    const response = await client.getBrokerStats('TKzZQuHjdRG9x4tpwpRx');

    console.log('✅ Estadísticas:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 10: Obtener Ranking
// ========================================

async function ejemplo10_obtenerRanking() {
  console.log('📘 Ejemplo 10: Ranking de Brokers\n');

  const client = createMCPClient();

  try {
    const response = await client.getRanking();

    console.log('✅ Ranking actual:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========================================
// EJEMPLO 11: Uso en Next.js API Route
// ========================================

/*
// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMCPClient } from '@/lib/n8n-mcp-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const client = createMCPClient();
    const response = await client.listContacts({ limit });

    return NextResponse.json({
      success: true,
      contacts: response.data,
      metadata: response.metadata
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
*/

// ========================================
// EJEMPLO 12: Uso en Componente React/Next.js
// ========================================

/*
'use client';

import { useState, useEffect } from 'react';
import { useMCPClient } from '@/lib/n8n-mcp-client';

export default function ContactsList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const mcp = useMCPClient('current-user-id');

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const response = await mcp.listContacts({ limit: 20 });
      setContacts(response.data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Contactos ({contacts.length})</h1>
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>
            {contact.contactName} - {contact.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/

// ========================================
// EJEMPLO 13: Pipeline de Procesamiento
// ========================================

async function ejemplo13_pipelineCompleto() {
  console.log('📘 Ejemplo 13: Pipeline de Procesamiento Completo\n');

  const client = createMCPClient();

  try {
    // 1. Obtener contactos nuevos (últimos 24 horas)
    console.log('1️⃣ Obteniendo contactos nuevos...');
    const contactsResponse = await client.listContacts({ limit: 100 });
    const contactosNuevos = contactsResponse.data?.filter(c => {
      const fechaCreacion = new Date(c.dateAdded || '');
      const hace24h = new Date();
      hace24h.setHours(hace24h.getHours() - 24);
      return fechaCreacion > hace24h;
    }) || [];

    console.log(`   ✅ ${contactosNuevos.length} contactos nuevos encontrados\n`);

    // 2. Para cada contacto sin oportunidad, crear una
    console.log('2️⃣ Creando oportunidades para nuevos contactos...');
    let oportunidadesCreadas = 0;

    for (const contacto of contactosNuevos.slice(0, 5)) {
      // Solo crear si tiene email o teléfono
      if (contacto.email || contacto.phone) {
        await client.createOpportunity({
          name: `Oportunidad - ${contacto.contactName}`,
          contactId: contacto.id,
          monetaryValue: 500000,
          pipelineStage: 'prospecto',
          status: 'open',
          assignedTo: contacto.assignedTo
        });
        oportunidadesCreadas++;
      }
    }

    console.log(`   ✅ ${oportunidadesCreadas} oportunidades creadas\n`);

    // 3. Sincronizar datos
    console.log('3️⃣ Sincronizando datos de brokers...');
    const brokersUnicos = [...new Set(contactosNuevos.map(c => c.assignedTo).filter(Boolean))];

    for (const brokerId of brokersUnicos.slice(0, 3)) {
      await client.syncBrokerData({
        brokerId: brokerId as string,
        syncType: 'incremental'
      });
    }

    console.log(`   ✅ ${brokersUnicos.length} brokers sincronizados\n`);

    console.log('✅ Pipeline completado exitosamente\n');
  } catch (error) {
    console.error('❌ Error en pipeline:', error);
  }
}

// ========================================
// EJECUTAR EJEMPLOS
// ========================================

async function ejecutarTodosLosEjemplos() {
  console.log('🚀 Ejecutando ejemplos de N8N MCP Client\n');
  console.log('==========================================\n');

  // Descomentar el ejemplo que quieras ejecutar:

  // await ejemplo1_setupBasico();
  // await ejemplo2_listarContactos();
  // await ejemplo3_crearContacto();
  // await ejemplo4_actualizarContacto();
  // await ejemplo5_listarOportunidades();
  // await ejemplo6_crearOportunidad();
  // await ejemplo7_listarEventosCalendario();
  // await ejemplo8_sincronizarBroker();
  // await ejemplo9_estadisticasBroker();
  // await ejemplo10_obtenerRanking();
  // await ejemplo13_pipelineCompleto();

  console.log('==========================================');
  console.log('✅ Ejemplos completados\n');
}

// Si se ejecuta directamente
if (require.main === module) {
  ejecutarTodosLosEjemplos().catch(console.error);
}

export {
  ejemplo1_setupBasico,
  ejemplo2_listarContactos,
  ejemplo3_crearContacto,
  ejemplo4_actualizarContacto,
  ejemplo5_listarOportunidades,
  ejemplo6_crearOportunidad,
  ejemplo7_listarEventosCalendario,
  ejemplo8_sincronizarBroker,
  ejemplo9_estadisticasBroker,
  ejemplo10_obtenerRanking,
  ejemplo13_pipelineCompleto
};
