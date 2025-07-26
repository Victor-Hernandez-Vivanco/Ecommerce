'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import styles from './checkout.module.css'

interface CartItem {
  id: string
  name: string
  price: number
  weight: string
  quantity: number
  image: string
  stock: number
}

interface ShippingInfo {
  deliveryMethod: 'delivery' | 'pickup'
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  postalCode: string
  notes: string
}

interface PaymentInfo {
  method: 'webpay' | 'mercadopago' | 'transfer'
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    deliveryMethod: 'delivery',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    notes: ''
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'webpay',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  })

  // Productos de ejemplo para el checkout
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
    const loadCart = async () => {
      setLoading(true)
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
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

  const goBackToCart = () => {
    router.push('/carrito')
  }

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    if (step === 1) {
      return cartItems.length > 0
    }
    if (step === 2) {
      const basicInfo = shippingInfo.firstName && shippingInfo.lastName && 
                       shippingInfo.email && shippingInfo.phone
      
      if (shippingInfo.deliveryMethod === 'delivery') {
        return basicInfo && shippingInfo.address && shippingInfo.city && shippingInfo.region
      }
      return basicInfo
    }
    if (step === 3) {
      if (paymentInfo.method === 'transfer') {
        return true // No se requieren datos adicionales para transferencia
      }
      return paymentInfo.cardNumber && paymentInfo.expiryDate && 
             paymentInfo.cvv && paymentInfo.cardName
    }
    return false
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOrder = () => {
    if (validateStep(3)) {
      alert('¡Pedido completado exitosamente!')
      router.push('/')
    }
  }

  // Cálculos
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = shippingInfo.deliveryMethod === 'delivery' ? 2500 : 0
  const neto = Math.round((subtotal + shipping) / 1.19)
  const iva = (subtotal + shipping) - neto
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.emptyCheckout}>
              <h2>No hay productos para procesar</h2>
              <p>Agrega productos a tu carrito antes de proceder al checkout.</p>
              <button onClick={() => router.push('/productos')} className={styles.shopBtn}>
                Ir a productos
              </button>
            </div>
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
            <h1 className={styles.pageTitle}>Checkout</h1>
            <div className={styles.breadcrumb}>
              <span onClick={goBackToCart} className={styles.breadcrumbLink}>Carrito</span>
              <span className={styles.breadcrumbSeparator}>{'>'}</span>
              <span className={styles.breadcrumbCurrent}>Checkout</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className={styles.progressSteps}>
            <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>1</div>
              <span>Revisar Pedido</span>
            </div>
            <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>2</div>
              <span>Información de Envío</span>
            </div>
            <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
              <div className={styles.stepNumber}>3</div>
              <span>Pago</span>
            </div>
          </div>

          <div className={styles.checkoutContent}>
            {/* Step 1: Review Order */}
            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <h2>Revisar tu Pedido</h2>
                <div className={styles.orderReview}>
                  <div className={styles.cartItems}>
                    <div className={styles.cartHeader}>
                      <span>Producto</span>
                      <span>Precio Unitario</span>
                      <span>Cantidad</span>
                      <span>Total</span>
                      <span>Acciones</span>
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
                </div>
              </div>
            )}

            {/* Step 2: Shipping Information */}
            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <h2>Información de Envío</h2>
                
                {/* Delivery Method Selection */}
                <div className={styles.deliveryMethods}>
                  <h3>Método de Entrega</h3>
                  <div className={styles.deliveryOptions}>
                    <label className={styles.deliveryOption}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={shippingInfo.deliveryMethod === 'delivery'}
                        onChange={(e) => handleShippingChange('deliveryMethod', e.target.value as 'delivery')}
                      />
                      <div className={styles.optionContent}>
                        <div className={styles.optionHeader}>
                          <i className="fas fa-truck"></i>
                          <span>Envío a Domicilio</span>
                          <span className={styles.deliveryPrice}>$2.500</span>
                        </div>
                        <p>Entrega en 2-3 días hábiles</p>
                      </div>
                    </label>
                    
                    <label className={styles.deliveryOption}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={shippingInfo.deliveryMethod === 'pickup'}
                        onChange={(e) => handleShippingChange('deliveryMethod', e.target.value as 'pickup')}
                      />
                      <div className={styles.optionContent}>
                        <div className={styles.optionHeader}>
                          <i className="fas fa-store"></i>
                          <span>Retiro en Tienda</span>
                          <span className={styles.deliveryPrice}>Gratis</span>
                        </div>
                        <p>Disponible de Lunes a Viernes de 9:00 a 18:00</p>
                        <p className={styles.storeAddress}>
                          <i className="fas fa-map-marker-alt"></i>
                          Av. Providencia 1234, Providencia, Santiago
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className={styles.shippingForm}>
                  <h3>Información Personal</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nombre *</label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Apellido *</label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Teléfono *</label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        placeholder="+56 9 1234 5678"
                        required
                      />
                    </div>
                  </div>
                  
                  {shippingInfo.deliveryMethod === 'delivery' && (
                    <>
                      <h3>Dirección de Envío</h3>
                      <div className={styles.formGroup}>
                        <label>Dirección *</label>
                        <input
                          type="text"
                          value={shippingInfo.address}
                          onChange={(e) => handleShippingChange('address', e.target.value)}
                          placeholder="Calle, número, departamento"
                          required
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Ciudad *</label>
                          <input
                            type="text"
                            value={shippingInfo.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            placeholder="Tu ciudad"
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Región *</label>
                          <select
                            value={shippingInfo.region}
                            onChange={(e) => handleShippingChange('region', e.target.value)}
                            required
                          >
                            <option value="">Selecciona región</option>
                            <option value="metropolitana">Región Metropolitana</option>
                            <option value="valparaiso">Valparaíso</option>
                            <option value="biobio">Biobío</option>
                            <option value="araucania">La Araucanía</option>
                            <option value="los-lagos">Los Lagos</option>
                            <option value="antofagasta">Antofagasta</option>
                            <option value="coquimbo">Coquimbo</option>
                            <option value="ohiggins">O'Higgins</option>
                            <option value="maule">Maule</option>
                            <option value="atacama">Atacama</option>
                            <option value="los-rios">Los Ríos</option>
                            <option value="tarapaca">Tarapacá</option>
                            <option value="arica-parinacota">Arica y Parinacota</option>
                            <option value="aysen">Aysén</option>
                            <option value="magallanes">Magallanes</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label>Código Postal</label>
                          <input
                            type="text"
                            value={shippingInfo.postalCode}
                            onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                            placeholder="1234567"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label>Notas adicionales</label>
                    <textarea
                      value={shippingInfo.notes}
                      onChange={(e) => handleShippingChange('notes', e.target.value)}
                      placeholder={shippingInfo.deliveryMethod === 'pickup' 
                        ? "Horario preferido para retiro, instrucciones especiales..."
                        : "Instrucciones especiales para la entrega..."}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className={styles.stepContent}>
                <h2>Información de Pago</h2>
                <div className={styles.paymentForm}>
                  <div className={styles.paymentMethods}>
                    <h3>Método de Pago</h3>
                    <div className={styles.paymentOptions}>
                      <label className={styles.paymentMethod}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="webpay"
                          checked={paymentInfo.method === 'webpay'}
                          onChange={(e) => handlePaymentChange('method', e.target.value as 'webpay')}
                        />
                        <div className={styles.paymentContent}>
                          <div className={styles.paymentHeader}>
                            <i className="fas fa-credit-card"></i>
                            <span>Webpay Plus</span>
                          </div>
                          <p>Paga con tarjeta de crédito o débito</p>
                          <div className={styles.paymentLogos}>
                            <span className={styles.cardLogo}>VISA</span>
                            <span className={styles.cardLogo}>MC</span>
                            <span className={styles.cardLogo}>AMEX</span>
                          </div>
                        </div>
                      </label>
                      
                      <label className={styles.paymentMethod}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mercadopago"
                          checked={paymentInfo.method === 'mercadopago'}
                          onChange={(e) => handlePaymentChange('method', e.target.value as 'mercadopago')}
                        />
                        <div className={styles.paymentContent}>
                          <div className={styles.paymentHeader}>
                            <i className="fas fa-mobile-alt"></i>
                            <span>Mercado Pago</span>
                          </div>
                          <p>Paga con tu cuenta de Mercado Pago</p>
                          <div className={styles.paymentFeatures}>
                            <span>• Pago en cuotas</span>
                            <span>• Protección al comprador</span>
                          </div>
                        </div>
                      </label>
                      
                      <label className={styles.paymentMethod}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="transfer"
                          checked={paymentInfo.method === 'transfer'}
                          onChange={(e) => handlePaymentChange('method', e.target.value as 'transfer')}
                        />
                        <div className={styles.paymentContent}>
                          <div className={styles.paymentHeader}>
                            <i className="fas fa-university"></i>
                            <span>Transferencia Bancaria</span>
                          </div>
                          <p>Transfiere directamente a nuestra cuenta</p>
                          <div className={styles.paymentFeatures}>
                            <span>• Sin comisiones adicionales</span>
                            <span>• Confirmación manual</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {(paymentInfo.method === 'webpay' || paymentInfo.method === 'mercadopago') && (
                    <div className={styles.cardForm}>
                      <h3>Información de la Tarjeta</h3>
                      <div className={styles.formGroup}>
                        <label>Nombre en la tarjeta *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardName}
                          onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                          placeholder="Nombre como aparece en la tarjeta"
                          required
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Número de tarjeta *</label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Fecha de vencimiento *</label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                            placeholder="MM/AA"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>CVV *</label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentInfo.method === 'transfer' && (
                    <div className={styles.transferInfo}>
                      <h3>Datos para Transferencia</h3>
                      <div className={styles.bankInfo}>
                        <div className={styles.bankDetails}>
                          <h4>Banco Estado</h4>
                          <div className={styles.accountInfo}>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Tipo de Cuenta:</span>
                              <span>Cuenta Corriente</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Número de Cuenta:</span>
                              <span>12345678-9</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>RUT:</span>
                              <span>12.345.678-9</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Titular:</span>
                              <span>Frutos Secos Premium SpA</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span className={styles.label}>Email:</span>
                              <span>ventas@frutossecos.cl</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.transferInstructions}>
                        <h4>Instrucciones:</h4>
                        <ol>
                          <li>Realiza la transferencia por el monto total: <strong>${total.toLocaleString('es-CL')}</strong></li>
                          <li>Envía el comprobante de transferencia a: <strong>ventas@frutossecos.cl</strong></li>
                          <li>Incluye tu número de pedido en el asunto del email</li>
                          <li>Procesaremos tu pedido una vez confirmado el pago</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary Sidebar */}
            <div className={styles.orderSummary}>
              <h3>Resumen del Pedido</h3>
              
              <div className={styles.summaryItems}>
                {cartItems.map(item => (
                  <div key={item.id} className={styles.summaryItem}>
                    <span className={styles.itemName}>{item.name} ({item.weight})</span>
                    <span className={styles.itemQuantity}>x{item.quantity}</span>
                    <span className={styles.itemPrice}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>
              
              <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CL')}</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Envío:</span>
                  <span>{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`}</span>
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
              </div>
              
              <div className={styles.checkoutActions}>
                {currentStep > 1 && (
                  <button onClick={prevStep} className={styles.prevBtn}>
                    <i className="fas fa-arrow-left"></i>
                    Anterior
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button 
                    onClick={nextStep} 
                    className={styles.nextBtn}
                    disabled={!validateStep(currentStep)}
                  >
                    Siguiente
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button 
                    onClick={completeOrder} 
                    className={styles.completeBtn}
                    disabled={!validateStep(3)}
                  >
                    <i className="fas fa-credit-card"></i>
                    Completar Pedido
                  </button>
                )}
              </div>
              
              <button onClick={goBackToCart} className={styles.backToCartBtn}>
                <i className="fas fa-shopping-cart"></i>
                Volver al carrito
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}