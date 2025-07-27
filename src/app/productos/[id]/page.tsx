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

// ✅ PRODUCTOS DE EJEMPLO MOVIDOS FUERA DEL COMPONENTE (constante global)
const SAMPLE_PRODUCTS: Product[] = [
  {
    _id: '1',
    name: 'Coco rallado natural',
    description: 'Coco rallado 100% natural, perfecto para repostería y preparaciones dulces.',
    category: 'Deshidratados',
    basePricePer100g: 7890,
    pricesByWeight: [
      { weight: 100, price: 3945, stock: 15 },
      { weight: 250, price: 7890, stock: 12 },
      { weight: 500, price: 14200, stock: 8 },
      { weight: 1000, price: 25248, stock: 5 }
    ],
    totalStock: 40,
    image: '/images/coco-rallado.jpg',
    featured: false,
    discount: 0,
    createdAt: new Date().toISOString()
  }
]

export default function ProductoPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showCartOptions, setShowCartOptions] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // ✅ FUNCIONES HELPER PARA OBTENER PRECIO Y STOCK
  const getProductStock = (product: Product) => {
    if (product.totalStock !== undefined) {
      return product.totalStock
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.reduce((total, p) => total + (p.stock || 0), 0)
    }
    return 0
  }

  // ✅ OBTENER OPCIONES DE PESO DESDE EL PRODUCTO
  const getWeightOptions = (product: Product): WeightOption[] => {
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.map(pw => ({
        weight: pw.weight,
        price: pw.price,
        stock: pw.stock,
        label: `${pw.weight}g`
      }))
    }
    return []
  }

  // ✅ FUNCIÓN MEMOIZADA PARA OBTENER PRODUCTOS RECOMENDADOS (sin dependencias problemáticas)
  const getRecommendedProducts = useCallback(() => {
    return SAMPLE_PRODUCTS.filter(p => p._id !== params.id).slice(0, 8)
  }, [params.id]) // ✅ CORREGIDO: Solo params.id como dependencia

  const recommendedProducts = getRecommendedProducts()
  const totalSlides = Math.ceil(recommendedProducts.length / 5)

  // ✅ FUNCIÓN MEMOIZADA PARA CARGAR PRODUCTO (sin dependencias problemáticas)
  const loadProduct = useCallback(async () => {
    setLoading(true)
    try {
      // Intentar cargar desde API
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        // Si falla la API, buscar en productos de ejemplo
        const foundProduct = SAMPLE_PRODUCTS.find(p => p._id === params.id)
        setProduct(foundProduct || null)
      }
    } catch {
      console.log('API no disponible, buscando en productos de ejemplo')
      const foundProduct = SAMPLE_PRODUCTS.find(p => p._id === params.id)
      setProduct(foundProduct || null)
    } finally {
      setLoading(false)
    }
  }, [params.id]) // ✅ CORREGIDO: Solo params.id como dependencia

  useEffect(() => {
    if (params.id) {
      loadProduct()
    }
  }, [params.id, loadProduct])

  // ✅ ESTABLECER PESO POR DEFECTO CUANDO SE CARGA EL PRODUCTO
  useEffect(() => {
    if (product && !selectedWeight) {
      const weightOptions = getWeightOptions(product)
      if (weightOptions.length > 0) {
        // Seleccionar 250g por defecto, o la primera opción disponible
        const defaultWeight = weightOptions.find(w => w.weight === 250) || weightOptions[0]
        setSelectedWeight(defaultWeight)
      }
    }
  }, [product, selectedWeight])

  const getCurrentPrice = () => {
    if (!selectedWeight) return 0
    return selectedWeight.price
  }

  const addToCart = () => {
    if (product && selectedWeight) {
      console.log('Agregado al carrito:', { 
        product, 
        quantity, 
        weight: selectedWeight.weight,
        price: getCurrentPrice()
      })
      
      // Mostrar mensaje de éxito
      setShowSuccessMessage(true)
      setShowCartOptions(true)
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
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

  // Funciones del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex)
  }

  const navigateToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando producto...</p>
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
          <div className={styles.notFound}>
            <h2>Producto no encontrado</h2>
            <button onClick={goBack} className={styles.backBtn}>
              Volver a productos
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const weightOptions = getWeightOptions(product)
  const totalStock = getProductStock(product)

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <button onClick={goBack} className={styles.breadcrumbLink}>
              ← Volver a productos
            </button>
          </nav>

          {/* Producto */}
          <div className={styles.productContainer}>
            <div className={styles.productImage}>
              <Image
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name}
                width={400}
                height={300}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-product.jpg'
                }}
              />
            </div>
            
            <div className={styles.productInfo}>
              <h1 className={styles.productName}>{product.name}</h1>
              
              <div className={styles.productPrice}>
                ${getCurrentPrice().toLocaleString('es-CL')}
                {selectedWeight && (
                  <span className={styles.weightInfo}> / {selectedWeight.label}</span>
                )}
              </div>
              
              <div className={styles.productDescription}>
                <p>{product.description}</p>
              </div>
              
              <div className={styles.stockInfo}>
                {totalStock > 0 ? (
                  <span className={styles.inStock}>
                    <i className="fas fa-check-circle"></i>
                    {selectedWeight ? selectedWeight.stock : totalStock} unidades disponibles
                  </span>
                ) : (
                  <span className={styles.outOfStock}>
                    <i className="fas fa-times-circle"></i>
                    Agotado
                  </span>
                )}
              </div>
              
              {/* Sección de compra */}
              <div className={styles.purchaseSection}>
                {/* ✅ SELECTOR DE PESO CON DATOS REALES */}
                {weightOptions.length > 0 && (
                  <div className={styles.weightSelector}>
                    <label className={styles.selectorLabel}>Seleccione la Cantidad:</label>
                    <div className={styles.weightOptions}>
                      {weightOptions.map((option) => (
                        <button
                          key={option.weight}
                          onClick={() => setSelectedWeight(option)}
                          className={`${styles.weightOption} ${
                            selectedWeight?.weight === option.weight ? styles.selected : ''
                          }`}
                          disabled={option.stock === 0}
                        >
                          <span className={styles.weightLabel}>{option.label}</span>
                          <span className={styles.weightPrice}>
                            ${option.price.toLocaleString('es-CL')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selector de cantidad */}
                <div className={styles.quantitySelector}>
                  <label className={styles.selectorLabel}>Cantidad:</label>
                  <div className={styles.quantityControls}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityBtn}
                      disabled={!selectedWeight || selectedWeight.stock === 0}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(selectedWeight?.stock || 0, quantity + 1))}
                      className={styles.quantityBtn}
                      disabled={!selectedWeight || selectedWeight.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Botón agregar al carrito */}
                <button 
                  onClick={addToCart}
                  className={styles.addToCartBtn}
                  disabled={!selectedWeight || selectedWeight.stock === 0}
                >
                  <i className="fas fa-cart-plus"></i>
                  {!selectedWeight ? 'Selecciona un peso' :
                   selectedWeight.stock === 0 ? 'Agotado' : 
                   'Agregar al carrito'}
                </button>
                
                {/* Mensaje de éxito */}
                {showSuccessMessage && (
                  <div className={styles.successMessage}>
                    <i className="fas fa-check-circle"></i>
                    ¡Producto agregado al carrito con éxito!
                  </div>
                )}
                
                {/* Opciones del carrito */}
                {showCartOptions && (
                  <div className={styles.cartOptionsContainer}>
                    <div className={styles.cartOptions}>
                      <button 
                        onClick={continueShopping}
                        className={styles.continueShoppingBtn}
                      >
                        <i className="fas fa-shopping-bag"></i>
                        Seguir comprando
                      </button>
                      
                      <button 
                        onClick={goToCart}
                        className={styles.goToCartBtn}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        Ir al carrito
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.productMeta}>
                <div className={styles.category}>
                  <strong>Categoría:</strong> {product.category}
                </div>
              </div>
            </div>
          </div>

          {/* Productos recomendados */}
          {recommendedProducts.length > 0 && (
            <section className={styles.recommendedSection}>
              <h2 className={styles.recommendedTitle}>Productos Recomendados</h2>
              
              <div className={styles.carouselContainer}>
                <div className={styles.carousel}>
                  <div 
                    className={styles.carouselTrack}
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
                                  src={product.image || '/placeholder-product.jpg'}
                                  alt={product.name}
                                  width={150}
                                  height={120}
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
                              </div>
                              <div className={styles.productDetails}>
                                <h4>{product.name}</h4>
                                <p className={styles.productPrice}>
                                  ${(product.basePricePer100g || 0).toLocaleString('es-CL')}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
                
                {totalSlides > 1 && (
                  <>
                    <button 
                      className={`${styles.carouselBtn} ${styles.prevBtn}`}
                      onClick={prevSlide}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      className={`${styles.carouselBtn} ${styles.nextBtn}`}
                      onClick={nextSlide}
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
        </div>
      </main>
      
      <Footer />
    </div>
  )
}