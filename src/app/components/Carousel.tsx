'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Carousel.module.css'

interface Product {
  _id: string
  name: string
  description: string
  image: string
  featured: boolean
}

interface CarouselSlide {
  id: string
  title: string
  description: string
  image: string
  productId?: string
}

// Slides por defecto si no hay productos
const defaultSlides: CarouselSlide[] = [
  {
    id: 'default-1',
    title: 'Bienvenido a Frutos Secos Premium',
    description: 'Descubre nuestra selección de productos naturales y saludables',
    image: '/placeholder-banner.jpg'
  },
  {
    id: 'default-2',
    title: 'Calidad Garantizada',
    description: 'Productos frescos y naturales, directamente del campo',
    image: '/placeholder-banner.jpg'
  },
  {
    id: 'default-3',
    title: 'Nutrición y Sabor',
    description: 'Rica en nutrientes y con el mejor sabor natural',
    image: '/placeholder-banner.jpg'
  }
]

export default function Carousel() {
  const router = useRouter()
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      
      // Cargar productos destacados
      const response = await fetch('/api/products/featured')
      
      if (response.ok) {
        const products: Product[] = await response.json()
        
        if (products.length > 0) {
          // Convertir productos a slides (máximo 5)
          const productSlides: CarouselSlide[] = products.slice(0, 5).map(product => ({
            id: product._id,
            title: product.name,
            description: product.description,
            image: product.image || '/placeholder-banner.jpg',
            productId: product._id
          }))
          
          setSlides(productSlides)
        } else {
          // Si no hay productos destacados, usar slides por defecto
          setSlides(defaultSlides)
        }
      } else {
        // Si falla la API, usar slides por defecto
        setSlides(defaultSlides)
      }
    } catch (error) {
      console.error('Error cargando productos para carousel:', error)
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleSlideClick = (slide: CarouselSlide) => {
    if (slide.productId) {
      router.push(`/productos/${slide.productId}`)
    } else {
      router.push('/productos')
    }
  }

  useEffect(() => {
    if (!loading && slides.length > 1) {
      const interval = setInterval(nextSlide, 5000)
      return () => clearInterval(interval)
    }
  }, [loading, nextSlide, slides.length])

  if (loading) {
    return (
      <section className={styles.carouselContainer}>
        <div className={styles.carouselLoading}>
          <div className={styles.loadingSkeleton}></div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.carouselContainer}>
      <div className={styles.carousel}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.carouselSlide} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => handleSlideClick(slide)}
          >
            <div className={styles.slideBackground}>
              {slide.image && slide.image !== '/placeholder-banner.jpg' ? (
               
                <image
                  href={slide.image}
                  aria-label={slide.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-banner.jpg'
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <i className="fas fa-image"></i>
                </div>
              )}
            </div>
            <div className={styles.carouselContent}>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <button className="btn btn-primary">
                {slide.productId ? 'Ver Producto' : 'Ver Productos'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {slides.length > 1 && (
        <>
          <button className={styles.carouselBtn + ' ' + styles.prevBtn} onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className={styles.carouselBtn + ' ' + styles.nextBtn} onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>
          
          <div className={styles.carouselIndicators}>
            {slides.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </section>
  )
}