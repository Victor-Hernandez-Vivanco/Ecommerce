'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AdminShortcut() {
  const router = useRouter();
  const { } = useAuth();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl + Shift + A para acceso de admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        router.push('/admin/login');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return null; // No renderiza nada
}