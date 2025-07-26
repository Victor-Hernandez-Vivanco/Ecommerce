'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import styles from './producto.module.css'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

interface WeightOption {
  weight: string
  multiplier: number
  label: string
}

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

  // Opciones de peso disponibles
  const weightOptions: WeightOption[] = [
    { weight: '100g', multiplier: 0.5, label: '100 gramos' },
    { weight: '250g', multiplier: 1, label: '250 gramos' },
    { weight: '500g', multiplier: 1.8, label: '500 gramos' },
    { weight: '1kg', multiplier: 3.2, label: '1 kilogramo' }
  ]

  // Productos de ejemplo (mismo array que en la página principal)
  const sampleProducts: Product[] = [
    {
      _id: '1',
      name: 'Coco rallado natural',
      description: 'Coco rallado 100% natural, perfecto para repostería y preparaciones dulces. Rico en fibra y grasas saludables.',
      price: 7890,
      image: '/images/coco-rallado.jpg',
      category: 'frutos-deshidratados',
      stock: 15
    },
    {
      _id: '2',
      name: 'Mix cosavi',
      description: 'Mezcla especial de frutos secos y semillas seleccionadas. Ideal para snacks saludables y energéticos.',
      price: 10990,
      image: '/images/mix-cosavi.jpg',
      category: 'frutos-secos',
      stock: 8
    },
    {
      _id: '3',
      name: 'Mantequilla maní Riwün 250g',
      description: 'Mantequilla de maní natural sin aditivos artificiales. Cremosa textura y sabor intenso a maní tostado.',
      price: 3900,
      image: '/images/mantequilla-mani.jpg',
      category: 'riwun-al-frasco',
      stock: 12
    },
    {
      _id: '4',
      name: 'Maní tostado',
      description: 'Maní tostado con sal marina, ideal para snacks. Crujiente y lleno de proteínas vegetales.',
      price: 5490,
      image: '/images/mani-tostado.jpg',
      category: 'frutos-secos',
      stock: 20
    },
    {
      _id: '5',
      name: 'Nuez partida clara',
      description: 'Nueces partidas de primera calidad, ricas en omega-3 y antioxidantes naturales.',
      price: 11990,
      image: '/images/nuez-partida.jpg',
      category: 'frutos-secos',
      stock: 6
    },
    {
      _id: '6',
      name: 'Coco chips natural',
      description: 'Chips de coco natural deshidratado, sin azúcares añadidos. Perfecto para postres y smoothies.',
      price: 11990,
      image: '/images/coco-chips.jpg',
      category: 'frutos-deshidratados',
      stock: 10
    },
    {
      _id: '7',
      name: 'Mix frutos morenos',
      description: 'Mezcla premium de frutos secos morenos, seleccionados por su calidad y sabor excepcional.',
      price: 8990,
      image: '/images/mix-morenos.jpg',
      category: 'frutos-secos',
      stock: 4
    },
    {
      _id: '8',
      name: 'Mix frutos rubios',
      description: 'Selección especial de frutos secos rubios, perfecta combinación de sabores y texturas.',
      price: 10990,
      image: '/images/mix-rubios.jpg',
      category: 'frutos-secos',
      stock: 7
    }
  ]

  // Obtener productos recomendados (excluyendo el producto actual)
  const getRecommendedProducts = () => {
    return sampleProducts.filter(p => p._id !== params.id).slice(0, 8)
  }

  const recommendedProducts = getRecommendedProducts()
  const totalSlides = Math.ceil(recommendedProducts.length / 5)

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      try {
        // Intentar cargar desde API
        const response = await fetch(`http://localhost:5000/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          // Si falla la API, buscar en productos de ejemplo
          const foundProduct = sampleProducts.find(p => p._id === params.id)
          setProduct(foundProduct || null)
        }
      } catch (error) {
        console.log('API no disponible, buscando en productos de ejemplo')
        const foundProduct = sampleProducts.find(p => p._id === params.id)
        setProduct(foundProduct || null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  // Establecer peso por defecto cuando se carga el producto
  useEffect(() => {
    if (product && !selectedWeight) {
      setSelectedWeight(weightOptions[1]) // 250g por defecto
    }
  }, [product])

  const getCurrentPrice = () => {
    if (!product || !selectedWeight) return 0
    return Math.round(product.price * selectedWeight.multiplier)
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

  const hideCartOptions = () => {
    setShowCartOptions(false)
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
              <img 
                src={product.image || '/placeholder-product.jpg'} 
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.jpg'
                }}
              />
            </div>
            
            <div className={styles.productInfo}>
              <h1 className={styles.productName}>{product.name}</h1>
              
              <div className={styles.productPrice}>
                ${getCurrentPrice().toLocaleString('es-CL')}
                {selectedWeight && (
                  <span className={styles.weightInfo}> / {selectedWeight.weight}</span>
                )}
              </div>
              
              <div className={styles.productDescription}>
                <p>{product.description}</p>
              </div>
              
              <div className={styles.stockInfo}>
                {product.stock > 0 ? (
                  <span className={styles.inStock}>
                    <i className="fas fa-check-circle"></i>
                    {product.stock} unidades disponibles
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
                {/* Selector de peso */}
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
                        disabled={product.stock === 0}
                      >
                        <span className={styles.weightLabel}>{option.weight}</span>
                        <span className={styles.weightPrice}>
                          ${Math.round(product.price * option.multiplier).toLocaleString('es-CL')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de cantidad */}
                <div className={styles.quantitySelector}>
                  <label className={styles.selectorLabel}>Cantidad:</label>
                  <div className={styles.quantityControls}>
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className={styles.quantityBtn}
                      disabled={product.stock === 0}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className={styles.quantityBtn}
                      disabled={product.stock === 0}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Botón agregar al carrito */}
                <button 
                  onClick={addToCart}
                  className={styles.addToCartBtn}
                  disabled={product.stock === 0 || !selectedWeight}
                >
                  <i className="fas fa-cart-plus"></i>
                  {product.stock === 0 ? 'Agotado' : 
                   !selectedWeight ? 'Selecciona un peso' : 
                   'Agregar al carrito'}
                </button>
                
                {/* Mensaje de éxito */}
                {showSuccessMessage && (
                  <div className={styles.successMessage}>
                    <i className="fas fa-check-circle"></i>
                    ¡Producto agregado al carrito con éxito!
                  </div>
                )}
                
                {/* Opciones del carrito - SIN botón cerrar */}
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
        </div>
        
        {/* Carrusel de productos recomendados - FUERA del container del producto */}
        <section className={styles.recommendedSection}>
          <div className={styles.container}>
            <h2 className={styles.recommendedTitle}>Productos Recomendados</h2>
            
            <div className={styles.carouselContainer}>
              <div className={styles.carousel}>
                <button 
                  onClick={prevSlide}
                  className={`${styles.carouselBtn} ${styles.prevBtn}`}
                  disabled={totalSlides <= 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
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
                                <img 
                                  src={product.image || '/placeholder-product.jpg'} 
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-product.jpg'
                                  }}
                                />
                                <div className={styles.hoverOverlay}>
                                  <i className="fas fa-eye"></i>
                                  <span>Ver Producto</span>
                                </div>
                              </div>
                              
                              <div className={styles.productDetails}>
                                <h3 className={styles.productTitle}>{product.name}</h3>
                                <div className={styles.productPrice}>
                                  ${product.price.toLocaleString('es-CL')}
                                </div>
                                <div className={styles.productStock}>
                                  {product.stock > 0 ? (
                                    <span className={styles.inStock}>
                                      <i className="fas fa-check-circle"></i>
                                      En stock
                                    </span>
                                  ) : (
                                    <span className={styles.outOfStock}>
                                      <i className="fas fa-times-circle"></i>
                                      Agotado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={nextSlide}
                  className={`${styles.carouselBtn} ${styles.nextBtn}`}
                  disabled={totalSlides <= 1}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              
              {/* Indicadores de slide */}
              {totalSlides > 1 && (
                <div className={styles.carouselIndicators}>
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`${styles.indicator} ${
                        currentSlide === index ? styles.active : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}