'use client'

import { useState, useEffect } from 'react'
import styles from './Carousel.module.css'

const slides = [
  {
    id: 1,
    title: 'Almendras Premium',
    description: 'Frescas y naturales, directamente del campo',
    image: '/images/almendras-banner.jpg'
  },
  {
    id: 2,
    title: 'Nueces Selectas',
    description: 'Rica en omega-3 y antioxidantes naturales',
    image: '/images/nueces-banner.jpg'
  },
  {
    id: 3,
    title: 'Pistachos Gourmet',
    description: 'Sabor único y textura incomparable',
    image: '/images/pistachos-banner.jpg'
  }
]

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.carouselContainer}>
      <div className={styles.carousel}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.carouselSlide} ${index === currentSlide ? styles.active : ''}`}
          >
            <div className={styles.slideBackground}>
              {/* Placeholder para imagen */}
              <div className={styles.imagePlaceholder}>
                <i className="fas fa-image"></i>
              </div>
            </div>
            <div className={styles.carouselContent}>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <button className="btn btn-primary">Ver Productos</button>
            </div>
          </div>
        ))}
      </div>
      
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
    </section>
  )
}