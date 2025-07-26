'use client'

import { useState } from 'react'
import Modal from './Modal'
import styles from './AuthModal.module.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
}

export default function LoginModal({ isOpen, onClose, onLogin, onSwitchToRegister }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await onLogin(formData.email, formData.password)
      onClose()
      setFormData({ email: '', password: '' })
    } catch  {
      setErrors({ general: 'Error al iniciar sesión. Verifica tus credenciales.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Sesión">
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            {errors.general}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            <i className="fas fa-envelope"></i>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu@email.com"
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            <i className="fas fa-lock"></i>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Iniciando sesión...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </>
          )}
        </button>
        
        <div className={styles.authSwitch}>
          <span>¿No tienes cuenta?</span>
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            className={styles.switchButton}
          >
            Regístrate aquí
          </button>
        </div>
      </form>
    </Modal>
  )
}