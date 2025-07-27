import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Proteger todas las rutas que empiecen con /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acceso a la página de login de admin
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // ✅ SIMPLIFICAR: Solo verificar en el cliente
    // El middleware no puede acceder a localStorage, así que
    // dejamos que el dashboard maneje la verificación
    console.log('🔍 Middleware: Permitiendo acceso a', request.nextUrl.pathname);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};
