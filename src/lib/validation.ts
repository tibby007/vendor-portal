// Shared validation utilities for security

export interface PasswordValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Validates password strength
 * Requirements:
 * - Minimum 12 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 12) {
    return {
      isValid: false,
      error: 'Password must be at least 12 characters',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    }
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character (!@#$%^&*)',
    }
  }

  return { isValid: true, error: null }
}

/**
 * Returns password requirements as a list for display
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 12 characters',
    'One lowercase letter (a-z)',
    'One uppercase letter (A-Z)',
    'One number (0-9)',
    'One special character (!@#$%^&*)',
  ]
}
