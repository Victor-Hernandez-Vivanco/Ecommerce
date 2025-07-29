'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Carousel.module.css'

interface Product {
  _id: string
  name: string
  description: string
  images?: Array<{
    url: string
    isPrimary: boolean
  }>
  image?: string
  isAdvertisement: boolean
}

interface CarouselSlide {
  id: string
  title: string
  description: string
  image: string
  productId?: string
}

// Slides por defecto con gradientes atractivos
const defaultSlides: CarouselSlide[] = [
  {
    id: 'default-1',
    title: 'Bienvenido a Frutos Secos Premium',
    description: 'Descubre nuestra selección de productos naturales y saludables, directamente del campo a tu mesa',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'default-2',
    title: 'Calidad Garantizada',
    description: 'Productos frescos y naturales, cuidadosamente seleccionados para ofrecerte la mejor calidad',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'default-3',
    title: 'Nutrición y Sabor',
    description: 'Rica en nutrientes y con el mejor sabor natural. Alimenta tu cuerpo de forma saludable',
    image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
]

export default function Carousel() {
  const router = useRouter()
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdvertisementProducts()
  }, [])

  // Función helper para obtener imagen principal
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary)
      return primaryImage ? primaryImage.url : product.images[0].url
    }
    return product.image || defaultSlides[0].image
  }

  // Cargar productos de publicidad
  const loadAdvertisementProducts = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/products/advertisement')
      
      if (response.ok) {
        const products: Product[] = await response.json()
        
        if (products.length > 0) {
          // Convertir productos a slides (máximo 5)
          const productSlides: CarouselSlide[] = products.slice(0, 5).map(product => ({
            id: product._id,
            title: product.name,
            description: product.description,
            image: getProductImage(product),
            productId: product._id
          }))
          
          setSlides(productSlides)
        } else {
          // Si no hay productos de publicidad, usar slides por defecto
          console.log('No hay productos de publicidad, usando slides por defecto')
          setSlides(defaultSlides)
        }
      } else {
        console.log('Error en la API, usando slides por defecto')
        setSlides(defaultSlides)
      }
    } catch (error) {
      console.error('Error cargando productos de publicidad para carousel:', error)
      setSlides(defaultSlides)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-advance slides
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(nextSlide, 5000)
      return () => clearInterval(interval)
    }
  }, [nextSlide, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleSlideClick = (slide: CarouselSlide) => {
    if (slide.productId) {
      router.push(`/productos/${slide.productId}`)
    }
  }

  // Función para determinar el estilo de fondo
  const getSlideStyle = (slide: CarouselSlide) => {
    if (slide.image.startsWith('linear-gradient')) {
      return {
        background: slide.image,
        cursor: slide.productId ? 'pointer' : 'default'
      }
    } else {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
        cursor: slide.productId ? 'pointer' : 'default'
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.carousel}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.slidesContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => handleSlideClick(slide)}
            style={getSlideStyle(slide)}
          >
            <div className={styles.slideContent}>
              <h2 className={styles.slideTitle}>{slide.title}</h2>
              <p className={styles.slideDescription}>{slide.description}</p>
              {slide.productId && (
                <button className={styles.slideButton}>
                  Ver Producto
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            ‹
          </button>
          <button
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={nextSlide}
            aria-label="Siguiente slide"
          >
            ›
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className={styles.dotsContainer}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}