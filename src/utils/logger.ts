/**
 * Log levels
 */
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

/**
 * Color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  debug: "\x1b[35m", // Magenta
  timestamp: "\x1b[90m", // Gray
}

/**
 * Format timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Get color for log level
 */
function getColor(level: LogLevel): string {
  switch (level) {
    case LogLevel.INFO:
      return colors.info
    case LogLevel.WARN:
      return colors.warn
    case LogLevel.ERROR:
      return colors.error
    case LogLevel.DEBUG:
      return colors.debug
    default:
      return colors.reset
  }
}

/**
 * Base log function
 */
function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = getTimestamp()
  const color = getColor(level)

  const logMessage = `${colors.timestamp}[${timestamp}]${colors.reset} ${color}[${level}]${colors.reset} ${message}`

  console.log(logMessage)

  if (data) {
    console.log(color + JSON.stringify(data, null, 2) + colors.reset)
  }
}

/**
 * Logger interface
 */
export interface Logger {
  info: (message: string, data?: unknown) => void
  warn: (message: string, data?: unknown) => void
  error: (message: string, error?: Error | unknown) => void
  debug: (message: string, data?: unknown) => void
}

/**
 * Create a logger instance
 */
export function createLogger(context: string): Logger {
  return {
    info: (message: string, data?: unknown) => {
      log(LogLevel.INFO, `[${context}] ${message}`, data)
    },

    warn: (message: string, data?: unknown) => {
      log(LogLevel.WARN, `[${context}] ${message}`, data)
    },

    error: (message: string, error?: Error | unknown) => {
      const errorData =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error

      log(LogLevel.ERROR, `[${context}] ${message}`, errorData)
    },

    debug: (message: string, data?: unknown) => {
      log(LogLevel.DEBUG, `[${context}] ${message}`, data)
    },
  }
}
