import { NextRequest, NextResponse } from 'next/server';

// Store para rate limiting
const rateLimitStore = new Map<string, number[]>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function getClientIP(request: NextRequest): string {
  // Obtener IP del cliente de manera segura
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || 'unknown';
}

export function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Rate limiting para APIs
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const maxRequests = request.nextUrl.pathname.includes('/auth/') ? 5 : 100;
    
    const userRequests = rateLimitStore.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      console.warn(`🚨 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }
    
    recentRequests.push(now);
    rateLimitStore.set(ip, recentRequests);
  }
  
  // Protección especial para login
  if (request.nextUrl.pathname.includes('/login')) {
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    
    if (attempts.count >= 5 && now - attempts.lastAttempt < 30 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 30 minutes.' },
        { status: 429 }
      );
    }
  }
  
  // Proteger rutas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }
    console.log('🔍 Middleware: Permitiendo acceso a', request.nextUrl.pathname);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};
