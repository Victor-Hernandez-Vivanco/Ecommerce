/**
 * Utilidades de autenticación compartidas
 * Centraliza la verificación de tokens y permisos
 */

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

/**
 * Interfaz para el token JWT decodificado
 */
export interface DecodedToken {
  userId: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Verifica y decodifica un token de administrador
 *
 * @param request - Request de Next.js con header de autorización
 * @returns Token decodificado si es válido y es admin, null en caso contrario
 *
 * @example
 * ```typescript
 * const admin = verifyAdminToken(request);
 * if (!admin) {
 *   return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
 * }
 * ```
 */
export function verifyAdminToken(request: NextRequest): DecodedToken | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // Verificar que sea admin
    if (!decoded.isAdmin || decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verifica y decodifica un token de usuario (admin o regular)
 *
 * @param request - Request de Next.js con header de autorización
 * @returns Token decodificado si es válido, null en caso contrario
 *
 * @example
 * ```typescript
 * const user = verifyUserToken(request);
 * if (!user) {
 *   return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
 * }
 * ```
 */
export function verifyUserToken(request: NextRequest): DecodedToken | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extrae el token del header de autorización
 *
 * @param request - Request de Next.js
 * @returns Token extraído o null si no existe
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  return authHeader?.split(" ")[1] || null;
}

/**
 * Verifica si un token es válido sin verificar permisos
 *
 * @param token - Token JWT a verificar
 * @returns true si el token es válido, false en caso contrario
 */
export function isTokenValid(token: string): boolean {
  try {
    jwt.verify(token, env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
