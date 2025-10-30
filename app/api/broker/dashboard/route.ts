// app/api/broker/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getNivelPuntos } from '@/lib/utils';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brokerId = searchParams.get('brokerId');

    if (!brokerId) {
      return NextResponse.json(
        { error: 'brokerId is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Usar la vista ya creada en database/gamification-schema.sql
    const { data: dashboard, error } = await supabase
      .from('vw_broker_dashboard')
      .select('*')
      .eq('broker_id', brokerId)
      .single();

    if (error) {
      console.error('Error fetching dashboard:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Obtener tareas pendientes
    const { data: tareas } = await supabase
      .from('tareas_broker')
      .select('*')
      .eq('broker_id', brokerId)
      .eq('completada', false)
      .order('prioridad', { ascending: false })
      .limit(5);

    // Obtener logros recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logros } = await supabase
      .from('broker_achievements')
      .select('*, achievement:logros_achievements(*)')
      .eq('broker_id', brokerId)
      .gte('fecha_obtenido', sevenDaysAgo.toISOString())
      .order('fecha_obtenido', { ascending: false });

    // Calcular proyecciones
    const proyecciones = calcularProyecciones(dashboard);

    // Formatear respuesta
    const response = {
      broker: {
        id: dashboard.broker_id,
        nombre: dashboard.nombre,
        email: dashboard.email,
        puntosMes: dashboard.puntos_mes,
        puntosTotal: dashboard.puntos_total,
        nivel: dashboard.nivel,
        rangoActual: dashboard.ranking_posicion,
        avatar: dashboard.avatar,
        progreso: {
          actual: dashboard.puntos_mes,
          siguienteNivel: getNivelPuntos(dashboard.nivel),
          porcentaje: (dashboard.puntos_mes / getNivelPuntos(dashboard.nivel)) * 100,
          puntosNecesarios: getNivelPuntos(dashboard.nivel) - dashboard.puntos_mes
        }
      },
      metricas: {
        leadsAsignados: dashboard.leads_asignados || 0,
        leadsContactados: dashboard.leads_contactados || 0,
        llamadasHoy: dashboard.llamadas_hoy || 0,
        presentacionesSemana: dashboard.presentaciones_semana || 0,
        oportunidadesAbiertas: dashboard.oportunidades_abiertas || 0,
        tasaConversion: dashboard.tasa_conversion || 0,
        ventasMes: dashboard.ventas_mes || 0,
        revenueMes: dashboard.revenue_mes || 0
      },
      proyecciones,
      tareasPendientes: (tareas || []).map(t => ({
        id: t.id,
        tipo: t.tipo,
        descripcion: t.descripcion,
        puntos: t.puntos,
        prioridad: t.prioridad,
        vence: t.vence,
        completada: t.completada
      })),
      logrosRecientes: (logros || []).map(l => ({
        id: l.id,
        nombre: (l.achievement as any)?.nombre || 'Achievement',
        descripcion: (l.achievement as any)?.descripcion || '',
        icon: (l.achievement as any)?.icon || '🏆',
        fecha: l.fecha_obtenido
      }))
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
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

function calcularProyecciones(dashboard: any) {
  const hoy = new Date();
  const diasDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diaActual = hoy.getDate();
  const diasRestantes = diasDelMes - diaActual;

  const puntosNecesarios = getNivelPuntos(dashboard.nivel) - dashboard.puntos_mes;
  const promedioActual = dashboard.puntos_mes / diaActual;
  const promedioNecesario = puntosNecesarios / (diasRestantes || 1);

  // Calculamos actividades necesarias basadas en el sistema de puntos
  const avgPuntosPorLlamada = 2; // promedio entre 1-3 puntos
  const avgPuntosPorPresentacion = 3; // promedio entre 1-5 puntos
  const avgPuntosPorVenta = 10; // apartado o venta

  const llamadasDiarias = Math.ceil(promedioNecesario / avgPuntosPorLlamada);
  const presentacionesSemanales = Math.ceil((promedioNecesario * 7) / avgPuntosPorPresentacion);
  const ventasProyectadas = Math.ceil(puntosNecesarios / avgPuntosPorVenta / 4); // por semana

  return {
    puntosNecesarios: Math.max(0, puntosNecesarios),
    diasRestantes,
    promedioActual: parseFloat(promedioActual.toFixed(2)),
    promedioNecesario: parseFloat(promedioNecesario.toFixed(2)),
    actividades: {
      llamadasDiarias: Math.max(0, llamadasDiarias),
      presentacionesSemanales: Math.max(0, presentacionesSemanales),
      ventasProyectadas: Math.max(0, ventasProyectadas)
    }
  };
}
