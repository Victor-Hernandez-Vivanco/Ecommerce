'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true })
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            dispatch({ type: 'LOGIN_SUCCESS', payload: userData.user })
          } else {
            localStorage.removeItem('token')
            dispatch({ type: 'LOGIN_FAILURE' })
          }
        } catch  {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGIN_FAILURE' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      console.log('🔄 Intentando login:', { email })
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Respuesta del login:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error en login:', errorData)
        throw new Error(errorData.message || 'Error en el login')
      }

      const data = await response.json()
      console.log('✅ Login exitoso:', data.user)
      
      localStorage.setItem('token', data.token)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
    } catch (error) {
      console.error('❌ Error en login:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      console.log('🔄 Enviando datos de registro:', {
        name: userData.name,
        email: userData.email,
        password: '***'
      })
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password
        })
      })

      console.log('📡 Respuesta del servidor:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error del servidor:', errorData)
        throw new Error(errorData.message || 'Error en el registro')
      }

      const data = await response.json()
      console.log('✅ Registro exitoso:', data.user)
      
      localStorage.setItem('token', data.token)
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
    } catch (error) {
      console.error('❌ Error en registro:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}