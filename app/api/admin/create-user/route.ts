// API Route para crear usuario administrador
// Solo para desarrollo - ELIMINAR en producción
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, nombre, role } = await request.json();

    // Validar que tengamos las variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    // Cliente con service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nombre,
        role
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Error creating auth user', details: authError },
        { status: 400 }
      );
    }

    // 2. Crear perfil en broker_profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('broker_profiles')
      .upsert({
        broker_id: `${role}_${Date.now()}`,
        user_id: authData.user.id,
        nombre,
        email,
        telefono: '+52 000 000 0000',
        avatar: null,
        puntos_totales: 0,
        puntos_mes: 0,
        nivel: role === 'admin' ? 'Legend' : 'Junior',
        activo: true,
        role,
        ultimo_login: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Error creating profile', details: profileError },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profileData
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
