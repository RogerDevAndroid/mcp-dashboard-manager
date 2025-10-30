// lib/auth.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export type UserRole = 'broker' | 'manager' | 'director' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  brokerId?: string;
  role: UserRole;
  nombre: string;
  avatar?: string;
}

export interface Permission {
  permission: string;
  resource?: string;
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  broker: [
    'view_own_dashboard',
    'view_own_activities',
    'create_activities',
    'view_own_leads',
    'view_own_tasks'
  ],
  manager: [
    'view_own_dashboard',
    'view_all_dashboards',
    'view_executive_dashboard',
    'manage_leads',
    'view_team_activities',
    'export_team_data'
  ],
  director: [
    'view_own_dashboard',
    'view_all_dashboards',
    'view_executive_dashboard',
    'manage_leads',
    'manage_brokers',
    'view_team_activities',
    'export_team_data',
    'view_analytics',
    'manage_assignments'
  ],
  admin: [
    'view_own_dashboard',
    'view_all_dashboards',
    'view_executive_dashboard',
    'manage_leads',
    'manage_brokers',
    'manage_users',
    'configure_system',
    'view_team_activities',
    'export_team_data',
    'view_analytics',
    'manage_assignments',
    'view_audit_logs'
  ]
};

/**
 * Obtener el cliente de Supabase para el servidor
 */
export function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Obtener el usuario actual desde el servidor
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = getServerSupabase();

    // Obtener usuario de Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Obtener información del broker profile
    const { data: profile, error: profileError } = await supabase
      .from('broker_profiles')
      .select('broker_id, nombre, email, role, avatar')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return {
      id: user.id,
      email: profile.email,
      brokerId: profile.broker_id,
      role: profile.role as UserRole,
      nombre: profile.nombre,
      avatar: profile.avatar
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Verificar si el usuario tiene un permiso específico
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Verificar si el usuario puede ver un dashboard específico
 */
export function canViewDashboard(user: AuthUser | null, targetBrokerId: string): boolean {
  if (!user) return false;

  // Admin y director pueden ver todos
  if (user.role === 'admin' || user.role === 'director') {
    return true;
  }

  // Manager puede ver su equipo (implementar lógica de equipo aquí)
  if (user.role === 'manager') {
    return true; // TODO: Verificar que el broker esté en su equipo
  }

  // Broker solo puede ver el suyo
  return user.brokerId === targetBrokerId;
}

/**
 * Obtener redirección basada en rol
 */
export function getDefaultRedirect(role: UserRole, brokerId?: string): string {
  switch (role) {
    case 'admin':
    case 'director':
      return '/executive';
    case 'manager':
      return '/executive';
    case 'broker':
      return brokerId ? `/broker/${brokerId}` : '/';
    default:
      return '/';
  }
}

/**
 * Middleware helper para proteger rutas
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Middleware helper para requerir rol específico
 */
export async function requireRole(requiredRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!requiredRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }

  return user;
}

/**
 * Guardar filtro para dashboard ejecutivo
 */
export async function saveFilter(
  userId: string,
  name: string,
  filterConfig: any,
  description?: string,
  isDefault?: boolean,
  isPublic?: boolean
) {
  const supabase = getServerSupabase();

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

  if (error) throw error;
  return data;
}

/**
 * Obtener filtros guardados del usuario
 */
export async function getSavedFilters(userId: string) {
  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Registrar sesión del usuario
 */
export async function logUserSession(
  userId: string,
  brokerId: string | undefined,
  request: Request
) {
  const supabase = getServerSupabase();

  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

  await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      broker_id: brokerId,
      user_agent: userAgent,
      ip_address: ip,
      device_info: {
        userAgent,
        timestamp: new Date().toISOString()
      },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    });
}
