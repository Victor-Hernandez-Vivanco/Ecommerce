/**
 * Configuración centralizada de variables de entorno
 * Valida que todas las variables críticas estén definidas
 */

interface EnvConfig {
  MONGODB_URI: string;
  JWT_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(
      `❌ Variable de entorno requerida no encontrada: ${key}\n` +
        `Por favor, configura ${key} en tu archivo .env.local`
    );
  }

  return value || "";
}

export const env: EnvConfig = {
  MONGODB_URI: getEnvVar("MONGODB_URI"),
  JWT_SECRET: getEnvVar("JWT_SECRET"),
  NODE_ENV: (getEnvVar("NODE_ENV", false) ||
    "development") as EnvConfig["NODE_ENV"],
  NEXTAUTH_SECRET: getEnvVar("NEXTAUTH_SECRET", false),
  NEXTAUTH_URL: getEnvVar("NEXTAUTH_URL", false),
};

// Validar en tiempo de ejecución
if (env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET debe tener al menos 32 caracteres para ser seguro"
  );
}

export default env;
