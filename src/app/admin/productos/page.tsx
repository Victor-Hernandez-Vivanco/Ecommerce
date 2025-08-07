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
  categories?: string[];
  basePricePer100g?: number;
  pricePerKilo?: number;
  pricesByWeight?: Array<{
    weight: number;
    price: number;
    stock: number;
  }>;
  totalStock?: number;
  images?: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  image?: string;
  featured: boolean;
  isAdvertisement?: boolean;
  isMainCarousel?: boolean;
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
    { id: 'Frutas Deshidratadas', name: 'Frutas Deshidratadas' },
    { id: 'Despensa', name: 'Despensa' },
    { id: 'Semillas', name: 'Semillas' },
    { id: 'Mix', name: 'Mix' },
    { id: 'Cereales', name: 'Cereales' },
    { id: 'Snack', name: 'Snack' },
    { id: 'Full', name: 'Full' },
    { id: 'Box', name: 'Box' }
  ];

  // ✅ FUNCIÓN HELPER PARA OBTENER IMAGEN PRINCIPAL
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary);
      return primaryImage ? primaryImage.url : product.images[0].url;
    }
    return product.image || '';
  };

  // ✅ FUNCIÓN HELPER PARA OBTENER PRECIO
  const getProductPrice = (product: Product) => {
    if (product.pricePerKilo) {
      return `$${product.pricePerKilo.toLocaleString()}/kg`;
    }
    if (product.basePricePer100g) {
      return `$${product.basePricePer100g.toLocaleString()}/100g`;
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      const minPrice = Math.min(...product.pricesByWeight.map(p => p.price));
      return `Desde $${minPrice.toLocaleString()}`;
    }
    return 'Sin precio';
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

  // ✅ FUNCIÓN HELPER PARA OBTENER CATEGORÍAS
  const getProductCategories = (product: Product) => {
    if (product.categories && product.categories.length > 0) {
      return product.categories.join(', ');
    }
    return product.category || 'Sin categoría';
  };

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
  }, [router]);

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
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory ||
      (product.categories && product.categories.includes(selectedCategory));
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
            
          </div>
          <div><h1>Gestión de Productos</h1></div>
          <Link href="/admin/productos/crear" className={styles.createBtn}>
          Crear Producto
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

        {/* Filtros */}
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

        {/* ✅ NUEVA VISTA DE LISTA */}
        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2>Productos ({filteredProducts.length})</h2>
          </div>
          
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No hay productos aún</h3>
              <p>Comienza creando tu primer producto para la tienda.</p>
              <Link href="/admin/productos/crear" className={styles.createFirstBtn}>
               Crear primer producto
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
            <div className={styles.productsList}>
              {/* ✅ ENCABEZADO DE LA TABLA REORGANIZADO */}
              <div className={styles.listHeader}>
                <div className={styles.headerCell}>Imagen</div>
                <div className={styles.headerCell}>ID</div>
                <div className={styles.headerCell}>Producto</div>
                <div className={styles.headerCell}>Descripción</div>
                <div className={styles.headerCell}>Categorías</div>
                <div className={styles.headerCell}>Precio</div>
                <div className={styles.headerCell}>Stock</div>
                <div className={styles.headerCell}>Estado</div>
                <div className={styles.headerCell}>Acciones</div>
              </div>

              {/* ✅ FILAS DE PRODUCTOS REORGANIZADAS */}
              {filteredProducts.map(product => {
                const stock = getProductStock(product);
                const isLowStock = stock <= 5;
                const isOutOfStock = stock === 0;

                return (
                  <div key={product._id} className={styles.listRow}>
                    {/* Imagen */}
                    <div className={styles.listCell}>
                      <div className={styles.productImageSmall}>
                        {getProductImage(product) ? (
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="${styles.fallbackImageSmall}">📦</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className={styles.fallbackImageSmall}>📦</div>
                        )}
                      </div>
                    </div>

                    {/* ID */}
                    <div className={styles.listCell}>
                      <div className={styles.productId}>
                        <span className={styles.idText}>ID: {product._id.slice(-8)}</span>
                      </div>
                    </div>

                    {/* Nombre del producto */}
                    <div className={styles.listCell}>
                      <div className={styles.productName}>
                        <h3 className={styles.productNameList}>{product.name}</h3>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className={styles.listCell}>
                      <div className={styles.productDescription}>
                        <p className={styles.descriptionText}>
                          {product.description.length > 60 
                            ? `${product.description.substring(0, 60)}...` 
                            : product.description
                          }
                        </p>
                      </div>
                    </div>

                    {/* Categorías */}
                    <div className={styles.listCell}>
                      <div className={styles.categoriesList}>
                        {getProductCategories(product)}
                      </div>
                    </div>

                    {/* Precio */}
                    <div className={styles.listCell}>
                      <div className={styles.priceInfo}>
                        {getProductPrice(product)}
                        {product.discount > 0 && (
                          <span className={styles.discountBadge}>-{product.discount}%</span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <div className={styles.listCell}>
                      <div className={`${styles.stockInfo} ${
                        isOutOfStock ? styles.outOfStock : 
                        isLowStock ? styles.lowStock : styles.inStock
                      }`}>
                        {stock} unidades
                      </div>
                    </div>

                    {/* Estado */}
                    <div className={styles.listCell}>
                      <div className={styles.statusBadges}>
                        {product.featured && (
                          <span className={styles.featuredBadgeList}>Destacado</span>
                        )}
                        {product.isAdvertisement && (
                          <span className={styles.adBadge}>Publicidad</span>
                        )}
                        {product.isMainCarousel && (
                          <span className={styles.carouselBadge}>Carrusel</span>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <span className={styles.lowStockBadgeList}>Stock Bajo</span>
                        )}
                        {isOutOfStock && (
                          <span className={styles.outOfStockBadge}>Agotado</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className={styles.listCell}>
                      <div className={styles.actionsList}>
                        {/* <button
                          onClick={() => toggleFeatured(product)}
                          className={`${styles.actionBtn} ${
                            product.featured ? styles.featured : styles.notFeatured
                          }`}
                          title={product.featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                        >
                          ⭐
                        </button> */}
                        
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
                  </div>
                );
              })}
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