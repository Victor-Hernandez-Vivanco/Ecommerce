'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import styles from './carrito.module.css'

export default function CarritoPage() {
  const router = useRouter()
  const { state: cartState, updateQuantity, removeFromCart, clearCart } = useCart()

  const continueShopping = () => {
    router.push('/productos')
  }

  const proceedToCheckout = () => {
    router.push('/checkout')
  }

  // Cálculos
  const subtotal = cartState.totalAmount
  const neto = Math.round(subtotal / 1.19)
  const iva = subtotal - neto
  const total = subtotal

  if (cartState.loading) {
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
            <h1 className={styles.pageTitle}>Mi Carrito</h1>
            <p className={styles.itemCount}>
              {cartState.totalItems} {cartState.totalItems === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>

          {cartState.items.length === 0 ? (
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
                {cartState.items.map(item => (
                  <div key={`${item.productId}-${item.weight}`} className={styles.cartItem}>
                    <div className={styles.productInfo}>
                      <Image 
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        width={60}
                        height={60}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.jpg'
                        }}
                      />
                      <div className={styles.productDetails}>
                        <h3>{item.name}</h3>
                        <p className={styles.weight}>{item.weight}g</p>
                      </div>
                    </div>
                    
                    <div className={styles.unitPrice}>
                      ${item.price.toLocaleString('es-CL')}
                    </div>
                    
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                        className={styles.quantityBtn}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className={styles.itemTotal}>
                      ${item.total.toLocaleString('es-CL')}
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.productId, item.weight)}
                      className={styles.removeBtn}
                      title="Eliminar producto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Resumen del pedido */}
              <div className={styles.orderSummary}>
                <h3>Resumen del Pedido</h3>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Neto:</span>
                  <span>${neto.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>IVA (19%):</span>
                  <span>${iva.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.actions}>
                  <button 
                    onClick={continueShopping}
                    className={styles.continueShoppingBtn}
                  >
                    <i className="fas fa-shopping-bag"></i>
                    Seguir comprando
                  </button>
                  
                  <button 
                    onClick={proceedToCheckout}
                    className={styles.checkoutBtn}
                  >
                    <i className="fas fa-credit-card"></i>
                    Proceder al pago
                  </button>
                  
                  <button 
                    onClick={clearCart}
                    className={styles.clearCartBtn}
                  >
                    <i className="fas fa-trash-alt"></i>
                    Vaciar carrito
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