import { NextRequest } from "next/server";
import { SecurityLogger } from "./securityLogger";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || cfConnectingIP || "unknown";
}

export function validateApiRequest(request: NextRequest): boolean {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Detectar bots maliciosos
  const suspiciousAgents = [
    "sqlmap",
    "nikto",
    "nmap",
    "masscan",
    "burp",
    "zap",
  ];
  if (
    suspiciousAgents.some((agent) => userAgent.toLowerCase().includes(agent))
  ) {
    SecurityLogger.log({
      type: "SUSPICIOUS_ACTIVITY",
      ip,
      userAgent,
      details: `Suspicious user agent detected: ${userAgent}`,
    });
    return false;
  }

  // Validar Content-Type para POST/PUT
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentType = request.headers.get("content-type");
    if (
      !contentType ||
      (!contentType.includes("application/json") &&
        !contentType.includes("multipart/form-data"))
    ) {
      SecurityLogger.log({
        type: "SUSPICIOUS_ACTIVITY",
        ip,
        details: `Invalid content type: ${contentType || "missing"}`,
      });
      return false;
    }
  }

  // Detectar patrones de ataque en URL
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /exec\(/i, // Command injection
  ];

  const url = request.nextUrl.pathname + request.nextUrl.search;
  if (suspiciousPatterns.some((pattern) => pattern.test(url))) {
    SecurityLogger.log({
      type: "SUSPICIOUS_ACTIVITY",
      ip,
      details: `Suspicious URL pattern detected: ${url}`,
    });
    return false;
  }

  return true;
}

export function logApiAccess(
  request: NextRequest,
  responseStatus: number
): void {
  const ip = getClientIP(request);
  const method = request.method;
  const url = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Log failed requests
  if (responseStatus >= 400) {
    SecurityLogger.log({
      type: "SUSPICIOUS_ACTIVITY",
      ip,
      userAgent,
      details: `${method} ${url} - Status: ${responseStatus}`,
    });
  }
}
