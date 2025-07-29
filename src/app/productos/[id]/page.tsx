'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './producto.module.css'

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
  images?: Array<{
    url: string
    isPrimary: boolean
  }>
  image?: string
  featured: boolean
  isMainCarousel?: boolean
  discount: number
  createdAt: string
}

interface WeightOption {
  weight: number
  price: number
  stock: number
  label: string
}

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCartOptions, setShowCartOptions] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // ✅ NUEVOS ESTADOS PARA GALERÍA
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)

  // ✅ FUNCIÓN HELPER PARA OBTENER IMAGEN PRINCIPAL
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary)
      return primaryImage ? primaryImage.url : product.images[0].url
    }
    return product.image || '/placeholder-product.jpg'
  }

  // ✅ FUNCIÓN PARA OBTENER TODAS LAS IMÁGENES
  const getAllImages = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url)
    }
    return [product.image || '/placeholder-product.jpg']
  }

  // ✅ FUNCIÓN PARA OBTENER IMAGEN ACTUAL
  const getCurrentImage = () => {
    if (!product) return '/placeholder-product.jpg'
    const images = getAllImages(product)
    return images[currentImageIndex] || images[0]
  }

  // ✅ NAVEGACIÓN DE IMÁGENES CON useCallback
  const nextImage = useCallback(() => {
    if (!product) return
    const images = getAllImages(product)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }, [product])

  const prevImage = useCallback(() => {
    if (!product) return
    const images = getAllImages(product)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [product])

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // ✅ NAVEGACIÓN CON TECLADO - DEPENDENCIAS CORREGIDAS
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'Escape') setShowZoomModal(false)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextImage, prevImage])

  // ✅ FUNCIÓN HELPER PARA OBTENER PRECIO
  const getProductPrice = (product: Product) => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight[0].price
    }
    return product.basePricePer100g || 0
  }

  // ✅ FUNCIÓN HELPER PARA OBTENER OPCIONES DE PESO
  const getWeightOptions = (product: Product): WeightOption[] => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.map(option => ({
        weight: option.weight,
        price: option.price,
        stock: option.stock,
        label: option.weight >= 1000 ? `${option.weight / 1000}kg` : `${option.weight}g`
      }))
    }
    return []
  }

  // ✅ CARGAR PRODUCTOS RECOMENDADOS DESDE API - CORREGIDO
  const loadRecommendedProducts = useCallback(async () => {
    try {
      setLoadingRecommended(true)
      
      // ✅ CORREGIDO: Cargar productos del carrusel principal (isMainCarousel)
      const response = await fetch('/api/products/main-carousel')
      
      if (response.ok) {
        const products: Product[] = await response.json()
        // Filtrar el producto actual y mostrar todos los productos disponibles
        const filtered = products.filter(p => p._id !== params.id)
        setRecommendedProducts(filtered)
        console.log(`✅ Cargados ${filtered.length} productos recomendados del carrusel principal`)
      } else {
        // Si falla, cargar productos generales como fallback
        const fallbackResponse = await fetch('/api/products')
        if (fallbackResponse.ok) {
          const allProducts: Product[] = await fallbackResponse.json()
          const filtered = allProducts.filter(p => p._id !== params.id).slice(0, 12)
          setRecommendedProducts(filtered)
          console.log(`⚠️ Fallback: Cargados ${filtered.length} productos generales`)
        }
      }
    } catch (error) {
      console.error('Error cargando productos recomendados:', error)
      // En caso de error, usar array vacío
      setRecommendedProducts([])
    } finally {
      setLoadingRecommended(false)
    }
  }, [params.id])

  const totalSlides = Math.ceil(recommendedProducts.length / 5)

  // ✅ FUNCIÓN MEMOIZADA PARA CARGAR PRODUCTO
  const loadProduct = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        
        // Configurar peso por defecto
        const weightOptions = getWeightOptions(data)
        if (weightOptions.length > 0) {
          setSelectedWeight(weightOptions[0])
        }
      } else {
        setProduct(null)
      }
    } catch (error) {
      console.error('Error cargando producto:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    loadProduct()
    loadRecommendedProducts()
  }, [loadProduct, loadRecommendedProducts])

  const weightOptions = product ? getWeightOptions(product) : []
  const maxQuantity = selectedWeight ? selectedWeight.stock : 0
  const isOutOfStock = !selectedWeight || selectedWeight.stock === 0

  const addToCart = () => {
    if (!selectedWeight || !product) return
    
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: getProductImage(product),
      weight: selectedWeight.weight,
      price: selectedWeight.price,
      quantity: quantity,
      total: selectedWeight.price * quantity
    }
    
    // Obtener carrito actual
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Buscar si el producto ya existe con el mismo peso
    const existingItemIndex = currentCart.findIndex(
      (item: { productId: string; weight: number }) => item.productId === cartItem.productId && item.weight === cartItem.weight
    )
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad
      currentCart[existingItemIndex].quantity += cartItem.quantity
      currentCart[existingItemIndex].total = currentCart[existingItemIndex].price * currentCart[existingItemIndex].quantity
    } else {
      // Agregar nuevo item
      currentCart.push(cartItem)
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart))
    
    // Mostrar mensaje de éxito
    setShowSuccess(true)
    setShowCartOptions(true)
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const continueShopping = () => {
    router.push('/productos')
  }

  const goToCart = () => {
    router.push('/carrito')
  }

  const goBack = () => {
    router.back()
  }

  const navigateToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  // Funciones del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Cargando producto...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.notFound}>
              <h1>Producto no encontrado</h1>
              <p>El producto que buscas no existe o ha sido eliminado.</p>
              <button onClick={goBack} className={styles.backBtn}>
                ← Volver
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <button onClick={() => router.push('/')} className={styles.breadcrumbLink}>
              Inicio
            </button>
            <span> / </span>
            <button onClick={() => router.push('/productos')} className={styles.breadcrumbLink}>
              Productos
            </button>
            <span> / </span>
            <span>{product.name}</span>
          </nav>

          {/* Botón volver */}
          <button onClick={goBack} className={styles.backButton}>
            <i className="fas fa-arrow-left"></i>
            Volver
          </button>

          {/* ✅ MENSAJE DE ÉXITO */}
          {showSuccess && (
            <div className={styles.successMessage}>
              <i className="fas fa-check-circle"></i>
              ¡Producto agregado al carrito exitosamente!
            </div>
          )}

          {/* ✅ CONTENEDOR PRINCIPAL DEL PRODUCTO AGREGADO */}
          <div className={styles.productContainer}>
            {/* Contenedor del producto */}
            <div className={styles.productGrid}>
              {/* ✅ NUEVA SECCIÓN DE IMAGEN CON GALERÍA */}
              <div className={styles.productImageSection}>
                {/* Imagen principal con zoom */}
                <div className={styles.mainImageContainer}>
                  <div 
                    className={styles.mainImage}
                    onClick={() => setShowZoomModal(true)}
                  >
                    <Image
                      src={getCurrentImage()}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      onLoadingComplete={() => setIsImageLoading(false)}
                      onLoadStart={() => setIsImageLoading(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-product.jpg'
                      }}
                    />
                    {/* Overlay de zoom */}
                    {/* <div className={styles.zoomOverlay}>
                      <i className="fas fa-search-plus"></i>
                      <span>Click para ampliar</span>
                    </div> */}
                    
                    {product.discount > 0 && (
                      <div className={styles.discountBadge}>
                        -{product.discount}%
                      </div>
                    )}
                    
                    {isImageLoading && (
                      <div className={styles.imageLoader}>
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                    )}
                  </div>

                  {/* Flechas de navegación */}
                  {getAllImages(product).length > 1 && (
                    <>
                      <button 
                        className={`${styles.navArrow} ${styles.navArrowLeft}`}
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button 
                        className={`${styles.navArrow} ${styles.navArrowRight}`}
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {getAllImages(product).length > 1 && (
                  <div className={styles.thumbnailsContainer}>
                    <div className={styles.thumbnailsWrapper}>
                      {getAllImages(product).map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`${styles.thumbnail} ${
                            index === currentImageIndex ? styles.thumbnailActive : ''
                          }`}
                          onClick={() => selectImage(index)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${product.name} - imagen ${index + 1}`}
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-product.jpg'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className={styles.productInfo}>
                <div className={styles.productHeader}>
                  <h1 className={styles.productTitle}>{product.name}</h1>
                  {/* <div className={styles.ratingSection}>
                    <div className={styles.stars}>
                      {[1,2,3,4,5].map(star => (
                        <i key={star} className="fas fa-star" style={{color: '#ffc107'}}></i>
                      ))}
                    </div>
                    <span className={styles.ratingText}>4.9 (8)</span>
                  </div> */}
                  <div className={styles.stockBadge}>
                    <span className={styles.availableBadge}>Disponible</span>
                  </div>
                </div>

                <div className={styles.priceSection}>
                  <div className={styles.mainPrice}>
                    ${selectedWeight ? selectedWeight.price.toLocaleString('es-CL') : '0'}
                  </div>
                  {selectedWeight && (
                    <div className={styles.priceDetails}>
                      <span className={styles.weightInfo}>Precio por {selectedWeight.label}</span>
                    </div>
                  )}
                </div>

                {/* Selector de peso - Estilo compacto */}
                {weightOptions.length > 0 && (
                  <div className={styles.weightSection}>
                    <div className={styles.weightButtons}>
                      {weightOptions
                        .filter(option => option.stock > 0) /* ✅ SOLO MOSTRAR CON STOCK */
                        .map((option) => (
                          <button
                            key={option.weight}
                            className={`${styles.weightButton} ${
                              selectedWeight?.weight === option.weight ? styles.selected : ''
                            }`}
                            onClick={() => setSelectedWeight(option)}
                          >
                            {option.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* ✅ SELECTOR DE CANTIDAD HORIZONTAL */}
                {!isOutOfStock && (
                  <div>
                    <label className={styles.quantityLabel}>CANTIDAD</label>
                    <div className={styles.quantitySelector}>
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={styles.quantityBtn}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <div className={styles.quantityDisplay}>
                        <span className={styles.quantity}>{quantity}</span>
                      </div>
                      <button 
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        className={styles.quantityBtn}
                        disabled={quantity >= maxQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {!isOutOfStock && (
                  <div className={styles.purchaseSection}>
                    <div className={styles.purchaseActions}>
                      <button 
                        onClick={addToCart}
                        className={styles.addToCartBtn}
                        disabled={!selectedWeight}
                      >
                        Agregar al carrito
                      </button>
                      
                      {/* ✅ BOTONES CONDICIONALMENTE VISIBLES */}
                      {showCartOptions && (
                        <div className={styles.cartActionsInline}>
                          <button onClick={continueShopping} className={styles.continueShoppingBtn}>
                            <i className="fas fa-shopping-bag"></i>
                            Seguir Comprando
                          </button>
                          <button onClick={goToCart} className={styles.goToCartBtn}>
                            <i className="fas fa-shopping-cart"></i>
                            Ir al Carrito
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.productDescription}>
                  <p>{product.description}</p>
                </div>

                <div className={styles.shareSection}>
                  <span>Compartir en:</span>
                  <div className={styles.socialButtons}>
                    <button className={styles.socialBtn}><i className="fab fa-facebook"></i></button>
                    <button className={styles.socialBtn}><i className="fab fa-twitter"></i></button>
                    <button className={styles.socialBtn}><i className="fab fa-pinterest"></i></button>
                    <button className={styles.socialBtn}><i className="fab fa-tumblr"></i></button>
                    <button className={styles.socialBtn}><i className="fab fa-linkedin"></i></button>
                    <button className={styles.socialBtn}><i className="fab fa-whatsapp"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ MODAL DE ZOOM */}
          {showZoomModal && (
            <div 
              className={styles.zoomModal}
              onClick={() => setShowZoomModal(false)}
            >
              <div className={styles.zoomModalContent}>
                <button 
                  className={styles.zoomCloseBtn}
                  onClick={() => setShowZoomModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
                <Image
                  src={getCurrentImage()}
                  alt={product.name}
                  width={800}
                  height={600}
                  style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '90vh' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-product.jpg'
                  }}
                />
                
                {/* Navegación en modal */}
                {getAllImages(product).length > 1 && (
                  <>
                    <button 
                      className={`${styles.zoomNavArrow} ${styles.zoomNavArrowLeft}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      className={`${styles.zoomNavArrow} ${styles.zoomNavArrowRight}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </>
                )}
                
                {/* Indicador de imagen */}
                <div className={styles.zoomImageIndicator}>
                  {currentImageIndex + 1} / {getAllImages(product).length}
                </div>
              </div>
            </div>
          )}

          {/* ✅ CARRUSEL DE PRODUCTOS RECOMENDADOS RESTAURADO */}
          {!loadingRecommended && recommendedProducts.length > 0 && (
            <section className={styles.recommendedSection}>
              <div className={styles.recommendedHeader}>
                <h2 className={styles.recommendedTitle}>También te puede interesar</h2>
                <p className={styles.recommendedSubtitle}>Productos del carrusel principal</p>
              </div>
              
              <div className={styles.carouselContainer}>
                <div className={styles.carousel}>
                  <div className={styles.carouselTrack}>
                    <div 
                      className={styles.carouselSlides}
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                        width: `${totalSlides * 100}%`
                      }}
                    >
                      {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                        <div key={slideIndex} className={styles.carouselSlide}>
                          {recommendedProducts
                            .slice(slideIndex * 5, (slideIndex + 1) * 5)
                            .map((product) => (
                              <div 
                                key={product._id} 
                                className={styles.recommendedProduct}
                                onClick={() => navigateToProduct(product._id)}
                              >
                                <div className={styles.productImageContainer}>
                                  <Image
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    width={200}
                                    height={160}
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/placeholder-product.jpg'
                                    }}
                                  />
                                  <div className={styles.hoverOverlay}>
                                    <i className="fas fa-eye"></i>
                                    <span>Ver Producto</span>
                                  </div>
                                  {product.discount > 0 && (
                                    <div className={styles.productDiscount}>
                                      -{product.discount}%
                                    </div>
                                  )}
                                </div>
                                <div className={styles.productDetails}>
                                  <h4 className={styles.productName}>{product.name}</h4>
                                  <p className={styles.productPrice}>
                                    ${getProductPrice(product).toLocaleString('es-CL')} CLP
                                  </p>
                                  <div className={styles.productRating}>
                                    <div className={styles.stars}>
                                      {[1,2,3,4,5].map(star => (
                                        <i key={star} className="fas fa-star"></i>
                                      ))}
                                    </div>
                                    <span className={styles.ratingText}>(4.8)</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {totalSlides > 1 && (
                  <>
                    <button 
                      className={`${styles.carouselBtn} ${styles.prevBtn}`}
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      className={`${styles.carouselBtn} ${styles.nextBtn}`}
                      onClick={nextSlide}
                      disabled={currentSlide === totalSlides - 1}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    
                    <div className={styles.carouselIndicators}>
                      {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                          key={index}
                          className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                          onClick={() => goToSlide(index)}
                        >
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {loadingRecommended && (
            <div className={styles.loadingRecommended}>
              <div className={styles.spinner}></div>
              <p>Cargando productos recomendados...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}