'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    featuredProducts: 0,
    totalUsers: 0,
    lowStockProducts: 0
  });
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminToken = localStorage.getItem('admin-token');
        
        console.log('🔍 Verificando token admin:', adminToken ? 'Existe' : 'No existe');

        if (!adminToken) {
          console.log('❌ No hay token admin, redirigiendo...');
          router.push('/admin/login');
          return;
        }

        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          console.log('❌ Token inválido, redirigiendo...');
          localStorage.removeItem('admin-token');
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        setAdminData(data.admin);
        
        // Cargar estadísticas
        await loadStats();
      } catch (error) {
        console.error('❌ Error verificando admin:', error);
        localStorage.removeItem('admin-token');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    const loadStats = async () => {
      try {
        // Cargar productos
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const products = await productsResponse.json();
          const featured = products.filter((p: { featured: boolean }) => p.featured).length;
          const lowStock = products.filter((p: { stock: number }) => p.stock <= 5).length;
          
          setStats(prev => ({
            ...prev,
            totalProducts: products.length,
            featuredProducts: featured,
            lowStockProducts: lowStock
          }));
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    checkAdminAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🔐 Panel de Administración</h1>
          <div className={styles.adminInfo}>
            <span>👤 {adminData && typeof adminData === 'object' && 'name' in adminData ? (adminData as { name: string }).name : ''}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Estadísticas */}
        <section className={styles.statsSection}>
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
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statInfo}>
                <h3>{stats.lowStockProducts}</h3>
                <p>Stock Bajo</p>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalUsers}</h3>
                <p>Usuarios</p>
              </div>
            </div>
          </div>
        </section>

        {/* Acciones Rápidas */}
        <section className={styles.actionsSection}>
          <h2>🚀 Acciones Rápidas</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/productos" className={styles.actionCard}>
              <div className={styles.actionIcon}>📦</div>
              <h3>Gestionar Productos</h3>
              <p>Ver, crear, editar y eliminar productos</p>
            </Link>

            <Link href="/admin/productos/crear" className={styles.actionCard}>
              <div className={styles.actionIcon}>➕</div>
              <h3>Crear Producto</h3>
              <p>Agregar un nuevo producto al catálogo</p>
            </Link>

            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>👥</div>
              <h3>Gestionar Usuarios</h3>
              <p>Administrar cuentas de usuarios</p>
            </div>

            <div className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <h3>Reportes</h3>
              <p>Ver estadísticas y reportes</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}