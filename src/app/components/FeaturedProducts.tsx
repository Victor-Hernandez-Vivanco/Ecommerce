'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './FeaturedProducts.module.css'

interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
  featured: boolean
}

export default function FeaturedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo para productos destacados
  const featuredProductsData: Product[] = [
    {
      id: '1',
      name: 'Almendras Premium',
      price: 15.99,
      image: '/images/almendras.jpg',
      description: 'Almendras naturales de la mejor calidad',
      category: 'Frutos Secos',
      featured: true
    },
    {
      id: '2',
      name: 'Nueces de California',
      price: 18.50,
      image: '/images/nueces.jpg',
      description: 'Nueces frescas importadas de California',
      category: 'Frutos Secos',
      featured: true
    },
    {
      id: '3',
      name: 'Pistachos Tostados',
      price: 22.00,
      image: '/images/pistachos.jpg',
      description: 'Pistachos tostados con sal marina',
      category: 'Frutos Secos',
      featured: true
    },
    {
      id: '4',
      name: 'Avellanas Enteras',
      price: 16.75,
      image: '/images/avellanas.jpg',
      description: 'Avellanas enteras sin cáscara',
      category: 'Frutos Secos',
      featured: true
    },
    {
      id: '5',
      name: 'Anacardos Naturales',
      price: 24.99,
      image: '/images/anacardos.jpg',
      description: 'Anacardos naturales sin sal',
      category: 'Frutos Secos',
      featured: true
    },
    {
      id: '6',
      name: 'Mix de Frutos Secos',
      price: 19.99,
      image: '/images/mix.jpg',
      description: 'Mezcla especial de frutos secos premium',
      category: 'Mezclas',
      featured: true
    }
  ]

  useEffect(() => {
    // Simular carga de datos
    const loadProducts = async () => {
      setLoading(true)
      // Aquí podrías hacer fetch a tu API
      // const response = await fetch('http://localhost:5000/api/products/featured')
      // const data = await response.json()
      
      // Por ahora usamos datos de ejemplo
      setTimeout(() => {
        setProducts(featuredProductsData)
        setLoading(false)
      }, 1000)
    }

    loadProducts()
  }, [])

  const goToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  if (loading) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <h2 className={styles.title}>Productos Destacados</h2>
          <div className={styles.loadingGrid}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className={styles.loadingCard}>
                <div className={styles.loadingSkeleton}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Productos Destacados</h2>
        <p className={styles.subtitle}>Descubre nuestra selección premium de frutos secos</p>
        
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className={styles.productImage}
                  onError={(e) => {
                    // Imagen placeholder si no se encuentra la imagen
                    e.currentTarget.src = 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Fruto+Seco'
                  }}
                />
                <div className={styles.overlay}>
                  <button 
                    className={styles.quickViewBtn}
                    onClick={() => goToProduct(product.id)}
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
                  <span className={styles.price}>${product.price}</span>
                  <button 
                    className={styles.addToCartBtn}
                    onClick={() => goToProduct(product.id)}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.viewAllContainer}>
          <Link href="/productos" className={styles.viewAllBtn}>
            <i className="fas fa-arrow-right"></i>
            Ver Todos los Productos
          </Link>
        </div>
      </div>
    </section>
  )
}