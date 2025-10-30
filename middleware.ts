// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/api/health'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // Si está autenticado y trata de ir al login, redirigir al dashboard
    if (session && pathname === '/login') {
      // Obtener rol del usuario
      const { data: profile } = await supabase
        .from('broker_profiles')
        .select('broker_id, role')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        if (profile.role === 'director' || profile.role === 'admin' || profile.role === 'manager') {
          return NextResponse.redirect(new URL('/executive', req.url));
        } else {
          return NextResponse.redirect(new URL(`/broker/${profile.broker_id}`, req.url));
        }
      }
    }
    return res;
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Obtener información del usuario
  const { data: profile, error: profileError } = await supabase
    .from('broker_profiles')
    .select('broker_id, role, activo')
    .eq('user_id', session.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verificar que el usuario esté activo
  if (!profile.activo) {
    return NextResponse.redirect(new URL('/unauthorized?reason=inactive', req.url));
  }

  // Proteger ruta /executive
  if (pathname.startsWith('/executive')) {
    const allowedRoles = ['director', 'admin', 'manager'];
    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.redirect(new URL('/unauthorized?reason=insufficient_permissions', req.url));
    }
  }

  // Proteger ruta /broker/[brokerId]
  if (pathname.startsWith('/broker/')) {
    const pathBrokerId = pathname.split('/')[2];

    // Director y admin pueden ver cualquier dashboard
    if (profile.role === 'director' || profile.role === 'admin') {
      return res;
    }

    // Manager puede ver dashboards de su equipo (implementar lógica de equipo)
    if (profile.role === 'manager') {
      return res; // TODO: Verificar que el broker esté en su equipo
    }

    // Broker solo puede ver su propio dashboard
    if (profile.broker_id !== pathBrokerId) {
      return NextResponse.redirect(new URL(`/broker/${profile.broker_id}`, req.url));
    }
  }

  // Proteger rutas de API
  if (pathname.startsWith('/api/')) {
    // Las API routes manejan su propia autenticación
    // Pero podemos agregar headers con info del usuario
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-broker-id', profile.broker_id || '');
    response.headers.set('x-user-role', profile.role);
    return response;
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
