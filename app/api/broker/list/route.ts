// app/api/broker/list/route.ts
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'edge';

export async function GET() {
  try {
    // Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar permisos (solo managers, directors, admins pueden ver lista completa)
    if (!['manager', 'director', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    // Obtener lista de brokers activos
    const { data: brokers, error } = await supabase
      .from('broker_profiles')
      .select('broker_id, nombre, email, nivel, puntos_mes, avatar')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error fetching brokers:', error);
      return NextResponse.json(
        { error: 'Error al obtener brokers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brokers: brokers || []
    });
  } catch (error) {
    console.error('Error in /api/broker/list:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
