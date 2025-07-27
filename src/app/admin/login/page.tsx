'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ✅ AGREGAR ESTE IMPORT
import styles from './admin-login.module.css';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login de admin...');
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      console.log('✅ Login de admin exitoso');
      
      // ✅ USAR localStorage:
      localStorage.setItem('admin-token', data.token);
      
      // ✅ Redirigir al dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('❌ Error en login de admin:', error);
      setError(error instanceof Error ? error.message : 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>🔐 Panel de Administración</h1>
          <p>Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email de Administrador</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@frutossecos.com"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          {error && (
            <div className={styles.error}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? '🔄 Verificando...' : '🚀 Acceder al Panel'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>⚠️ Solo personal autorizado</p>
          {/* ✅ CAMBIAR <link> por <Link> */}
          <Link href="/" className={styles.backLink}>
            ← Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}