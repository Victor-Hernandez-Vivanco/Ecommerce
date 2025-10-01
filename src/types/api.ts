/**
 * Tipos compartidos para respuestas de API
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Respuesta de paginación
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse extends ApiResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

/**
 * Errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse extends ApiResponse {
  errors: ValidationError[];
}
