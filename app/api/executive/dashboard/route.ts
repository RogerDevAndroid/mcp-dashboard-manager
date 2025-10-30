// app/api/executive/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parsear filtros desde query params
    const filters = {
      dateStart: searchParams.get('dateStart') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      dateEnd: searchParams.get('dateEnd') || new Date().toISOString(),
      brokers: searchParams.get('brokers')?.split(',').filter(Boolean) || [],
      stages: searchParams.get('stages')?.split(',').filter(Boolean) || [],
      minRevenue: searchParams.get('minRevenue') ? parseFloat(searchParams.get('minRevenue')!) : undefined,
      maxRevenue: searchParams.get('maxRevenue') ? parseFloat(searchParams.get('maxRevenue')!) : undefined,
    };

    const supabase = getServiceSupabase();

    // ========================================
    // 1. RESUMEN DEL EQUIPO
    // ========================================

    // Obtener todos los brokers activos
    let brokersQuery = supabase
      .from('broker_profiles')
      .select('*')
      .eq('activo', true);

    // Aplicar filtro de brokers si existe
    if (filters.brokers.length > 0) {
      brokersQuery = brokersQuery.in('broker_id', filters.brokers);
    }

    const { data: brokers } = await brokersQuery;

    const totalBrokers = brokers?.length || 0;
    const brokersActivos = brokers?.filter(b => b.activo).length || 0;
    const puntosPromedioEquipo = brokers?.reduce((sum, b) => sum + b.puntos_mes, 0) / totalBrokers || 0;

    // Métricas agregadas del dashboard view
    let metricsQuery = supabase
      .from('vw_broker_dashboard')
      .select('*');

    if (filters.brokers.length > 0) {
      metricsQuery = metricsQuery.in('broker_id', filters.brokers);
    }

    const { data: metricas } = await metricsQuery;

    const leadsAsignadosTotal = metricas?.reduce((sum, m) => sum + (m.leads_asignados || 0), 0) || 0;
    const oportunidadesAbiertas = metricas?.reduce((sum, m) => sum + (m.oportunidades_abiertas || 0), 0) || 0;
    const ventasMes = metricas?.reduce((sum, m) => sum + (m.ventas_mes || 0), 0) || 0;
    const revenueMes = metricas?.reduce((sum, m) => sum + (m.revenue_mes || 0), 0) || 0;
    const tasaConversionPromedio = metricas && metricas.length > 0
      ? metricas.reduce((sum, m) => sum + (m.tasa_conversion || 0), 0) / metricas.length
      : 0;

    // ========================================
    // 2. TOP PERFORMERS
    // ========================================

    let topPerformersQuery = supabase
      .from('vw_ranking_actual')
      .select('*')
      .order('puntos_mes', { ascending: false })
      .limit(5);

    if (filters.brokers.length > 0) {
      topPerformersQuery = topPerformersQuery.in('broker_id', filters.brokers);
    }

    const { data: topPerformers } = await topPerformersQuery;

    // ========================================
    // 3. ALERTAS
    // ========================================

    const alertas = [];

    if (metricas) {
      for (const broker of metricas) {
        // Alerta de bajo rendimiento (0 ventas)
        if (broker.ventas_mes === 0) {
          alertas.push({
            tipo: 'bajo_rendimiento',
            brokerId: broker.broker_id,
            mensaje: `${broker.nombre} tiene 0 ventas este mes`,
            prioridad: 'alta'
          });
        }

        // Alerta de poca actividad (menos de 50 llamadas)
        if (broker.llamadas_mes < 50) {
          alertas.push({
            tipo: 'poca_actividad',
            brokerId: broker.broker_id,
            mensaje: `${broker.nombre} ha hecho menos de 50 llamadas`,
            prioridad: 'media'
          });
        }

        // Alerta de baja conversión (menos del 15%)
        if (broker.tasa_conversion < 15 && broker.leads_asignados > 10) {
          alertas.push({
            tipo: 'baja_conversion',
            brokerId: broker.broker_id,
            mensaje: `${broker.nombre} tiene una tasa de conversión baja (${broker.tasa_conversion.toFixed(1)}%)`,
            prioridad: 'media'
          });
        }
      }
    }

    // ========================================
    // 4. TENDENCIAS
    // ========================================

    // Actividades de los últimos 7 días
    const fechaInicio7Dias = new Date();
    fechaInicio7Dias.setDate(fechaInicio7Dias.getDate() - 7);

    let actividadesQuery = supabase
      .from('actividades')
      .select('tipo, fecha')
      .gte('fecha', fechaInicio7Dias.toISOString())
      .order('fecha', { ascending: true });

    if (filters.brokers.length > 0) {
      actividadesQuery = actividadesQuery.in('broker_id', filters.brokers);
    }

    const { data: actividadesDiarias } = await actividadesQuery;

    const llamadasPorDia = calcularTendenciaDiaria(actividadesDiarias || [], 'llamada');
    const presentacionesPorSemana = [12, 15, 18, 14]; // Simplificado
    const ventasPorMes = [8, 12, ventasMes]; // Simplificado

    // ========================================
    // 5. DISTRIBUCIÓN POR PIPELINE
    // ========================================

    let oportunidadesQuery = supabase
      .from('oportunidades_broker')
      .select('etapa, valor, estado')
      .eq('estado', 'open');

    if (filters.brokers.length > 0) {
      oportunidadesQuery = oportunidadesQuery.in('broker_id', filters.brokers);
    }

    if (filters.stages.length > 0) {
      oportunidadesQuery = oportunidadesQuery.in('etapa', filters.stages);
    }

    if (filters.minRevenue) {
      oportunidadesQuery = oportunidadesQuery.gte('valor', filters.minRevenue);
    }

    if (filters.maxRevenue) {
      oportunidadesQuery = oportunidadesQuery.lte('valor', filters.maxRevenue);
    }

    const { data: oportunidades } = await oportunidadesQuery;

    const pipelineDistribution = oportunidades?.reduce((acc: any, opp) => {
      const etapa = opp.etapa || 'unknown';
      if (!acc[etapa]) {
        acc[etapa] = { count: 0, valor: 0 };
      }
      acc[etapa].count++;
      acc[etapa].valor += opp.valor || 0;
      return acc;
    }, {});

    // ========================================
    // RESPUESTA FINAL
    // ========================================

    return NextResponse.json({
      resumenEquipo: {
        totalBrokers,
        brokersActivos,
        puntosPromedioEquipo: parseFloat(puntosPromedioEquipo.toFixed(2)),
        leadsAsignadosTotal,
        oportunidadesAbiertas,
        ventasMes,
        revenueMes,
        tasaConversionPromedio: parseFloat(tasaConversionPromedio.toFixed(2))
      },
      topPerformers: topPerformers || [],
      alertas,
      tendencias: {
        llamadasPorDia,
        presentacionesPorSemana,
        ventasPorMes
      },
      pipelineDistribution,
      filtros: filters
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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

function calcularTendenciaDiaria(actividades: any[], tipo: string): number[] {
  const dias = 7;
  const resultado = new Array(dias).fill(0);

  for (const actividad of actividades) {
    if (actividad.tipo !== tipo) continue;

    const fecha = new Date(actividad.fecha);
    const diasAtras = Math.floor((Date.now() - fecha.getTime()) / (24 * 60 * 60 * 1000));

    if (diasAtras < dias) {
      resultado[dias - 1 - diasAtras]++;
    }
  }

  return resultado;
}

// POST: Guardar filtro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, filterConfig, description, isDefault, isPublic } = body;

    if (!userId || !name || !filterConfig) {
      return NextResponse.json(
        { error: 'userId, name, and filterConfig are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('saved_filters')
      .insert({
        user_id: userId,
        name,
        description,
        filter_config: filterConfig,
        is_default: isDefault || false,
        is_public: isPublic || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving filter:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      filter: data
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
