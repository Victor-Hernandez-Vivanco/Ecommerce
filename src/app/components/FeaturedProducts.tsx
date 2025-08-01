'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/CartContext'
import styles from './FeaturedProducts.module.css'

interface Product {
  _id: string
  name: string
  description: string
  basePricePer100g?: number
  pricesByWeight?: Array<{
    weight: number
    price: number
    stock: number
  }>
  totalStock?: number
  image: string
  category: string
  featured: boolean
  discount: number
}

interface WeightOption {
  weight: number
  price: number
  stock: number
  label: string
}

export default function FeaturedProducts() {
  const router = useRouter()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estados para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  
  // Estados para modal
  const [showQuickView, setShowQuickView] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Configuración del carrusel
  const SLIDES_TO_SHOW = {
    desktop: 3,
    tablet: 2,
    mobile: 1
  }
  const AUTO_PLAY_INTERVAL = 4000

  // Función para obtener cuántos slides mostrar según el viewport (usando useCallback)
  const getSlidesToShow = useCallback(() => {
    if (typeof window === 'undefined') return SLIDES_TO_SHOW.desktop
    
    if (window.innerWidth <= 480) return SLIDES_TO_SHOW.mobile
    if (window.innerWidth <= 768) return SLIDES_TO_SHOW.tablet
    return SLIDES_TO_SHOW.desktop
  }, [SLIDES_TO_SHOW.desktop, SLIDES_TO_SHOW.mobile, SLIDES_TO_SHOW.tablet])

  const [slidesToShow, setSlidesToShow] = useState(SLIDES_TO_SHOW.desktop)

  // Manejar resize de ventana
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow())
    }

    handleResize() // Llamar inmediatamente
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getSlidesToShow])

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying || products.length <= slidesToShow) return

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        const maxSlide = Math.max(0, products.length - slidesToShow)
        return prev >= maxSlide ? 0 : prev + 1
      })
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, products.length, slidesToShow])

  // Funciones de navegación del carrusel
  const goToSlide = (slideIndex: number) => {
    const maxSlide = Math.max(0, products.length - slidesToShow)
    setCurrentSlide(Math.min(slideIndex, maxSlide))
    setIsAutoPlaying(false)
    
    // Reanudar auto-play después de 5 segundos
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const nextSlide = () => {
    const maxSlide = Math.max(0, products.length - slidesToShow)
    const nextIndex = currentSlide >= maxSlide ? 0 : currentSlide + 1
    goToSlide(nextIndex)
  }

  const prevSlide = () => {
    const maxSlide = Math.max(0, products.length - slidesToShow)
    const prevIndex = currentSlide <= 0 ? maxSlide : currentSlide - 1
    goToSlide(prevIndex)
  }

  // Pausar/reanudar auto-play
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  const getWeightOptions = (product: Product): WeightOption[] => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight
        .filter(option => option.stock > 0)
        .map(option => ({
          ...option,
          label: `${option.weight}g`
        }))
    }
    return []
  }

  const getCurrentPrice = () => {
    if (!selectedWeight) return 0
    return selectedWeight.price
  }

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product)
    const weightOptions = getWeightOptions(product)
    if (weightOptions.length > 0) {
      setSelectedWeight(weightOptions[0])
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

  const addToCartFromModal = (product: Product, weightOption?: WeightOption, qty: number = 1) => {
    if (!weightOption) {
      alert('Por favor selecciona un peso')
      return
    }

    if (qty > weightOption.stock) {
      alert(`Solo hay ${weightOption.stock} unidades disponibles`)
      return
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: weightOption.price,
      weight: weightOption.weight,
      quantity: qty,
      image: product.image,
      stock: weightOption.stock
    }

    addToCart(cartItem)
    alert(`${qty} x ${product.name} (${weightOption.weight}g) agregado al carrito`)
    closeQuickView()
  }

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

  const goToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')
        
        const response = await fetch('/api/products/featured')
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✅ Productos destacados cargados:', data.length)
        
        if (data.length === 0) {
          console.log('⚠️ No hay productos destacados, cargando productos generales...')
          const allProductsResponse = await fetch('/api/products')
          
          if (allProductsResponse.ok) {
            const allProducts = await allProductsResponse.json()
            setProducts(allProducts.slice(0, 8)) // Más productos para el carrusel
          } else {
            setError('No se pudieron cargar los productos')
          }
        } else {
          setProducts(data)
        }
        
      } catch (error) {
        console.error('❌ Error cargando productos destacados:', error)
        setError('Error al cargar productos destacados')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        {/* <h2 className={styles.title}>Productos Destacados</h2>
        <p className={styles.subtitle}>Descubre nuestra selección premium de frutos secos</p> */}
        
        {/* Carrusel de productos */}
        <div 
          className={styles.carouselContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Botones de navegación */}
          {products.length > slidesToShow && (
            <>
              <button 
                className={`${styles.carouselBtn} ${styles.prevBtn}`}
                onClick={prevSlide}
                aria-label="Producto anterior"
              >
                ‹
              </button>
              <button 
                className={`${styles.carouselBtn} ${styles.nextBtn}`}
                onClick={nextSlide}
                aria-label="Siguiente producto"
              >
                ›
              </button>
            </>
          )}
          
          {/* Contenedor del carrusel */}
          <div className={styles.carouselWrapper}>
            <div 
              ref={carouselRef}
              className={styles.carouselTrack}
              style={{
                transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
                width: `${(products.length / slidesToShow) * 100}%`
              }}
            >
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className={styles.carouselSlide}
                  style={{ width: `${100 / products.length}%` }}
                >
                  <div className={styles.productCard}>
                    <div className={styles.imageContainer}>
                      <Image 
                        src={product.image || '/placeholder-product.jpg'} 
                        alt={product.name}
                        width={300}
                        height={200}
                        className={styles.productImage}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        priority={false}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Producto'
                        }}
                      />
                      
                      {product.discount && product.discount > 0 && (
                        <div className={styles.discountBadge}>
                          -{product.discount}%
                        </div>
                      )}
                      
                      {getProductStock(product) <= 5 && getProductStock(product) > 0 && (
                        <div className={styles.lowStockBadge}>
                          ¡Últimas {getProductStock(product)}!
                        </div>
                      )}
                      
                      <div className={styles.overlay}>
                        <button 
                          className={styles.quickViewBtn}
                          onClick={() => openQuickView(product)}
                        >
                          <i className="fas fa-eye"></i>
                          Vista Rápida
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productDescription}>{product.description}</p>
                      <div className={styles.productFooter}>
                        <div className={styles.priceContainer}>
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
                              ${getProductPrice(product).toLocaleString()} /100g
                            </span>
                          )}
                        </div>
                        
                        <button 
                          className={styles.addToCartBtn}
                          onClick={() => goToProduct(product._id)}
                          disabled={getProductStock(product) === 0}
                        >
                          {getProductStock(product) === 0 ? 'Agotado' : 'Ver Producto'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores de puntos */}
          {products.length > slidesToShow && (
            <div className={styles.carouselDots}>
              {Array.from({ length: Math.ceil(products.length / slidesToShow) }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.carouselDot} ${currentSlide === index ? styles.carouselDotActive : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir al slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.viewAllContainer}>
          <Link href="/productos" className={styles.viewAllBtn}>
            <i className="fas fa-arrow-right"></i>
            Ver Todos los Productos
          </Link>
        </div>
      </div>
      
      {/* Modal de vista rápida */}
      {showQuickView && quickViewProduct && (
        <div className={styles.modalOverlay} onClick={closeQuickView}>
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
                    <span className={styles.weightInfo}> / {selectedWeight.weight}g</span>
                  )}
                </div>
                
                <p className={styles.modalDescription}>{quickViewProduct.description}</p>
                
                <div className={styles.modalCategory}>
                  <strong>Categoría:</strong> {quickViewProduct.category}
                </div>
                
                {/* Selector de peso */}
                {getWeightOptions(quickViewProduct).length > 0 && (
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
                )}
                
                {/* Selector de cantidad */}
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
                      onClick={() => setQuantity(quantity + 1)}
                      className={styles.quantityBtn}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => addToCartFromModal(quickViewProduct, selectedWeight || undefined, quantity)}
                  className={styles.modalAddToCartBtn}
                  disabled={!selectedWeight}
                >
                  AÑADIR AL CARRITO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}