import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Verificar que la tabla mcp_servers existe
    const { data: servers, error: serversError, count } = await supabase
      .from('mcp_servers')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    if (serversError) {
      return NextResponse.json(
        {
          success: false,
          error: serversError.message,
          details: serversError,
          message: 'Error al conectar con Supabase. Verifica que el schema SQL esté ejecutado.',
        },
        { status: 500 }
      );
    }

    // Test 2: Verificar tabla mcp_configurations
    const { error: configsError } = await supabase
      .from('mcp_configurations')
      .select('*', { count: 'exact', head: true });

    if (configsError) {
      return NextResponse.json(
        {
          success: false,
          error: configsError.message,
          message: 'Tabla mcp_configurations no encontrada',
        },
        { status: 500 }
      );
    }

    // Test 3: Verificar tabla specialized_agents
    const { error: agentsError } = await supabase
      .from('specialized_agents')
      .select('*', { count: 'exact', head: true });

    if (agentsError) {
      return NextResponse.json(
        {
          success: false,
          error: agentsError.message,
          message: 'Tabla specialized_agents no encontrada',
        },
        { status: 500 }
      );
    }

    // Todo funcionó
    return NextResponse.json({
      success: true,
      message: 'Conexión con Supabase exitosa',
      data: {
        mcp_servers_count: count,
        sample_servers: servers?.slice(0, 3).map((s) => ({
          name: s.display_name,
          category: s.category,
        })),
        tables_verified: ['mcp_servers', 'mcp_configurations', 'specialized_agents'],
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Error inesperado al conectar con Supabase',
      },
      { status: 500 }
    );
  }
}
