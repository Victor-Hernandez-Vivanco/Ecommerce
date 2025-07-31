"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

interface AuthError {
  status: number;
  message: string;
}

export const useAuthHandler = () => {
  const router = useRouter();

  const handleAuthError = useCallback(
    (error: AuthError) => {
      if (error.status === 403) {
        // Token expirado o inválido
        localStorage.removeItem("admin-token");

        toast.error("🔐 Tu sesión ha expirado. Serás redirigido al login.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "white",
            fontWeight: "bold",
            padding: "16px",
            borderRadius: "8px",
          },
        });

        // Guardar la página actual para redirección posterior
        const currentPath = window.location.pathname;
        if (currentPath !== "/admin/login") {
          localStorage.setItem("admin-redirect-after-login", currentPath);
        }

        // Redirección con delay para que el usuario vea el mensaje
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);

        return true; // Indica que se manejó el error de auth
      }
      return false; // No es un error de auth
    },
    [router]
  );

  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const adminToken = localStorage.getItem("admin-token");

      if (!adminToken) {
        handleAuthError({ status: 403, message: "No token found" });
        throw new Error("No authentication token");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 403) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Token expired" }));
        handleAuthError({ status: 403, message: errorData.message });
        throw new Error("Authentication failed");
      }

      return response;
    },
    [handleAuthError]
  );

  const checkTokenValidity = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem("admin-token");
      if (!adminToken) return false;

      const response = await fetch("/api/admin/verify-token", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 403) {
        handleAuthError({ status: 403, message: "Token expired" });
        return false;
      }

      return response.ok;
    } catch {
      return false;
    }
  }, [handleAuthError]);

  return {
    handleAuthError,
    makeAuthenticatedRequest,
    checkTokenValidity,
  };
};
