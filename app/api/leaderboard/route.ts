// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'mes';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getServiceSupabase();

    // Usar la vista de ranking creada en gamification-schema.sql
    const { data: ranking, error } = await supabase
      .from('vw_ranking_actual')
      .select('*')
      .order('puntos_mes', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!ranking) {
      return NextResponse.json({
        periodo,
        fechaActualizacion: new Date().toISOString(),
        ranking: []
      });
    }

    // Formatear ranking con badges
    const formattedRanking = ranking.map((broker, index) => ({
      posicion: index + 1,
      brokerId: broker.broker_id,
      nombre: broker.nombre,
      avatar: broker.avatar,
      puntos: broker.puntos_mes,
      nivel: broker.nivel,
      badge: getBadge(index + 1),
      metricas: {
        llamadas: broker.llamadas_mes || 0,
        presentaciones: broker.presentaciones_mes || 0,
        ventas: broker.ventas_mes || 0
      }
    }));

    // Obtener cambios respecto al día anterior (si es disponible)
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    const { data: rankingAyer } = await supabase
      .from('ranking_historico')
      .select('broker_id, posicion')
      .eq('fecha', ayer.toISOString().split('T')[0]);

    // Agregar cambios de posición
    const rankingConCambios = formattedRanking.map(broker => {
      const posicionAyer = rankingAyer?.find(r => r.broker_id === broker.brokerId)?.posicion;
      const cambio = posicionAyer ? posicionAyer - broker.posicion : 0;

      return {
        ...broker,
        cambio,
        trending: cambio > 0 ? 'up' : cambio < 0 ? 'down' : 'same'
      };
    });

    return NextResponse.json({
      periodo,
      fechaActualizacion: new Date().toISOString(),
      ranking: rankingConCambios
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
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

function getBadge(posicion: number): string {
  const badges: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };
  return badges[posicion] || '';
}
