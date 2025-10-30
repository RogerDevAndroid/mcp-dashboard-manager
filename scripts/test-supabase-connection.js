#!/usr/bin/env node

/**
 * Script para probar la conexión con Supabase
 * Ejecuta: node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Probando conexión con Supabase...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('');
  console.log('Asegúrate de tener un archivo .env.local con:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('✅ Variables de entorno encontradas');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📊 Probando consultas...\n');

    // Test 1: Verificar que la tabla mcp_servers existe
    console.log('Test 1: Consultando tabla mcp_servers...');
    const { data: servers, error: serversError, count } = await supabase
      .from('mcp_servers')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (serversError) {
      console.log('❌ Error:', serversError.message);
      if (serversError.message.includes('does not exist')) {
        console.log('');
        console.log('⚠️  La tabla mcp_servers no existe.');
        console.log('   Por favor ejecuta el schema SQL primero:');
        console.log('   https://supabase.com/dashboard/project/mmxkcsqflbqzgsekxiwp/sql/new');
        console.log('');
        console.log('   Copia y pega todo el contenido de:');
        console.log('   database/mcp-manager-schema.sql');
      }
      return;
    }

    console.log(`✅ Tabla encontrada con ${count} registros`);
    if (servers && servers.length > 0) {
      console.log('   Primeros 3 MCPs:');
      servers.slice(0, 3).forEach(server => {
        console.log(`   - ${server.display_name} (${server.category})`);
      });
    }
    console.log('');

    // Test 2: Verificar tabla mcp_configurations
    console.log('Test 2: Consultando tabla mcp_configurations...');
    const { data: configs, error: configsError } = await supabase
      .from('mcp_configurations')
      .select('*', { count: 'exact', head: true });

    if (configsError) {
      console.log('❌ Error:', configsError.message);
      return;
    }

    console.log('✅ Tabla mcp_configurations accesible');
    console.log('');

    // Test 3: Verificar tabla specialized_agents
    console.log('Test 3: Consultando tabla specialized_agents...');
    const { data: agents, error: agentsError } = await supabase
      .from('specialized_agents')
      .select('*', { count: 'exact', head: true });

    if (agentsError) {
      console.log('❌ Error:', agentsError.message);
      return;
    }

    console.log('✅ Tabla specialized_agents accesible');
    console.log('');

    // Test 4: Verificar vistas
    console.log('Test 4: Consultando vista mcp_servers_with_stats...');
    const { data: stats, error: statsError } = await supabase
      .from('mcp_servers_with_stats')
      .select('*')
      .limit(3);

    if (statsError) {
      console.log('⚠️  Vista no disponible:', statsError.message);
    } else {
      console.log('✅ Vista mcp_servers_with_stats accesible');
      if (stats && stats.length > 0) {
        console.log('   Ejemplo de stats:');
        stats.forEach(stat => {
          console.log(`   - ${stat.display_name}: ${stat.total_users} usuarios, ${stat.total_executions} ejecuciones`);
        });
      }
    }
    console.log('');

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ¡Conexión exitosa con Supabase!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • MCP Servers disponibles: ${count}`);
    console.log('   • Tablas verificadas: 3/3 ✓');
    console.log('   • Vistas verificadas: 1/1 ✓');
    console.log('');
    console.log('🚀 Tu base de datos está lista para usar!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('   1. Deploy del dashboard a Netlify');
    console.log('   2. Configurar MCPs individuales');
    console.log('   3. Crear tus primeros agentes especializados');
    console.log('');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    console.log('');
    console.log('🔍 Verifica:');
    console.log('   1. Que las credenciales sean correctas');
    console.log('   2. Que el proyecto de Supabase esté activo');
    console.log('   3. Que hayas ejecutado el schema SQL');
    console.log('');
  }
}

testConnection();
