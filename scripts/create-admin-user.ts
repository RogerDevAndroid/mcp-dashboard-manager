// Script para crear usuario administrador
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Cliente con service role key para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'rgarciavital@gmail.com',
      password: 'holamundo',
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: 'Roger Garcia Vital',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error al crear usuario en Auth:', authError);
      throw authError;
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id);

    // 2. Crear o actualizar perfil en broker_profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('broker_profiles')
      .upsert({
        broker_id: `admin_${Date.now()}`, // Generar ID único
        user_id: authData.user.id,
        nombre: 'Roger Garcia Vital',
        email: 'rgarciavital@gmail.com',
        telefono: '+52 000 000 0000',
        avatar: null,
        puntos_totales: 0,
        puntos_mes: 0,
        nivel: 'Legend',
        activo: true,
        role: 'admin',
        ultimo_login: new Date().toISOString()
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error al crear perfil:', profileError);
      throw profileError;
    }

    console.log('✅ Perfil creado en broker_profiles:', profileData);

    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('\n📋 Credenciales:');
    console.log('   Email: rgarciavital@gmail.com');
    console.log('   Password: holamundo');
    console.log('   Role: admin');
    console.log('   User ID:', authData.user.id);
    console.log('\n🔗 Puedes iniciar sesión en: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

// Ejecutar
createAdminUser();
