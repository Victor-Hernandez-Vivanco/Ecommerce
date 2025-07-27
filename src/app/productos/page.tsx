'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './productos.module.css'

// ✅ INTERFAZ ACTUALIZADA PARA EL NUEVO MODELO
interface Product {
  _id: string
  name: string
  description: string
  category: string
  basePricePer100g?: number
  pricesByWeight?: Array<{
    weight: number
    price: number
    stock: number
  }>
  totalStock?: number
  image: string
  featured: boolean
  discount: number
  createdAt: string
}

export default function ProductosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState([0, 50000])

  const categories = [
    { id: 'all', name: 'Todos los Productos' },
    { id: 'Frutos Secos', name: 'Frutos Secos' },
    { id: 'Mixes', name: 'Mixes' },
    { id: 'Semillas', name: 'Semillas' },
    { id: 'Deshidratados', name: 'Deshidratados' },
    { id: 'Otros', name: 'Otros' }
  ]

  // ✅ FUNCIONES HELPER PARA OBTENER PRECIO Y STOCK
  const getProductPrice = (product: Product) => {
    if (product.basePricePer100g) {
      return product.basePricePer100g
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return Math.min(...product.pricesByWeight.map(p => p.price))
    }
    return 0
  }

  const getProductStock = (product: Product) => {
    if (product.totalStock !== undefined) {
      return product.totalStock
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.reduce((total, p) => total + (p.stock || 0), 0)
    }
    return 0
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/products')
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data || [])
      } else {
        throw new Error('Error al cargar productos')
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      setError('Error al cargar los productos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const productPrice = getProductPrice(product)
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1]
    return matchesCategory && matchesSearch && matchesPrice
  })

  const addToCart = (product: Product) => {
    console.log('Agregado al carrito:', product)
    alert(`${product.name} agregado al carrito`)
  }

  const navigateToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Header de la página */}
        <section className={styles.pageHeader}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>Nuestros Productos</h1>
            <p className={styles.pageSubtitle}>
              Descubre nuestra amplia selección de frutos secos premium, 
              cuidadosamente seleccionados para ofrecerte la mejor calidad.
            </p>
          </div>
        </section>

        {/* Contenido principal */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            <div className={styles.contentGrid}>
              {/* Sidebar izquierdo */}
              <aside className={styles.sidebar}>
                {/* Buscador */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>BUSCA TU PRODUCTO</h3>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Buscar"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                    <button className={styles.searchBtn}>
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>

                {/* Filtro por categoría */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>CATEGORÍAS</h3>
                  <div className={styles.categoryList}>
                    {categories.map(category => (
                      <label key={category.id} className={styles.categoryItem}>
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filtro por precio */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>PRECIO</h3>
                  <div className={styles.priceFilter}>
                    <div className={styles.priceInputs}>
                      <input
                        type="number"
                        placeholder="Mín"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className={styles.priceInput}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                        className={styles.priceInput}
                      />
                    </div>
                    <button className={styles.filterBtn} onClick={loadProducts}>
                      FILTRAR
                    </button>
                  </div>
                </div>
              </aside>

              {/* Área principal de productos */}
              <div className={styles.productsArea}>
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando productos...</p>
                  </div>
                ) : error ? (
                  <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>❌ {error}</p>
                    <button onClick={loadProducts} className={styles.retryBtn}>
                      🔄 Reintentar
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <h3>No hay productos disponibles</h3>
                    <p>Aún no se han agregado productos a la tienda.</p>
                    <Link href="/" className={styles.backHomeBtn}>
                      Volver al inicio
                    </Link>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className={styles.noResults}>
                    <p>🔍 No se encontraron productos con los filtros aplicados</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                        setPriceRange([0, 50000])
                      }}
                      className={styles.clearFiltersBtn}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.resultsInfo}>
                      <p>{filteredProducts.length} productos encontrados</p>
                    </div>
                    
                    <div className={styles.productsGrid}>
                      {filteredProducts.map(product => (
                        <div key={product._id} className={styles.productCard}>
                          <div className={styles.productImage}>
                            {/* ✅ CORREGIDO: Cambiar <image> por <Image> de Next.js */}
                            <Image
                              src={product.image || '/placeholder-product.jpg'}
                              alt={product.name}
                              width={300}
                              height={200}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-product.jpg'
                              }}
                            />
                            
                            {product.featured && (
                              <div className={styles.featuredBadge}>⭐ Destacado</div>
                            )}
                            
                            {product.discount && product.discount > 0 && (
                              <div className={styles.discountBadge}>-{product.discount}%</div>
                            )}
                            
                            {getProductStock(product) <= 5 && getProductStock(product) > 0 && (
                              <div className={styles.lowStockBadge}>⚠️ Últimas unidades</div>
                            )}
                            
                            {getProductStock(product) === 0 && (
                              <div className={styles.outOfStockBadge}>Agotado</div>
                            )}
                          </div>
                          
                          <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productDescription}>{product.description}</p>
                            <div className={styles.productFooter}>
                              <div className={styles.priceContainer}>
                                {/* ✅ CORREGIDO: Usar función helper para precio */}
                                {product.discount && product.discount > 0 ? (
                                  <>
                                    <span className={styles.originalPrice}>
                                      ${getProductPrice(product).toLocaleString()}
                                    </span>
                                    <span className={styles.discountPrice}>
                                      ${Math.round(getProductPrice(product) * (1 - product.discount / 100)).toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className={styles.price}>
                                    ${getProductPrice(product).toLocaleString()} CLP/100g
                                  </span>
                                )}
                              </div>
                              
                              <div className={styles.productActions}>
                                <button
                                  onClick={() => navigateToProduct(product._id)}
                                  className={styles.viewBtn}
                                >
                                  <i className="fas fa-eye"></i>
                                  Ver
                                </button>
                                
                                <button
                                  onClick={() => addToCart(product)}
                                  className={styles.addToCartBtn}
                                  disabled={getProductStock(product) === 0}
                                >
                                  <i className="fas fa-shopping-cart"></i>
                                  {getProductStock(product) === 0 ? 'Agotado' : 'Agregar'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}