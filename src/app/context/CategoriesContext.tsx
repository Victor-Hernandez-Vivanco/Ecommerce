"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ICategory } from '@/models/Category';

interface CategoriesContextType {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  updateCategory: (id: string, data: Partial<ICategory>) => Promise<boolean>;
  createCategory: (data: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/categories');
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError(data.message || 'Error al cargar categorías');
      }
    } catch (err) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, data: Partial<ICategory>): Promise<boolean> => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCategories(); // Refrescar lista
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch  {
      setError('Error al actualizar categoría');
      return false;
    }
  };

  const createCategory = async (data: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCategories(); // Refrescar lista
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch {
      setError('Error al crear categoría');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchCategories(); // Refrescar lista
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch {
      setError('Error al eliminar categoría');
      return false;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
    updateCategory,
    createCategory,
    deleteCategory
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}