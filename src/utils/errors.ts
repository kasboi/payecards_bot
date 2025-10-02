/**
 * Application error type
 */
export interface AppError extends Error {
  code: string
  statusCode: number
  originalError?: Error
}

/**
 * Create a base application error
 */
export function createAppError(
  message: string,
  code: string,
  statusCode: number = 500,
  originalError?: Error,
): AppError {
  const error = new Error(message) as AppError
  error.name = "AppError"
  error.code = code
  error.statusCode = statusCode
  error.originalError = originalError
  return error
}

/**
 * Create a validation error
 */
export function createValidationError(message: string): AppError {
  const error = new Error(message) as AppError
  error.name = "ValidationError"
  error.code = "VALIDATION_ERROR"
  error.statusCode = 400
  return error
}

/**
 * Create a not found error
 */
export function createNotFoundError(resource: string): AppError {
  const error = new Error(`${resource} not found`) as AppError
  error.name = "NotFoundError"
  error.code = "NOT_FOUND"
  error.statusCode = 404
  return error
}

/**
 * Create a database error
 */
export function createDatabaseError(
  message: string,
  originalError?: Error,
): AppError {
  const error = new Error(message) as AppError
  error.name = "DatabaseError"
  error.code = "DATABASE_ERROR"
  error.statusCode = 500
  error.originalError = originalError
  return error
}

/**
 * Create an external API error
 */
export function createExternalAPIError(
  service: string,
  message: string,
  originalError?: Error,
): AppError {
  const error = new Error(`${service} API error: ${message}`) as AppError
  error.name = "ExternalAPIError"
  error.code = "EXTERNAL_API_ERROR"
  error.statusCode = 502
  error.originalError = originalError
  return error
}

/**
 * Create an authorization error
 */
export function createUnauthorizedError(
  message = "Unauthorized access",
): AppError {
  const error = new Error(message) as AppError
  error.name = "UnauthorizedError"
  error.code = "UNAUTHORIZED"
  error.statusCode = 401
  return error
}
