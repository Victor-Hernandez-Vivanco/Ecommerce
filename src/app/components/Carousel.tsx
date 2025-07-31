'use client';

import { useEffect, useState } from 'react';
import styles from './Carousel.module.css';

interface Advertisement {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  type: string;
  order: number;
}

// ✅ CORREGIDO: Slides por defecto SIN imágenes (usando gradientes)
const defaultSlides = [
  {
    _id: 'default-1',
    title: 'Frutos Secos Premium',
    description: 'La mejor calidad en frutos secos naturales',
    imageUrl: '', // ✅ Vacío para usar gradiente
    linkUrl: '/productos',
    type: 'promotion',
    order: 1
  },
  {
    _id: 'default-2', 
    title: 'Ofertas Especiales',
    description: 'Descuentos en productos seleccionados',
    imageUrl: '', // ✅ Vacío para usar gradiente
    linkUrl: '/productos',
    type: 'promotion',
    order: 2
  },
  {
    _id: 'default-3',
    title: 'Envío Gratis',
    description: 'En compras superiores a $25.000 RM',
    imageUrl: '', // ✅ Vacío para usar gradiente
    linkUrl: '/productos',
    type: 'promotion',
    order: 3
  }
];

export default function Carousel() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdvertisements();
  }, []);

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % advertisements.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [advertisements.length]);

  const loadAdvertisements = async () => {
    try {
      const response = await fetch('/api/advertisements/active');
      if (response.ok) {
        const data = await response.json();
        if (data.advertisements && data.advertisements.length > 0) {
          setAdvertisements(data.advertisements);
        }
      }
    } catch (error) {
      console.error('Error cargando advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideClick = async (advertisement: Advertisement) => {
    if (!advertisement._id.startsWith('default-')) {
      try {
        await fetch(`/api/advertisements/${advertisement._id}/click`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error registrando click:', error);
      }
    }

    if (advertisement.linkUrl) {
      if (advertisement.linkUrl.startsWith('http')) {
        window.open(advertisement.linkUrl, '_blank');
      } else {
        window.location.href = advertisement.linkUrl;
      }
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? advertisements.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % advertisements.length);
  };

  // ✅ MEJORADO: Función para obtener el estilo de fondo
  const getSlideStyle = (advertisement: Advertisement, index: number) => {
    if (advertisement.imageUrl) {
      return {
        backgroundImage: `url(${advertisement.imageUrl})`
      };
    }
    
    // ✅ GRADIENTES DIFERENTES para cada slide por defecto
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Azul-Púrpura
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Rosa-Rojo
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'  // Azul-Cian
    ];
    
    return {
      background: gradients[index % gradients.length]
    };
  };

  if (loading) {
    return (
      <div className={styles.carousel}>
        <div className={styles.loadingSlide}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.slidesContainer}>
        {advertisements.map((advertisement, index) => (
          <div
            key={advertisement._id}
            className={`${styles.slide} ${
              index === currentSlide ? styles.active : ''
            }`}
            onClick={() => handleSlideClick(advertisement)}
            style={getSlideStyle(advertisement, index)}
          >
            {/* ✅ AGREGADO: Contenido de texto para slides por defecto */}
            {advertisement._id.startsWith('default-') && (
              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{advertisement.title}</h2>
                <p className={styles.slideDescription}>{advertisement.description}</p>
                <button className={styles.slideButton}>
                  Ver Productos
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navegación */}
      {advertisements.length > 1 && (
        <>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={goToPrevious}
            aria-label="Slide anterior"
          >
            ‹
          </button>
          
          <button 
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={goToNext}
            aria-label="Siguiente slide"
          >
            ›
          </button>

          <div className={styles.indicators}>
            {advertisements.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${
                  index === currentSlide ? styles.active : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}