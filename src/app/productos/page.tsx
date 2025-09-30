'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import styles from './productos.module.css'

// ✅ INTERFAZ ACTUALIZADA PARA EL NUEVO MODELO
interface Product {
  _id: string
  name: string
  description: string
  category: string
  categories?: string[] // ✅ AGREGAR SOPORTE PARA MÚLTIPLES CATEGORÍAS
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

interface WeightOption {
  weight: number
  price: number
  stock: number
  label: string
}

export default function ProductosPage() {
  const router = useRouter()
  const { addToCart: addToCartContext } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [sortBy, setSortBy] = useState('precio: bajo a alto')
  const [showQuickView, setShowQuickView] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  // ✅ NUEVO: Estado para modal de descuento
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null)

  // ✅ CATEGORÍAS ACTUALIZADAS SEGÚN ESPECIFICACIÓN
  const categories = [
    'Todos',
    'Frutos Secos', 
    'Frutas Deshidratadas',
    'Despensa',
    'Semillas',
    'Mix',
    'Cereales',
    'Snack'
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

  // ✅ FUNCIÓN MODIFICADA PARA FILTRAR OPCIONES SIN STOCK
  const getWeightOptions = (product: Product): WeightOption[] => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight
        .filter(pw => pw.stock > 0) // ✅ FILTRAR SOLO OPCIONES CON STOCK
        .map(pw => ({
          weight: pw.weight,
          price: pw.price,
          stock: pw.stock,
          label: `${pw.weight}g`
        }))
    }
    return []
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

  // ✅ MEJORAR LÓGICA DE FILTRADO
  const filteredProducts = products.filter(product => {
    const productPrice = getProductPrice(product)
    
    // ✅ FILTRO DE CATEGORÍA MEJORADO - Incluir múltiples categorías
    const matchesCategory = selectedCategory === 'Todos' || 
                           product.category === selectedCategory ||
                           (product.categories && product.categories.includes(selectedCategory))
    
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // ✅ FILTRO DE PRECIO MÁS FLEXIBLE
    const matchesPrice = productPrice === 0 || (productPrice >= minPrice && productPrice <= maxPrice)
    
    return matchesCategory && matchesSearch && matchesPrice
  })

  // ✅ FUNCIÓN PARA ABRIR VISTA RÁPIDA MEJORADA
  const openQuickView = (product: Product) => {
    setQuickViewProduct(product)
    const weightOptions = getWeightOptions(product)
    if (weightOptions.length > 0) {
      // ✅ SELECCIONAR LA PRIMERA OPCIÓN CON STOCK DISPONIBLE
      setSelectedWeight(weightOptions[0])
    } else {
      // ✅ SI NO HAY OPCIONES CON STOCK, NO SELECCIONAR NINGUNA
      setSelectedWeight(null)
    }
    setQuantity(1)
    setShowQuickView(true)
  }

  const closeQuickView = () => {
    setShowQuickView(false)
    setQuickViewProduct(null)
    setSelectedWeight(null)
    setQuantity(1)
  }

  // ✅ FUNCIÓN MODIFICADA PARA REDIRIGIR A LA PÁGINA DEL PRODUCTO
  const goToProductPage = (product: Product) => {
    router.push(`/productos/${product._id}`)
  }

  // ✅ FUNCIÓN addToCart MEJORADA CON VALIDACIÓN DE STOCK
  const addToCart = (product: Product, weight?: WeightOption | undefined, qty: number = 1) => {
    if (!weight) {
      return
    }
    
    // ✅ VALIDAR QUE LA OPCIÓN TENGA STOCK SUFICIENTE
    if (weight.stock < qty) {
      alert(`Stock insuficiente. Solo hay ${weight.stock} unidades disponibles.`)
      return
    }
    
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: product.image || '/placeholder-product.jpg',
      weight: weight.weight,
      price: weight.price,
      quantity: qty,
      stock: weight.stock
    }
    
    // Usar el contexto para agregar al carrito
    addToCartContext(cartItem)
    
    // Mostrar mensaje de éxito y cerrar modal
    alert(`${product.name} agregado al carrito exitosamente`)
    closeQuickView()
  }

  const getCurrentPrice = () => {
    if (!selectedWeight || !quickViewProduct) return 0
    return selectedWeight.price
  }

  // ✅ NUEVA FUNCIÓN: Abrir modal de descuento
  const openDiscountModal = (product: Product) => {
    setDiscountProduct(product)
    setShowDiscountModal(true)
  }

  // ✅ NUEVA FUNCIÓN: Cerrar modal de descuento
  const closeDiscountModal = () => {
    setShowDiscountModal(false)
    setDiscountProduct(null)
  }

  // ✅ FUNCIÓN HELPER: Calcular precio con descuento
  const getDiscountedPrice = (product: Product) => {
    const originalPrice = getProductPrice(product)
    return Math.round(originalPrice * (1 - product.discount / 100))
  }

  // ✅ FUNCIÓN HELPER: Calcular ahorro
  const getSavings = (product: Product) => {
    const originalPrice = getProductPrice(product)
    const discountedPrice = getDiscountedPrice(product)
    return originalPrice - discountedPrice
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      
      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={styles.container}>
            <Link href="/">INICIO</Link>
            <span>/</span>
            <span>FRUTOS SECOS</span>
          </div>
        </div>

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
                  <h3 className={styles.sidebarTitle}>CATEGORÍAS DEL PRODUCTO</h3>
                  <div className={styles.categoryList}>
                    {categories.map(category => (
                      <div key={category} className={styles.categoryItem}>
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className={`${styles.categoryLink} ${
                            selectedCategory === category ? styles.active : ''
                          }`}
                        >
                          {category}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ✅ FILTRO POR PRECIO CON SLIDER CORREGIDO */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>FILTRAR POR PRECIO</h3>
                  <div className={styles.priceFilter}>
                    {/* Slider de rango dual */}
                    <div className={styles.priceSliderContainer}>
                      <div className={styles.sliderTrack}>
                        <div 
                          className={styles.sliderRange}
                          style={{
                            left: `${(minPrice / 50000) * 100}%`,
                            width: `${((maxPrice - minPrice) / 50000) * 100}%`
                          }}
                        ></div>
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          value={minPrice}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            if (value < maxPrice) {
                              setMinPrice(value)
                            }
                          }}
                          className={`${styles.rangeSlider} ${styles.rangeMin}`}
                        />
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          value={maxPrice}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            if (value > minPrice) {
                              setMaxPrice(value)
                            }
                          }}
                          className={`${styles.rangeSlider} ${styles.rangeMax}`}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.priceDisplay}>
                      Precio: ${minPrice.toLocaleString()} — ${maxPrice.toLocaleString()}
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
                ) : (
                  <>
                    {/* Header de resultados */}
                    <div className={styles.resultsHeader}>
                      <p className={styles.resultsCount}>
                        Mostrando los {filteredProducts.length} resultados
                      </p>
                      <div className={styles.sortContainer}>
                        <label>Ordenar por precio:</label>
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value)}
                          className={styles.sortSelect}
                        >
                          <option value="precio: bajo a alto">bajo a alto</option>
                          <option value="precio: alto a bajo">alto a bajo</option>
                        </select>
                      </div>
                    </div>
                    
                    {filteredProducts.length === 0 ? (
                      <div className={styles.noResults}>
                        <p>🔍 No se encontraron productos con los filtros aplicados</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('Todos')
                            setMinPrice(0)
                            setMaxPrice(50000)
                            loadProducts()
                          }}
                          className={styles.clearFiltersBtn}
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    ) : (
                      <div className={styles.productsGrid}>
                        {filteredProducts.map(product => (
                          <div 
                            key={product._id} 
                            className={styles.productCard}
                          >
                            <div className={styles.productImageContainer}>
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
                              
                              {/* Overlay de vista rápida */}
                              <div className={styles.productOverlay}>
                                <button 
                                  className={styles.quickViewBtn}
                                  onClick={() => openQuickView(product)}
                                >
                                  VISTA RÁPIDA
                                </button>
                              </div>
                              
                              {/* ✅ BADGES REORGANIZADOS */}
                              {product.featured && (
                                <div className={styles.featuredBadge}>¡Destacado!</div>
                              )}
                              
                              {/* ✅ NUEVO: Badge de descuento */}
                              {product.discount > 0 && (
                                <div 
                                  className={styles.discountBadge}
                                  onClick={() => openDiscountModal(product)}
                                >
                                  -{product.discount}%
                                </div>
                              )}
                            </div>
                            
                            <div className={styles.productInfo}>
                              <p className={styles.productCategory}>{product.category}</p>
                              <h3 className={styles.productName}>{product.name}</h3>
                              <div className={styles.priceContainer}>
                                {/* ✅ PRECIO MODIFICADO PARA MOSTRAR DESCUENTO */}
                                {product.discount > 0 ? (
                                  <>
                                    <span className={styles.price}>
                                      ${getDiscountedPrice(product).toLocaleString()}
                                    </span>
                                    <span className={styles.originalPrice}>
                                      ${getProductPrice(product).toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className={styles.price}>
                                    ${getProductPrice(product).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              <div className={styles.productActions}>
                                <button
                                  onClick={() => openQuickView(product)}
                                  className={styles.selectOptionsBtn}
                                >
                                  SELECCIONAR OPCIONES
                                </button>
                                
                                {/* ✅ BOTÓN MODIFICADO PARA REDIRIGIR A LA PÁGINA DEL PRODUCTO */}
                                <button
                                  onClick={() => goToProductPage(product)}
                                  className={styles.addToCartBtn}
                                  disabled={getProductStock(product) === 0}
                                >
                                  VER PRODUCTO
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Modal de Vista Rápida */}
      {showQuickView && quickViewProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.quickViewModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeQuickView}>
              ×
            </button>
            
            <div className={styles.modalContent}>
              <div className={styles.modalImage}>
                <Image
                  src={quickViewProduct.image || '/placeholder-product.jpg'}
                  alt={quickViewProduct.name}
                  width={400}
                  height={300}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              
              <div className={styles.modalInfo}>
                <h2 className={styles.modalTitle}>{quickViewProduct.name}</h2>
                <div className={styles.modalPrice}>
                  ${getCurrentPrice().toLocaleString('es-CL')}
                  {selectedWeight && (
                    <span className={styles.weightInfo}> / {selectedWeight.label}</span>
                  )}
                </div>
                
                <p className={styles.modalDescription}>{quickViewProduct.description}</p>
                
                <div className={styles.modalCategory}>
                  <strong>Categoría:</strong> {quickViewProduct.category}
                </div>
                
                {/* Selector de peso mejorado */}
                {getWeightOptions(quickViewProduct).length > 0 ? (
                  <div className={styles.weightSelector}>
                    <label>Elige una opción:</label>
                    <select 
                      value={selectedWeight?.weight || ''}
                      onChange={(e) => {
                        const weight = parseInt(e.target.value)
                        const option = getWeightOptions(quickViewProduct).find(w => w.weight === weight)
                        setSelectedWeight(option || null)
                      }}
                      className={styles.weightSelect}
                    >
                      {getWeightOptions(quickViewProduct).map((option) => (
                        <option key={option.weight} value={option.weight}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className={styles.noStockMessage}>
                    <p>⚠️ Producto sin stock disponible</p>
                  </div>
                )}
                
                {/* Selector de cantidad mejorado */}
                {selectedWeight && (
                  <div className={styles.quantitySelector}>
                    <label>Cantidad:</label>
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={styles.quantityBtn}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(selectedWeight.stock, quantity + 1))}
                        className={styles.quantityBtn}
                        disabled={quantity >= selectedWeight.stock}
                      >
                        +
                      </button>
                    </div>
                    <small>Stock disponible: {selectedWeight.stock}</small>
                  </div>
                )}
                
                <button 
                  onClick={() => addToCart(quickViewProduct, selectedWeight || undefined, quantity)}
                  className={styles.modalAddToCartBtn}
                  disabled={!selectedWeight || selectedWeight.stock === 0}
                >
                  {selectedWeight && selectedWeight.stock > 0 ? 'AÑADIR AL CARRITO' : 'SIN STOCK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ NUEVO: Modal de Descuento */}
      {showDiscountModal && discountProduct && (
        <div className={styles.modalOverlay} onClick={closeDiscountModal}>
          <div className={styles.discountModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDiscountModal}>
              ×
            </button>
            
            <div className={styles.discountModalContent}>
              <div className={styles.discountIcon}>
                🎉
              </div>
              
              <h2 className={styles.discountTitle}>¡Oferta Especial!</h2>
              
              <div className={styles.discountInfo}>
                <h3 className={styles.discountProductName}>{discountProduct.name}</h3>
                
                <div className={styles.discountDetails}>
                  <div className={styles.discountPercentage}>
                    {discountProduct.discount}% OFF
                  </div>
                  
                  <div className={styles.priceComparison}>
                    <div className={styles.discountedPriceDisplay}>
                      <span className={styles.newPrice}>
                        ${getDiscountedPrice(discountProduct).toLocaleString()}
                      </span>
                      <span className={styles.oldPrice}>
                        ${getProductPrice(discountProduct).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className={styles.savings}>
                      ¡Ahorras ${getSavings(discountProduct).toLocaleString()}!
                    </div>
                  </div>
                  
                  <div className={styles.discountActions}>
                    <button
                      onClick={() => {
                        closeDiscountModal()
                        openQuickView(discountProduct)
                      }}
                      className={styles.discountSelectBtn}
                    >
                      SELECCIONAR OPCIONES
                    </button>
                    
                    <button
                      onClick={() => {
                        closeDiscountModal()
                        goToProductPage(discountProduct)
                      }}
                      className={styles.discountViewBtn}
                    >
                      VER PRODUCTO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}