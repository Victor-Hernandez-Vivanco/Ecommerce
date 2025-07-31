'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthHandler } from '../hooks/useAuthHandler';
import ToastProvider from '../components/ToastProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { checkTokenValidity } = useAuthHandler();

  useEffect(() => {
    // No verificar en la página de login
    if (pathname === '/admin/login') return;

    const verifyAuth = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    };

    verifyAuth();

    // Verificar token cada 5 minutos
    const interval = setInterval(verifyAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [pathname, router, checkTokenValidity]);

  return (
    <>
      <ToastProvider />
      {children}
    </>
  );
}