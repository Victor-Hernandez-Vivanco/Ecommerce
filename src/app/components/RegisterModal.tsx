'use client'

import { useState } from 'react'
import Modal from './Modal'
import styles from './AuthModal.module.css'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onRegister: (userData: RegisterData) => Promise<void>
  onSwitchToLogin: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterModal({ isOpen, onClose, onRegister, onSwitchToLogin }: RegisterModalProps) {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await onRegister(formData)
      onClose()
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    } catch  {
      setErrors({ general: 'Error al registrarse. Intenta nuevamente.' })
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
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Cuenta">
      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i>
            {errors.general}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            <i className="fas fa-user"></i>
            Nombre completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Tu nombre completo"
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </div>
        
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
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            <i className="fas fa-lock"></i>
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Creando cuenta...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              Crear Cuenta
            </>
          )}
        </button>
        
        <div className={styles.authSwitch}>
          <span>¿Ya tienes cuenta?</span>
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className={styles.switchButton}
          >
            Inicia sesión aquí
          </button>
        </div>
      </form>
    </Modal>
  )
}