/**
 * Validate email format
 * @param email Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate username
 * @param username Username to validate
 * @returns Object with isValid flag and error message
 */
export function validateUsername(username: string): {
  isValid: boolean
  error?: string
} {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: "Username cannot be empty" }
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long",
    }
  }

  if (username.length > 50) {
    return { isValid: false, error: "Username must not exceed 50 characters" }
  }

  // Check for valid characters (alphanumeric, underscore, hyphen)
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    }
  }

  return { isValid: true }
}

/**
 * Validate email
 * @param email Email to validate
 * @returns Object with isValid flag and error message
 */
export function validateEmail(email: string): {
  isValid: boolean
  error?: string
} {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email cannot be empty" }
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: "Please provide a valid email address" }
  }

  return { isValid: true }
}
