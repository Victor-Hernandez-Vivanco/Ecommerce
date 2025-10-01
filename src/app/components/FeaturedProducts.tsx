'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../context/CartContext'
import styles from './FeaturedProducts.module.css'
import { 
  getProductPrice, 
  getProductStock
} from '@/utils/product'

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

// Mover SLIDES_TO_SHOW fuera del componente para evitar recreaciones
const SLIDES_TO_SHOW = {
  desktop: 3,
  tablet: 2,
  mobile: 1
}
const AUTO_PLAY_INTERVAL = 4000

// Función para formatear precios en formato chileno
const formatChileanPrice = (price: number): string => {
  return price.toLocaleString('es-CL')
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

  // Función para obtener cuántos slides mostrar según el viewport
  const getSlidesToShow = useCallback(() => {
    if (typeof window === 'undefined') return SLIDES_TO_SHOW.desktop
    
    if (window.innerWidth <= 480) return SLIDES_TO_SHOW.mobile
    if (window.innerWidth <= 768) return SLIDES_TO_SHOW.tablet
    return SLIDES_TO_SHOW.desktop
  }, [])

  const [slidesToShow, setSlidesToShow] = useState(SLIDES_TO_SHOW.desktop)

  // Funciones de navegación del carrusel simplificadas
  const nextSlide = useCallback(() => {
    if (products.length <= slidesToShow) return
    
    setCurrentSlide(prev => {
      const maxSlide = products.length - slidesToShow
      return prev >= maxSlide ? 0 : prev + 1
    })
  }, [products.length, slidesToShow])

  const prevSlide = useCallback(() => {
    if (products.length <= slidesToShow) return
    
    setCurrentSlide(prev => {
      const maxSlide = products.length - slidesToShow
      return prev <= 0 ? maxSlide : prev - 1
    })
  }, [products.length, slidesToShow])

  const goToSlide = useCallback((slideIndex: number) => {
    if (products.length <= slidesToShow) return
    
    setCurrentSlide(slideIndex)
    setIsAutoPlaying(false)
    
    // Reanudar auto-play después de 1 segundo
    setTimeout(() => setIsAutoPlaying(true), 1000)
  }, [products.length, slidesToShow])

  // Manejar resize de ventana
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getSlidesToShow())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getSlidesToShow])

  // Resetear currentSlide cuando cambian los productos o slidesToShow
  useEffect(() => {
    setCurrentSlide(0)
  }, [products.length, slidesToShow])

  // Auto-play del carrusel
  useEffect(() => {
    if (!isAutoPlaying || products.length <= slidesToShow) return

    autoPlayRef.current = setInterval(() => {
      nextSlide()
    }, AUTO_PLAY_INTERVAL)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, products.length, slidesToShow, nextSlide])

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
        
        if (data.length === 0) {
          const allProductsResponse = await fetch('/api/products')
          
          if (allProductsResponse.ok) {
            const allProducts = await allProductsResponse.json()
            setProducts(allProducts.slice(0, 8))
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

  // Calcular el número máximo de slides
  const maxSlides = Math.max(0, products.length - slidesToShow)
  const slideWidth = 100 / slidesToShow

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
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
                transform: `translateX(-${currentSlide * slideWidth}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              {products.map((product) => (
                <div 
                  key={product._id}
                  className={styles.carouselSlide}
                  style={{ width: `${slideWidth}%` }}
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
                                ${formatChileanPrice(getProductPrice(product))}
                              </span>
                              <span className={styles.discountPrice}>
                                ${formatChileanPrice(Math.round(getProductPrice(product) * (1 - product.discount / 100)))}
                              </span>
                            </>
                          ) : (
                            <span className={styles.price}>
                              ${formatChileanPrice(getProductPrice(product))}
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
              {Array.from({ length: maxSlides + 1 }).map((_, index) => (
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
                  ${formatChileanPrice(getCurrentPrice())}
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