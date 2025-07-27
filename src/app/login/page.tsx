'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './login.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
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
      await login(formData.email, formData.password);
      router.push('/'); // Redirigir a la página principal
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h1>🔐 Iniciar Sesión</h1>
            <p>Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
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
              {loading ? '🔄 Iniciando sesión...' : '🚀 Iniciar Sesión'}
            </button>
          </form>

          <div className={styles.footer}>
            <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
            <link href="/" className={styles.backLink}>← Volver al inicio</link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}