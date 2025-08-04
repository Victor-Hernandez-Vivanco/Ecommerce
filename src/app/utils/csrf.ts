import { NextRequest } from 'next/server';

const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomUUID();
  const expires = Date.now() + (60 * 60 * 1000); // 1 hora
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Limpiar tokens expirados
  for (const [id, data] of csrfTokens.entries()) {
    if (data.expires < Date.now()) {
      csrfTokens.delete(id);
    }
  }
  
  return token;
}

export function validateCSRFTokenBySession(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

export function validateCSRFToken(request: NextRequest, token: string): boolean {
  const headerToken = request.headers.get('X-CSRF-Token');
  return headerToken === token;
}

// Función para limpiar tokens expirados periódicamente
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  }
}