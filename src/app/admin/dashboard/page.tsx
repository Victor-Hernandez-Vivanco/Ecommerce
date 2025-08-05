"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

// Interfaz para el tipo de admin
interface AdminData {
  username: string;
  email?: string;
  role: string;
}

// Interfaz para estadísticas
interface StatsData {
  totalProducts: number;
  featuredProducts: number;
  totalUsers: number;
  lowStockProducts: number;
  totalAdvertisements: number;
  activeAdvertisements: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    featuredProducts: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalAdvertisements: 0,
    activeAdvertisements: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminToken = localStorage.getItem("admin-token");

        console.log(
          "🔍 Verificando token admin:",
          adminToken ? "Existe" : "No existe"
        );

        if (!adminToken) {
          console.log("❌ No hay token admin, redirigiendo...");
          router.push("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/verify", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (!response.ok) {
          console.log("❌ Token inválido, redirigiendo...");
          localStorage.removeItem("admin-token");
          router.push("/admin/login");
          return;
        }

        const data = await response.json();
        setAdminData(data.admin);

        // Cargar estadísticas
        await loadStats();
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>Panel de Administración</h1>
            <p>Gestiona tu tienda de frutos secos</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.adminInfo}>
              <div className={styles.adminProfile}>
                <div className={styles.adminAvatar}>
                  <span>👤</span>
                </div>
                <div className={styles.adminDetails}>
                  <span className={styles.adminName}>
                    {adminData?.username || "Administrador"}
                  </span>
                  <span className={styles.adminRole}>Admin</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Cerrar Sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Estadísticas */}
        {/* <section className={styles.statsSection}>
          <h2>Estadísticas</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalProducts}</h3>
                <p>Total Productos</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statInfo}>
                <h3>{stats.featuredProducts}</h3>
                <p>Productos Destacados</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎨</div>
              <div className={styles.statInfo}>
                <h3>{stats.activeAdvertisements}</h3>
                <p>Publicidades Activas</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statInfo}>
                <h3>{stats.lowStockProducts}</h3>
                <p>Stock Bajo</p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Acciones Principales */}
        <section className={styles.actionsSection}>
          <h2>Gestión Principal</h2>
          <div className={styles.actionsGrid}>
            <Link
              href="/admin/productos"
              className={`${styles.actionCard} ${styles.primaryAction}`}
            >
              <div className={styles.actionHeader}>
                <span className={styles.actionBadge}>Principal</span>
              </div>
              <h3>Gestionar Productos</h3>
              <p>Administra tu catálogo completo:</p>
              <div className={styles.actionFeatures}>
                <span>✓ Crear productos</span>
                <span>✓ Editar existentes</span>
                <span>✓ Control de stock</span>
              </div>
            </Link>

            <Link
              href="/admin/carrusel"
              className={`${styles.actionCard} ${styles.primaryAction}`}
            >
              <div className={styles.actionHeader}>
                <span className={styles.actionBadge}>Nuevo</span>
              </div>
              <h3>Gestionar Carrusel</h3>
              <p>Administra las publicidades del carrusel:</p>
              <div className={styles.actionFeatures}>
                <span>✓ Crear publicidades</span>
                <span>✓ Subir imágenes/URLs</span>
                <span>✓ Activar/Desactivar</span>
              </div>
            </Link>

            <div className={`${styles.actionCard} ${styles.secondaryAction}`}>
              <div className={styles.actionHeader}>
                <span className={styles.actionBadge}>Próximamente</span>
              </div>
              <h3>Gestionar Usuarios</h3>
              <p>Administra cuentas de usuarios y permisos del sistema</p>
              <div className={styles.actionFeatures}>
                <span>✓ Ver usuarios</span>
                <span>✓ Gestionar permisos</span>
                <span>✓ Actividad</span>
              </div>
            </div>

            <div className={`${styles.actionCard} ${styles.secondaryAction}`}>
              <div className={styles.actionHeader}>
                <span className={styles.actionBadge}>Próximamente</span>
              </div>
              <h3>Reportes y Análisis</h3>
              <p>Visualiza estadísticas detalladas y reportes de ventas</p>
              <div className={styles.actionFeatures}>
                <span>✓ Ventas por período</span>
                <span>✓ Productos populares</span>
                <span>✓ Análisis de stock</span>
              </div>
            </div>

            <Link
              href="/admin/categorias"
              className={`${styles.actionCard} ${styles.primaryAction}`}
            >
              <div className={styles.actionHeader}>
                <span className={styles.actionBadge}>Nuevo</span>
              </div>
              <h3>Gestionar Categorías</h3>
              <p>Administra las imágenes de las categorías:</p>
              <div className={styles.actionFeatures}>
                <span>✓ Subir imágenes</span>
                <span>✓ Gestionar colores</span>
                <span>✓ Vista previa</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Acciones Rápidas */}
        {/* <section className={styles.quickActionsSection}>
          <h2>Acciones Rápidas</h2>
          <div className={styles.quickActionsGrid}>
            <Link href="/admin/productos/crear" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>➕</div>
              <span>Crear Producto</span>
            </Link>
            
            <Link href="/admin/carrusel/crear" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>🎨</div>
              <span>Crear Publicidad</span>
            </Link>
            
            <Link href="/admin/productos" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>📋</div>
              <span>Ver Inventario</span>
            </Link>
            
            <Link href="/admin/carrusel" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>🖼️</div>
              <span>Ver Carrusel</span>
            </Link>
            
            <Link href="/admin/categorias" className={styles.quickAction}>
              <div className={styles.quickActionIcon}>🏷️</div>
              <span>Gestionar Categorías</span>
            </Link>
          </div>
        </section> */}
      </main>
    </div>
  );
}
