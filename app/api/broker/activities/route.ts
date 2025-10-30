// app/api/broker/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { calcularPuntos } from '@/lib/utils';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Sistema de puntuación según screenshot del usuario
const PUNTUACION_SYSTEM = {
  presentaciones: {
    zoom_broker: 1,
    eventos_broker: 1,
    zoom_inmobiliarias: 2,
    zoom_cliente_final: 3,
    fisica_broker: 3,
    fisica_inmobiliarias: 4,
    fisica_cliente_final: 5
  },
  resultados: {
    apartado: 10,
    venta_alianza_broker: 5,
    venta_propia: 10
  },
  actividades: {
    llamada: 2,
    email: 1,
    whatsapp: 1,
    reunion_agendada: 3
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brokerId, tipo, subtipo, leadId, descripcion, resultado, metadata } = body;

    // Validaciones
    if (!brokerId || !tipo) {
      return NextResponse.json(
        { error: 'brokerId and tipo are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Calcular puntos según el tipo y subtipo
    const puntos = calcularPuntos(tipo, subtipo, resultado);

    // Insertar actividad (el trigger actualizar_puntos_broker se ejecutará automáticamente)
    const { data: actividad, error } = await supabase
      .from('actividades')
      .insert({
        broker_id: brokerId,
        tipo,
        subtipo,
        lead_id: leadId,
        descripcion,
        puntos,
        metadata: metadata || {},
        fecha: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Obtener puntos actualizados del broker
    const { data: broker } = await supabase
      .from('broker_profiles')
      .select('puntos_mes, puntos_total, nivel')
      .eq('broker_id', brokerId)
      .single();

    // Verificar si se desbloquearon logros
    const logrosDesbloqueados = await verificarLogros(supabase, brokerId);

    return NextResponse.json({
      success: true,
      actividad: {
        id: actividad.id,
        puntosGanados: puntos,
        nuevoTotal: broker?.puntos_mes || 0,
        nivel: broker?.nivel || 'Rookie',
        logrosDesbloqueados
      }
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function verificarLogros(supabase: any, brokerId: string) {
  const logrosDesbloqueados = [];

  try {
    // Obtener estadísticas del broker (último mes)
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);
    primerDiaMes.setHours(0, 0, 0, 0);

    const { data: stats } = await supabase
      .from('actividades')
      .select('tipo, subtipo')
      .eq('broker_id', brokerId)
      .gte('fecha', primerDiaMes.toISOString());

    if (!stats) return logrosDesbloqueados;

    const llamadas = stats.filter((a: any) => a.tipo === 'llamada').length;
    const presentaciones = stats.filter((a: any) => a.tipo === 'presentacion').length;
    const ventas = stats.filter((a: any) => a.tipo === 'venta').length;

    // Definir logros y sus condiciones
    const logrosParaVerificar = [
      { id: 'call-machine', condicion: llamadas >= 100, nombre: 'Call Machine', descripcion: '100 llamadas en un mes', icon: '📞' },
      { id: 'presenter-pro', condicion: presentaciones >= 50, nombre: 'Presenter Pro', descripcion: '50 presentaciones completadas', icon: '🎤' },
      { id: 'the-closer', condicion: ventas >= 10, nombre: 'The Closer', descripcion: '10 ventas cerradas', icon: '💰' },
      { id: 'speed-demon', condicion: llamadas >= 20, nombre: 'Speed Demon', descripcion: '20 llamadas en un día', icon: '⚡' },
      { id: 'hot-streak', condicion: ventas >= 5, nombre: 'Hot Streak', descripcion: '5 ventas en una semana', icon: '🔥' },
    ];

    for (const logro of logrosParaVerificar) {
      if (logro.condicion) {
        // Verificar si ya lo tiene
        const { data: existe } = await supabase
          .from('broker_achievements')
          .select('id')
          .eq('broker_id', brokerId)
          .eq('achievement_id', logro.id)
          .single();

        if (!existe) {
          // Verificar si el logro existe en la tabla de logros
          let { data: logroDefinicion } = await supabase
            .from('logros_achievements')
            .select('id')
            .eq('achievement_id', logro.id)
            .single();

          // Si no existe, crearlo
          if (!logroDefinicion) {
            const { data: nuevoLogro } = await supabase
              .from('logros_achievements')
              .insert({
                achievement_id: logro.id,
                nombre: logro.nombre,
                descripcion: logro.descripcion,
                icon: logro.icon,
                categoria: 'performance',
                puntos_bonus: 10
              })
              .select()
              .single();

            logroDefinicion = nuevoLogro;
          }

          if (logroDefinicion) {
            // Otorgar logro
            await supabase
              .from('broker_achievements')
              .insert({
                broker_id: brokerId,
                achievement_id: logro.id,
                fecha_obtenido: new Date().toISOString()
              });

            logrosDesbloqueados.push({
              id: logro.id,
              nombre: logro.nombre,
              descripcion: logro.descripcion,
              icon: logro.icon
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error verificando logros:', error);
  }

  return logrosDesbloqueados;
}

// GET: Obtener actividades del broker
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brokerId = searchParams.get('brokerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!brokerId) {
      return NextResponse.json(
        { error: 'brokerId is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: actividades, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('broker_id', brokerId)
      .order('fecha', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      actividades,
      total: actividades.length,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
