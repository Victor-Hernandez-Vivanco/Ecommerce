import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";

// Interfaz para el token decodificado
interface DecodedToken {
  userId: string;
  isAdmin: boolean;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Función para verificar token de admin
export const verifyAdminToken = (request: NextRequest): DecodedToken | null => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    // Verificar que sea admin
    return decoded.isAdmin && decoded.role === "admin" ? decoded : null;
  } catch {
    return null;
  }
};

// Función para verificar cualquier token de usuario
export const verifyUserToken = (request: NextRequest): DecodedToken | null => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

    return decoded;
  } catch {
    return null;
  }
};
