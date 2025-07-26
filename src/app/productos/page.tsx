'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './productos.module.css'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

export default function ProductosPage() {
  const router = useRouter() // ← Esta línea falta
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState([0, 50000])

  const categories = [
    { id: 'all', name: 'Todos los Productos' },
    { id: 'cereales', name: 'Cereales' },
    { id: 'frutos-deshidratados', name: 'Frutos Deshidratados' },
    { id: 'frutos-secos', name: 'Frutos Secos' },
    { id: 'gourmet', name: 'Gourmet' },
    { id: 'harinas-legumbres', name: 'Harinas & Legumbres' },
    { id: 'helados-riwun', name: 'Helados RIWÜN' },
    { id: 'market', name: 'Market' },
    { id: 'ofertas', name: 'Ofertas' },
    { id: 'semillas', name: 'Semillas' },
    { id: 'riwun-al-frasco', name: 'Riwün al Frasco' }
  ]

  // Productos de ejemplo
  const sampleProducts: Product[] = [
    {
      _id: '1',
      name: 'Coco rallado natural',
      description: 'Coco rallado 100% natural, perfecto para repostería',
      price: 7890, // Sin decimales para mejor manejo
      image: '/images/coco-rallado.jpg',
      category: 'frutos-deshidratados',
      stock: 15
    },
    {
      _id: '2',
      name: 'Mix cosavi',
      description: 'Mezcla especial de frutos secos y semillas',
      price: 10990,
      image: '/images/mix-cosavi.jpg',
      category: 'frutos-secos',
      stock: 8
    },
    {
      _id: '3',
      name: 'Mantequilla maní Riwün 250g',
      description: 'Mantequilla de maní natural sin aditivos',
      price: 3900,
      image: '/images/mantequilla-mani.jpg',
      category: 'riwun-al-frasco',
      stock: 12
    },
    {
      _id: '4',
      name: 'Maní tostado',
      description: 'Maní tostado con sal, ideal para snacks',
      price: 5490,
      image: '/images/mani-tostado.jpg',
      category: 'frutos-secos',
      stock: 20
    },
    {
      _id: '5',
      name: 'Nuez partida clara',
      description: 'Nueces partidas de primera calidad',
      price: 11990,
      image: '/images/nuez-partida.jpg',
      category: 'frutos-secos',
      stock: 6
    },
    {
      _id: '6',
      name: 'Coco chips natural',
      description: 'Chips de coco natural deshidratado',
      price: 11990,
      image: '/images/coco-chips.jpg',
      category: 'frutos-deshidratados',
      stock: 10
    },
    {
      _id: '7',
      name: 'Mix frutos morenos',
      description: 'Mezcla premium de frutos secos morenos',
      price: 8990,
      image: '/images/mix-morenos.jpg',
      category: 'frutos-secos',
      stock: 4
    },
    {
      _id: '8',
      name: 'Mix frutos rubios',
      description: 'Selección especial de frutos secos rubios',
      price: 10990,
      image: '/images/mix-rubios.jpg',
      category: 'frutos-secos',
      stock: 7
    }
  ]

  useEffect(() => {
    // Simular carga de productos
    const loadProducts = async () => {
      setLoading(true)
      try {
        // Intentar cargar desde API
        const response = await fetch('http://localhost:5000/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.length > 0 ? data : sampleProducts)
        } else {
          // Si falla la API, usar productos de ejemplo
          setProducts(sampleProducts)
        }
      } catch (error) {
        console.log('API no disponible, usando productos de ejemplo')
        setProducts(sampleProducts)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
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

        {/* Contenido principal con sidebar */}
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

                {/* Categorías */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>CATEGORÍAS DEL PRODUCTO</h3>
                  <ul className={styles.categoryList}>
                    {categories.map(category => (
                      <li key={category.id}>
                        <button
                          onClick={() => setSelectedCategory(category.id)}
                          className={`${styles.categoryLink} ${
                            selectedCategory === category.id ? styles.active : ''
                          }`}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Filtro de precio */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>FILTRAR POR PRECIO</h3>
                  <div className={styles.priceFilter}>
                    <div className={styles.priceRange}>
                      <input
                        type="range"
                        min="0"
                        max="15000" // Ajustado a precios reales
                        step="500" // Agregado step para mejor control
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className={styles.rangeSlider}
                      />
                    </div>
                    <div className={styles.priceDisplay}>
                      <span>Precio: ${priceRange[0].toLocaleString('es-CL')} — ${priceRange[1].toLocaleString('es-CL')}</span>
                    </div>
                    <button 
                      className={styles.filterBtn}
                      onClick={() => {
                        // Forzar re-render del filtro
                        console.log('Filtro aplicado:', priceRange)
                      }}
                    >
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
                ) : (
                  <>
                    <div className={styles.resultsInfo}>
                      <p>{filteredProducts.length} productos encontrados</p>
                    </div>
                    
                    <div className={styles.productsGrid}>
                      {filteredProducts.map(product => (
                        <div key={product._id} className={styles.productCard}>
                          <div className={styles.productImage}>
                            <img 
                              src={product.image || '/placeholder-product.jpg'} 
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.jpg'
                              }}
                            />
                            <div className={styles.productOverlay}>
                              <button 
                                className={styles.quickViewBtn}
                                onClick={() => navigateToProduct(product._id)}
                              >
                                <i className="fas fa-eye"></i>
                                Ver Producto
                              </button>
                            </div>
                          </div>
                          
                          <div className={styles.productInfo}>
                            <Link href={`/productos/${product._id}`} className={styles.productLink}>
                              <h3 className={styles.productName}>{product.name}</h3>
                            </Link>
                            <div className={styles.productPrice}>
                              ${product.price.toLocaleString('es-CL')}
                            </div>
                            
                            <button 
                              className={styles.addToCartBtn}
                              onClick={() => navigateToProduct(product._id)}
                              disabled={product.stock === 0}
                            >
                              {product.stock === 0 ? (
                                'AGOTADO'
                              ) : (
                                'SELECCIONAR OPCIONES'
                              )}
                            </button>
                            
                            {product.stock > 0 && product.stock <= 5 && (
                              <div className={styles.lowStock}>
                                <i className="fas fa-exclamation-triangle"></i>
                                ¡Últimas {product.stock} unidades!
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredProducts.length === 0 && (
                      <div className={styles.noResults}>
                        <i className="fas fa-search"></i>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta con otros términos de búsqueda o categorías.</p>
                      </div>
                    )}
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