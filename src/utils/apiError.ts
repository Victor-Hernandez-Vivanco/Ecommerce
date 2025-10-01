import { NextResponse } from "next/server";

/**
 * Clase personalizada para errores de API
 * Permite un manejo consistente de errores en toda la aplicación
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Genera una respuesta de error estandarizada
 *
 * @param error - Error capturado (puede ser ApiError, Error o unknown)
 * @returns NextResponse con formato de error consistente
 *
 * @example
 * ```typescript
 * try {
 *   // código que puede fallar
 * } catch (error) {
 *   return errorResponse(error);
 * }
 * ```
 */
export function errorResponse(error: unknown): NextResponse {
  // Si es un ApiError, usar su información
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Si es un Error estándar
  if (error instanceof Error) {
    // En desarrollo, mostrar el error completo
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }

    // En producción, mensaje genérico
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }

  // Error desconocido
  return NextResponse.json(
    {
      success: false,
      message: "Error inesperado",
    },
    { status: 500 }
  );
}

/**
 * Errores predefinidos comunes
 */
export const CommonErrors = {
  UNAUTHORIZED: new ApiError(401, "No autorizado", "UNAUTHORIZED"),
  FORBIDDEN: new ApiError(403, "Acceso denegado", "FORBIDDEN"),
  NOT_FOUND: new ApiError(404, "Recurso no encontrado", "NOT_FOUND"),
  VALIDATION_ERROR: new ApiError(
    400,
    "Error de validación",
    "VALIDATION_ERROR"
  ),
  INTERNAL_ERROR: new ApiError(
    500,
    "Error interno del servidor",
    "INTERNAL_ERROR"
  ),
  TOO_MANY_REQUESTS: new ApiError(429, "Demasiadas solicitudes", "RATE_LIMIT"),
};
