import { useState, useCallback } from 'react'
import { ValidationRules, validateForm } from '../utils/validation'

interface UseFormValidationProps {
  initialValues: {[key: string]: string}
  validationRules: ValidationRules
  onSubmit: (values: {[key: string]: string}) => Promise<void> | void
}

export const useFormValidation = ({ initialValues, validationRules, onSubmit }: UseFormValidationProps) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{[key: string]: boolean}>({})

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validar campo individual al perder el foco
    const fieldErrors = validateForm({ [name]: values[name] }, { [name]: validationRules[name] })
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }))
    }
  }, [values, validationRules])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    const formErrors = validateForm(values, validationRules)
    setErrors(formErrors)
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as {[key: string]: boolean})
    setTouched(allTouched)
    
    // Si no hay errores, enviar formulario
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Error en envío de formulario:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validationRules, onSubmit])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors
  }
}