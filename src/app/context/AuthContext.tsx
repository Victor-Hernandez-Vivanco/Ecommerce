'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role?: string // ✅ Agregar role opcional
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Error en la autenticación'
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
          } else {
            localStorage.removeItem('token')
            dispatch({ type: 'LOGOUT' })
          }
        } catch (error) {
          console.error('Error verificando token:', error)
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      console.log('🔄 Intentando login:', { email })
      
      const response = await fetch('/api/auth/login', {
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
      
      const response = await fetch('/api/auth/register', {
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