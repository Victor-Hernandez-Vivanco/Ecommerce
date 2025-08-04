export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  // Verificar si es requerido
  if (rules.required && (!value || value.trim().length === 0)) {
    return 'Este campo es requerido'
  }

  // Si el campo está vacío y no es requerido, no validar más
  if (!value || value.trim().length === 0) {
    return null
  }

  // Verificar longitud mínima
  if (rules.minLength && value.length < rules.minLength) {
    return `Debe tener al menos ${rules.minLength} caracteres`
  }

  // Verificar longitud máxima
  if (rules.maxLength && value.length > rules.maxLength) {
    return `No puede tener más de ${rules.maxLength} caracteres`
  }

  // Verificar patrón
  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Formato inválido'
  }

  // Validación personalizada
  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

export const validateForm = (data: {[key: string]: string}, rules: ValidationRules): {[key: string]: string} => {
  const errors: {[key: string]: string} = {}

  Object.keys(rules).forEach(field => {
    const error = validateField(data[field] || '', rules[field])
    if (error) {
      errors[field] = error
    }
  })

  return errors
}

// Reglas de validación predefinidas
export const authValidationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return 'Solo se permiten letras y espacios'
      }
      return null
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Ingresa un email válido'
      }
      return null
    }
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 100,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Debe contener al menos una mayúscula, una minúscula y un número'
      }
      return null
    }
  }
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  // Check for common passwords
  const commonPasswords = ['password', '123456', 'admin', 'qwerty'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('No debe contener palabras comunes');
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    if (password.length >= 12) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}