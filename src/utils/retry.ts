import { createLogger } from "./logger.ts"

const logger = createLogger("Retry")

/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts: number
  delayMs: number
  backoff?: boolean
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  context: string,
): Promise<T> {
  const { maxAttempts, delayMs, backoff = true } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        logger.error(
          `${context}: All ${maxAttempts} attempts failed`,
          lastError,
        )
        throw lastError
      }

      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs

      logger.warn(
        `${context}: Attempt ${attempt} failed, retrying in ${delay}ms...`,
        { error: lastError.message },
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
