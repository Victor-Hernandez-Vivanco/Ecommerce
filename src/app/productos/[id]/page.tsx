'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './producto.module.css'
import { useCart } from '../../context/CartContext'
// ✅ NUEVAS IMPORTACIONES PARA REACT ICONS
import { FaWhatsapp, FaFacebookF, FaChevronLeft, FaChevronRight, FaTimes, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

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

  // ✅ FUNCIÓN PARA OBTENER IMAGEN CORRECTA
  const getCorrectImagePath = useCallback((product: Product) => {
    console.log('🔍 Debugging product images:', {
      productName: product.name,
      images: product.images,
      image: product.image
    })
    
    // Sistema nuevo: campo 'images' (array)
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary)
      const imageUrl = primaryImage ? primaryImage.url : product.images[0].url
      
      console.log('📸 Image URL from array:', imageUrl)
      
      // Si ya es una URL completa (http o /uploads/), devolverla tal como está
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/uploads/'))) {
        return imageUrl
      }
      
      // Si es solo el nombre del archivo, agregar la ruta completa
      if (imageUrl) {
        const fullPath = `/uploads/products/${imageUrl}`
        console.log('🔗 Generated full path:', fullPath)
        return fullPath
      }
    }
    
    // Sistema antiguo: campo 'image' (string)
    if (product.image) {
      console.log('📸 Image URL from string:', product.image)
      
      // Si es una URL externa (Unsplash), devolverla tal como está
      if (product.image.startsWith('http')) {
        return product.image
      }
      
      // Si ya tiene /uploads/, devolverla tal como está
      if (product.image.startsWith('/uploads/')) {
        return product.image
      }
      
      // Si es solo el nombre del archivo, agregar la ruta completa
      const fullPath = `/uploads/products/${product.image}`
      console.log('🔗 Generated full path for string:', fullPath)
      return fullPath
    }
    
    // Fallback
    console.log('⚠️ Using fallback image')
    return '/placeholder-product.jpg'
  }, [])

  // ✅ FUNCIÓN HELPER PARA OBTENER IMAGEN PRINCIPAL - MEMOIZADA
  const getProductImage = useCallback((product: Product) => {
    return getCorrectImagePath(product)
  }, [getCorrectImagePath])

  // ✅ FUNCIÓN PARA OBTENER TODAS LAS IMÁGENES - MEMOIZADA
  const getAllImages = useCallback((product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => {
        const imageUrl = img.url
        // Si es una ruta local, verificar que tenga la ruta completa
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads/')) {
          return `/uploads/products/${imageUrl}`
        }
        return imageUrl
      })
    }
    return [getCorrectImagePath(product)]
  }, [getCorrectImagePath])

  // ✅ FUNCIÓN PARA OBTENER IMAGEN ACTUAL - MEMOIZADA
  const getCurrentImage = useCallback(() => {
    if (!product) return '/placeholder-product.jpg'
    const images = getAllImages(product)
    return images[currentImageIndex] || images[0]
  }, [product, currentImageIndex, getAllImages])

  // ✅ NAVEGACIÓN DE IMÁGENES CON useCallback - DEPENDENCIAS CORREGIDAS
  const nextImage = useCallback(() => {
    if (!product) return
    const images = getAllImages(product)
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }, [product, getAllImages])

  const prevImage = useCallback(() => {
    if (!product) return
    const images = getAllImages(product)
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [product, getAllImages])

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

  // ✅ FUNCIÓN HELPER MEJORADA PARA OBTENER OPCIONES DE PESO - FILTRADA POR STOCK
  const getWeightOptions = (product: Product): WeightOption[] => {
    console.log('Product pricesByWeight:', product.pricesByWeight) // Debug
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight
        .filter(option => option.stock > 0) // ✅ FILTRAR SOLO OPCIONES CON STOCK
        .map(option => ({
          weight: option.weight,
          price: option.price,
          stock: option.stock,
          label: option.weight >= 1000 ? `${option.weight / 1000}kg` : `${option.weight}g`
        }))
    }
    // ✅ FALLBACK: Si no hay pricesByWeight con stock, no crear opciones básicas
    return []
  }

  // ✅ FUNCIÓN MEMOIZADA PARA CARGAR Los Favoritos de Frutos Secos Premium - OPCIÓN 2
  const loadRecommendedProducts = useCallback(async () => {
    if (!product) return
    
    setLoadingRecommended(true)
    try {
      const response = await fetch(`/api/products/main-carousel`)
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Productos recibidos de main-carousel:', data)
        // ✅ CORREGIDO: No filtrar el producto actual, mostrar todos los del carrusel
        setRecommendedProducts(data.slice(0, 10))
        console.log('✅ Productos para carrusel:', data)
      }
    } catch (error) {
      console.error('Error cargando Los Favoritos de Frutos Secos Premium:', error)
    } finally {
      setLoadingRecommended(false)
    }
  }, [product])

  // ✅ FUNCIÓN MEMOIZADA MEJORADA PARA CARGAR PRODUCTO
  const loadProduct = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Producto cargado:', data) // Debug
        setProduct(data)
        
        // ✅ CONFIGURAR PESO POR DEFECTO MEJORADO - SOLO CON STOCK
        const weightOptions = getWeightOptions(data)
        console.log('Weight options with stock:', weightOptions) // Debug
        if (weightOptions.length > 0) {
          // Seleccionar la primera opción disponible con stock
          setSelectedWeight(weightOptions[0])
          console.log('Selected weight with stock:', weightOptions[0]) // Debug
        } else {
          console.warn('No weight options with stock available for product:', data.name)
          setSelectedWeight(null)
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
  }, [loadProduct])

  useEffect(() => {
    if (product) {
      loadRecommendedProducts()
    }
  }, [product, loadRecommendedProducts])

  // ✅ VARIABLES CALCULADAS
  const weightOptions = product ? getWeightOptions(product) : []
  const maxQuantity = selectedWeight ? selectedWeight.stock : 0
  const isOutOfStock = !selectedWeight || selectedWeight.stock === 0
  const totalSlides = Math.ceil(recommendedProducts.length / 5)

  // ✅ FUNCIÓN addToCart MEJORADA CON LOGS
  const { addToCart: addToCartContext } = useCart()

  // ✅ FUNCIÓN addToCart ACTUALIZADA
  const addToCart = () => {
    if (!selectedWeight || !product) {
      console.warn('Cannot add to cart: missing selectedWeight or product')
      return
    }
    
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: getProductImage(product),
      weight: selectedWeight.weight,
      price: selectedWeight.price,
      quantity: quantity,
      stock: selectedWeight.stock
    }
    
    // Usar el contexto para agregar al carrito
    addToCartContext(cartItem)
    
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
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onLoadingComplete={() => setIsImageLoading(false)}
                      onLoadStart={() => setIsImageLoading(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-product.jpg'
                      }}
                    />
                    
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
                        <FaChevronLeft />
                      </button>
                      <button 
                        className={`${styles.navArrow} ${styles.navArrowRight}`}
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <FaChevronRight />
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
                        .filter(option => option.stock > 0 || weightOptions.length === 1) /* ✅ MOSTRAR AL MENOS UNA OPCIÓN */
                        .map((option) => (
                          <button
                            key={option.weight}
                            className={`${styles.weightButton} ${
                              selectedWeight?.weight === option.weight ? styles.selected : ''
                            }`}
                            onClick={() => {
                              setSelectedWeight(option)
                              console.log('Weight selected:', option) // Debug
                            }}
                          >
                            {option.label}
                            {option.stock <= 0 && <span className={styles.outOfStock}> (Agotado)</span>}
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
                        onClick={() => {
                          console.log('Button clicked, selectedWeight:', selectedWeight) // Debug
                          addToCart()
                        }}
                        className={styles.addToCartBtn}
                        disabled={!selectedWeight || isOutOfStock}
                        title={!selectedWeight ? 'Selecciona un peso primero' : isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}
                      >
                        {isOutOfStock ? 'Producto Agotado' : 'Agregar al carrito'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ BOTONES SIEMPRE VISIBLES */}
                <div className={styles.actionButtons}>
                  <button 
                    onClick={continueShopping}
                    className={styles.continueShoppingBtn}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Seguir Comprando
                  </button>
                  <button 
                    onClick={goToCart}
                    className={styles.goToCartBtn}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Ir al Carrito
                  </button>
                </div>
                
                {/* ✅ MENSAJE DE ÉXITO CONDICIONAL */}
                {showCartOptions && (
                  <div className={styles.successActions}>
                    <p className={styles.successText}>¡Producto agregado exitosamente!</p>
                  </div>
                )}

                <div className={styles.productDescription}>
                  <p>{product.description}</p>
                </div>
                {/* ✅ SECCIÓN DE COMPARTIR ACTUALIZADA PARA COINCIDIR CON EL FOOTER */}
                <div className={styles.shareSection}>
                  <h3>Compartir producto</h3>
                  <div className={styles.shareButtons}>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareBtn} ${styles.facebook}`}
                      title="Compartir en Facebook"
                    >
                      <FaFacebookF />
                    </a>
                    <a 
                      href={`https://instagram.com/frutossecoschile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareBtn} ${styles.instagram}`}
                      title="Seguir en Instagram"
                    >
                      <FaInstagram />
                    </a>
                    <a 
                      href={`https://x.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`Mira este producto: ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareBtn} ${styles.xTwitter}`}
                      title="Compartir en X"
                    >
                      <FaXTwitter />
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Mira este producto: ${product.name} ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareBtn} ${styles.whatsapp}`}
                      title="Compartir en WhatsApp"
                    >
                      <FaWhatsapp />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ MODAL DE ZOOM CON PERSISTENCIA */}
          {showZoomModal && (
            <div className={styles.zoomModal}>
              <div className={styles.zoomContainer}>
                {/* ✅ BOTÓN CERRAR - ÚNICA FORMA DE CERRAR EL MODAL */}
                <button 
                  className={styles.closeZoomBtn}
                  onClick={() => setShowZoomModal(false)}
                  aria-label="Cerrar vista ampliada"
                >
                  <FaTimes />
                </button>

                {/* ✅ IMAGEN CON FLECHAS DE NAVEGACIÓN */}
                <div className={styles.zoomImageContainer}>
                  <Image
                    src={getCurrentImage()}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="90vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-product.jpg'
                    }}
                  />
                  
                  {/* ✅ FLECHAS DE NAVEGACIÓN EN EL MODAL */}
                  {getAllImages(product).length > 1 && (
                    <>
                      <button 
                        className={`${styles.zoomNavArrow} ${styles.zoomNavArrowLeft}`}
                        onClick={prevImage}
                        aria-label="Imagen anterior"
                      >
                        <FaChevronLeft />
                      </button>
                      <button 
                        className={`${styles.zoomNavArrow} ${styles.zoomNavArrowRight}`}
                        onClick={nextImage}
                        aria-label="Imagen siguiente"
                      >
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                </div>

                {/* ✅ INDICADORES DE IMAGEN */}
                {getAllImages(product).length > 1 && (
                  <div className={styles.zoomIndicators}>
                    {getAllImages(product).map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.zoomIndicator} ${
                          index === currentImageIndex ? styles.zoomIndicatorActive : ''
                        }`}
                        onClick={() => selectImage(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ SECCIÓN DE PRODUCTOS RECOMENDADOS */}
          {recommendedProducts.length > 0 && (
            <section className={styles.recommendedSection}>
              <div className={styles.recommendedHeader}>
                <h2 className={styles.recommendedTitle}>
                  Los Favoritos de{' '}
                  <Link href="/" className={styles.navLogo}>
                    <i className="fas fa-seedling"></i>
                    <span>Frutos Secos Premium</span>
                  </Link>
                </h2>
              </div>
              
              {/* ✅ INDICADOR DE CARGA PARA PRODUCTOS RECOMENDADOS */}
              {loadingRecommended ? (
                <div className={styles.loadingRecommended}>
                  <div className={styles.spinner}></div>
                  <p>Cargando productos recomendados...</p>
                </div>
              ) : (
                <div className={styles.carouselContainer}>
                  <div className={styles.carouselWrapper}>
                    <div 
                      className={styles.carouselTrack}
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                        <div key={slideIndex} className={styles.carouselSlide}>
                          {recommendedProducts
                            .slice(slideIndex * 5, (slideIndex + 1) * 5)
                            .map((recProduct) => (
                              <div 
                                key={recProduct._id} 
                                className={styles.recommendedCard}
                                onClick={() => navigateToProduct(recProduct._id)}
                              >
                                <div className={styles.recommendedImageContainer}>
                                  <Image
                                    src={getProductImage(recProduct)}
                                    alt={recProduct.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = '/placeholder-product.jpg'
                                    }}
                                  />
                                  {recProduct.discount > 0 && (
                                    <div className={styles.recommendedDiscount}>
                                      -{recProduct.discount}%
                                    </div>
                                  )}
                                </div>
                                <div className={styles.recommendedInfo}>
                                  <h3 className={styles.recommendedName}>{recProduct.name}</h3>
                                  <div className={styles.recommendedPrice}>
                                    ${getProductPrice(recProduct).toLocaleString('es-CL')}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Controles del carrusel */}
                  {totalSlides > 1 && (
                    <>
                      <button 
                        className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                      >
                        <FaChevronLeft />
                      </button>
                      <button 
                        className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
                        onClick={nextSlide}
                        disabled={currentSlide === totalSlides - 1}
                      >
                        <FaChevronRight />
                      </button>
                      
                      <div className={styles.carouselDots}>
                        {Array.from({ length: totalSlides }).map((_, index) => (
                          <button
                            key={index}
                            className={`${styles.carouselDot} ${
                              index === currentSlide ? styles.carouselDotActive : ''
                            }`}
                            onClick={() => goToSlide(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}