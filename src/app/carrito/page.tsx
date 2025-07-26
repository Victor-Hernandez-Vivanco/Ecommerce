'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './carrito.module.css'

interface CartItem {
  id: string
  name: string
  price: number
  weight: string
  quantity: number
  image: string
  stock: number
}

export default function CarritoPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Productos de ejemplo para el carrito
  const sampleCartItems: CartItem[] = [
    {
      id: '1',
      name: 'Coco rallado natural',
      price: 7890,
      weight: '250g',
      quantity: 2,
      image: '/images/coco-rallado.jpg',
      stock: 15
    },
    {
      id: '2',
      name: 'Mix cosavi',
      price: 10990,
      weight: '500g',
      quantity: 1,
      image: '/images/mix-cosavi.jpg',
      stock: 8
    },
    {
      id: '3',
      name: 'Mantequilla maní Riwün',
      price: 3900,
      weight: '250g',
      quantity: 3,
      image: '/images/mantequilla-mani.jpg',
      stock: 12
    }
  ]

  useEffect(() => {
    // Simular carga del carrito
    const loadCart = async () => {
      setLoading(true)
      try {
        // Aquí se cargaría desde localStorage o API
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          // Usar productos de ejemplo
          setCartItems(sampleCartItems)
        }
      } catch (error) {
        console.log('Error cargando carrito, usando datos de ejemplo')
        setCartItems(sampleCartItems)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedQuantity = Math.min(newQuantity, item.stock)
          return { ...item, quantity: updatedQuantity }
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const continueShopping = () => {
    router.push('/productos')
  }

  const proceedToCheckout = () => {
    router.push('/checkout')
  }

  // Cálculos
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const neto = Math.round(subtotal / 1.19)
  const iva = subtotal - neto
  const total = subtotal

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando carrito...</p>
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
          {/* Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Carrito de Compras</h1>
            <p className={styles.itemCount}>
              {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h2>Tu carrito está vacío</h2>
              <p>¡Agrega algunos productos deliciosos a tu carrito!</p>
              <button onClick={continueShopping} className={styles.continueBtn}>
                <i className="fas fa-shopping-bag"></i>
                Ir a productos
              </button>
            </div>
          ) : (
            <div className={styles.cartContent}>
              {/* Lista de productos */}
              <div className={styles.cartItems}>
                <div className={styles.cartHeader}>
                  <span>Producto</span>
                  <span>Precio</span>
                  <span>Cantidad</span>
                  <span>Total</span>
                  <span>Eliminar</span>
                </div>
                
                {cartItems.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.productInfo}>
                      <img 
                        src={item.image || '/placeholder-product.jpg'} 
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg'
                        }}
                      />
                      <div className={styles.productDetails}>
                        <h3>{item.name}</h3>
                        <p className={styles.weight}>{item.weight}</p>
                      </div>
                    </div>
                    
                    <div className={styles.unitPrice}>
                      ${item.price.toLocaleString('es-CL')}
                    </div>
                    
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={styles.quantityBtn}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.quantityBtn}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className={styles.itemTotal}>
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </div>
                    
                    <div className={styles.actions}>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className={styles.removeBtn}
                        title="Eliminar producto"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del pedido */}
              <div className={styles.orderSummary}>
                <h2>Resumen del Pedido</h2>
                
                <div className={styles.summaryRow}>
                  <span>Neto:</span>
                  <span>${neto.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>IVA (19%):</span>
                  <span>${iva.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.summaryRow + ' ' + styles.total}>
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.actions}>
                  <button 
                    onClick={continueShopping}
                    className={styles.continueShoppingBtn}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Seguir comprando
                  </button>
                  
                  <button 
                    onClick={proceedToCheckout}
                    className={styles.checkoutBtn}
                  >
                    <i className="fas fa-credit-card"></i>
                    Proceder al pago
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}