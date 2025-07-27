'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './productos.module.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePricePer100g?: number;
  pricesByWeight?: Array<{
    weight: number;
    price: number;
    stock: number;
  }>;
  totalStock?: number;
  image: string;
  featured: boolean;
  discount: number;
  createdAt: string;
}

export default function ProductosAdmin() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const categories = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'Frutos Secos', name: 'Frutos Secos' },
    { id: 'Semillas', name: 'Semillas' },
    { id: 'Deshidratados', name: 'Deshidratados' },
    { id: 'Mixes', name: 'Mixes' },
    { id: 'Otros', name: 'Otros' }
  ];

  // ✅ FUNCIÓN HELPER PARA OBTENER PRECIO
  const getProductPrice = (product: Product) => {
    if (product.basePricePer100g) {
      return product.basePricePer100g;
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return Math.min(...product.pricesByWeight.map(p => p.price));
    }
    return 0;
  };

  // ✅ FUNCIÓN HELPER PARA OBTENER STOCK
  const getProductStock = (product: Product) => {
    if (product.totalStock !== undefined) {
      return product.totalStock;
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.reduce((total, p) => total + (p.stock || 0), 0);
    }
    return 0;
  };

  // ✅ CORREGIDO: Usar useCallback para fetchProducts
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const adminToken = localStorage.getItem('admin-token');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 403) {
        router.push('/admin/login');
      } else {
        setError('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [router]); // ✅ router como dependencia

  // ✅ CORREGIDO: Agregar fetchProducts a las dependencias
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFeatured = async (product: Product) => {
    try {
      const adminToken = localStorage.getItem('admin-token');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ featured: !product.featured })
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p._id === product._id ? { ...p, featured: !p.featured } : p
        ));
      } else {
        alert('Error al actualizar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const adminToken = localStorage.getItem('admin-token');
      if (!adminToken) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productToDelete._id));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        alert('Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/dashboard" className={styles.backBtn}>
              ← Volver al Dashboard
            </Link>
            <h1>📦 Gestión de Productos</h1>
          </div>
          <Link href="/admin/productos/crear" className={styles.createBtn}>
            ➕ Crear Producto
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorMessage}>
            <p>⚠️ {error}</p>
            <button onClick={fetchProducts} className={styles.retryBtn}>
              🔄 Reintentar
            </button>
          </div>
        )}

        {/* Filtros - Solo mostrar si hay productos */}
        {products.length > 0 && (
          <section className={styles.filtersSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Lista de productos */}
        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2>Productos ({filteredProducts.length})</h2>
          </div>
          
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>No hay productos aún</h3>
              <p>Comienza creando tu primer producto para la tienda.</p>
              <Link href="/admin/productos/crear" className={styles.createFirstBtn}>
                ➕ Crear primer producto
              </Link>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p>🔍 No se encontraron productos con los filtros aplicados</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className={styles.clearFiltersBtn}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map(product => (
                <div key={product._id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <div className={styles.imagePlaceholder}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={200}
                          height={150}
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="${styles.fallbackImage}">📦<br/>${product.name}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className={styles.fallbackImage}>
                          📦<br/>{product.name}
                        </div>
                      )}
                    </div>
                    
                    {product.featured && (
                      <div className={styles.featuredBadge}>⭐ Destacado</div>
                    )}
                    
                    {getProductStock(product) <= 5 && (
                      <div className={styles.lowStockBadge}>⚠️ Stock Bajo</div>
                    )}
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productCategory}>{product.category}</p>
                    {/* ✅ CORREGIDO: Usar función helper para precio */}
                    <p className={styles.productPrice}>
                      ${getProductPrice(product).toLocaleString()} CLP/100g
                    </p>
                    {/* ✅ CORREGIDO: Usar función helper para stock */}
                    <p className={styles.productStock}>
                      Stock: {getProductStock(product)}
                    </p>
                  </div>
                  
                  <div className={styles.productActions}>
                    <button
                      onClick={() => toggleFeatured(product)}
                      className={`${styles.actionBtn} ${product.featured ? styles.featured : styles.notFeatured}`}
                      title={product.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      {product.featured ? '⭐' : '☆'}
                    </button>
                    
                    <Link
                      href={`/admin/productos/editar/${product._id}`}
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      title="Editar producto"
                    >
                      ✏️
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && productToDelete && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>¿Eliminar producto?</h3>
            <p>¿Estás seguro de que quieres eliminar {productToDelete.name}?</p>
            <p className={styles.warning}>Esta acción no se puede deshacer.</p>
            
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className={styles.confirmDeleteBtn}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}