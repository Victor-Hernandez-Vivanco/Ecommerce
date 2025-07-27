'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './FeaturedProducts.module.css'

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

export default function FeaturedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ✅ FUNCIÓN HELPER PARA OBTENER PRECIO
  const getProductPrice = (product: Product) => {
    if (product.basePricePer100g) {
      return product.basePricePer100g;
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return Math.min(...product.pricesByWeight.map(p => p.price));
    }
    return 0;
  };

  // ✅ FUNCIÓN HELPER PARA OBTENER STOCK
  const getProductStock = (product: Product) => {
    if (product.totalStock !== undefined) {
      return product.totalStock;
    }
    if (product.pricesByWeight && product.pricesByWeight.length > 0) {
      return product.pricesByWeight.reduce((total, p) => total + (p.stock || 0), 0);
    }
    return 0;
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')
        
        // ✅ USAR API REAL DE PRODUCTOS DESTACADOS
        const response = await fetch('/api/products/featured')
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✅ Productos destacados cargados:', data.length)
        
        // ✅ Si no hay productos destacados, mostrar los primeros 6 productos
        if (data.length === 0) {
          console.log('⚠️ No hay productos destacados, cargando productos generales...')
          const allProductsResponse = await fetch('/api/products')
          
          if (allProductsResponse.ok) {
            const allProducts = await allProductsResponse.json()
            setProducts(allProducts.slice(0, 6)) // Mostrar solo los primeros 6
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

  const goToProduct = (productId: string) => {
    router.push(`/productos/${productId}`)
  }

  // ✅ ESTADO DE CARGA
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

  // ✅ ESTADO DE ERROR
  if (error) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <h2 className={styles.title}>Productos Destacados</h2>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>❌ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className={styles.retryBtn}
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ✅ ESTADO SIN PRODUCTOS
  if (products.length === 0) {
    return (
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <h2 className={styles.title}>Productos Destacados</h2>
          <div className={styles.noProductsContainer}>
            <p className={styles.noProductsMessage}>📦 No hay productos destacados disponibles</p>
            <Link href="/productos" className={styles.viewAllBtn}>
              Ver Todos los Productos
            </Link>
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
            <div key={product._id} className={styles.productCard}>
              <div className={styles.imageContainer}>
                {/* ✅ REEMPLAZAR <img> POR <Image> DE NEXT.JS */}
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
                    // ✅ FALLBACK PARA ERRORES
                    const target = e.target as HTMLImageElement
                    target.src ='https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Producto';
                  }}
                />
                
                {/* ✅ MOSTRAR DESCUENTO SI EXISTE */}
                {product.discount && product.discount > 0 && (
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                )}
                
                {/* ✅ MOSTRAR STOCK BAJO */}
                {getProductStock(product) <= 5 && getProductStock(product) > 0 && (
                  <div className={styles.lowStockBadge}>
                    ¡Últimas {getProductStock(product)}!
                  </div>
                )}
                
                <div className={styles.overlay}>
                  <button 
                    className={styles.quickViewBtn}
                    onClick={() => goToProduct(product._id)}
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
                    {/* ✅ CORREGIDO: Usar función helper para precio */}
                    {product.discount && product.discount > 0 ? (
                      <>
                        <span className={styles.originalPrice}>
                          ${getProductPrice(product).toLocaleString()}
                        </span>
                        <span className={styles.discountPrice}>
                          ${Math.round(getProductPrice(product) * (1 - product.discount / 100)).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className={styles.price}>
                        ${getProductPrice(product).toLocaleString()} CLP/100g
                      </span>
                    )}
                  </div>
                  
                  <button 
                    className={styles.addToCartBtn}
                    onClick={() => goToProduct(product._id)}
                    disabled={getProductStock(product) === 0}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    {getProductStock(product) === 0 ? 'Agotado' : 'Agregar'}
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