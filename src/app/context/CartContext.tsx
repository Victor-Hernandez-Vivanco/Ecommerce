'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// Interfaces
interface CartItem {
  productId: string
  name: string
  price: number
  weight: number
  quantity: number
  image: string
  total: number
  stock?: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  loading: boolean
}

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'total'>) => void
  removeFromCart: (productId: string, weight: number) => void
  updateQuantity: (productId: string, weight: number, quantity: number) => void
  clearCart: () => void
  loadCart: () => void
}

// ✅ INTERFAZ PARA DATOS RAW DEL LOCALSTORAGE
interface RawCartItem {
  productId?: string
  name?: string
  price?: unknown
  weight?: unknown
  quantity?: unknown
  image?: string
  total?: number
  stock?: number
}

// Actions
type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; weight: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; weight: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      const loadedItems = action.payload
      return {
        ...state,
        items: loadedItems,
        totalItems: loadedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: loadedItems.reduce((sum, item) => sum + item.total, 0),
        loading: false
      }

    case 'ADD_TO_CART':
      const newItem = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.productId === newItem.productId && item.weight === newItem.weight
      )

      let updatedItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        updatedItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + newItem.quantity
            return {
              ...item,
              quantity: newQuantity,
              total: item.price * newQuantity
            }
          }
          return item
        })
      } else {
        // Agregar nuevo item
        updatedItems = [...state.items, { ...newItem, total: newItem.price * newItem.quantity }]
      }

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + item.total, 0)
      }

    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(
        item => !(item.productId === action.payload.productId && item.weight === action.payload.weight)
      )
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: filteredItems.reduce((sum, item) => sum + item.total, 0)
      }

    case 'UPDATE_QUANTITY':
      const { productId, weight, quantity } = action.payload
      const updatedQuantityItems = state.items.map(item => {
        if (item.productId === productId && item.weight === weight) {
          return {
            ...item,
            quantity: Math.max(1, quantity),
            total: item.price * Math.max(1, quantity)
          }
        }
        return item
      })
      return {
        ...state,
        items: updatedQuantityItems,
        totalItems: updatedQuantityItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedQuantityItems.reduce((sum, item) => sum + item.total, 0)
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }

    default:
      return state
  }
}

// Estado inicial
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: true
}

// Contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    loadCart()
  }, [])

  // Sincronizar con localStorage cuando cambie el estado
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  }, [state.items, state.loading])

  const loadCart = () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cartData: RawCartItem[] = JSON.parse(savedCart)
        // ✅ VALIDAR estructura de datos con tipos específicos
        const validatedCart = cartData.filter((item: RawCartItem) => {
          return (
            item.productId &&
            item.name &&
            typeof item.price === 'number' &&
            typeof item.weight === 'number' &&
            typeof item.quantity === 'number' &&
            item.image
          )
        }).map((item: RawCartItem) => ({
          productId: item.productId!,
          name: item.name!,
          price: item.price as number,
          weight: item.weight as number,
          quantity: item.quantity as number,
          image: item.image!,
          total: item.total || ((item.price as number) * (item.quantity as number)),
          stock: item.stock || 999
        }))
        dispatch({ type: 'LOAD_CART', payload: validatedCart })
      } else {
        dispatch({ type: 'LOAD_CART', payload: [] })
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      localStorage.removeItem('cart')
      dispatch({ type: 'LOAD_CART', payload: [] })
    }
  }

  const addToCart = (item: Omit<CartItem, 'total'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item as CartItem })
  }

  const removeFromCart = (productId: string, weight: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, weight } })
  }

  const updateQuantity = (productId: string, weight: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weight, quantity } })
  }

  const clearCart = () => {
    localStorage.removeItem('cart')
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{
      state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook personalizado
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}