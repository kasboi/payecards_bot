import {
  BotError,
  GrammyError,
  HttpError,
} from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import { createLogger } from "../utils/logger.ts"

const logger = createLogger("ErrorHandler")

/**
 * Error handler middleware for bot errors
 */
export async function errorHandler(err: BotError<BotContext>) {
  const ctx = err.ctx
  const error = err.error

  // Log the error
  logger.error("Bot error occurred", {
    updateId: ctx.update.update_id,
    userId: ctx.from?.id,
    chatId: ctx.chat?.id,
    error: error instanceof Error ? error.message : String(error),
  })

  // Handle different error types
  if (error instanceof GrammyError) {
    await handleGrammyError(ctx, error)
  } else if (error instanceof HttpError) {
    await handleHttpError(ctx, error)
  } else if (error instanceof Error) {
    await handleGenericError(ctx, error)
  } else {
    await handleGenericError(ctx, new Error(String(error)))
  }
}

/**
 * Handle grammY-specific errors
 */
async function handleGrammyError(ctx: BotContext, error: GrammyError) {
  logger.error("grammY error", {
    description: error.description,
    code: error.error_code,
  })

  // Check for common grammY errors
  if (error.description.includes("Forbidden: bot was blocked by the user")) {
    logger.warn("User blocked the bot", { userId: ctx.from?.id })
    // Don't send message if bot is blocked
    return
  }

  if (error.description.includes("message to edit not found")) {
    logger.warn("Message to edit not found")
    return
  }

  if (error.description.includes("message is not modified")) {
    logger.warn("Message content not modified")
    return
  }

  // Send user-friendly error message for other errors
  try {
    await ctx.reply(
      "❌ An error occurred while processing your request.\n\n" +
      "Please try again or contact support if the issue persists.",
    )
  } catch (replyError) {
    logger.error("Failed to send error message to user", replyError)
  }
}

/**
 * Handle HTTP errors (network issues)
 */
async function handleHttpError(ctx: BotContext, error: HttpError) {
  logger.error("HTTP error", {
    message: error.message,
  })

  try {
    await ctx.reply(
      "❌ Network error occurred.\n\n" +
      "Please check your connection and try again.",
    )
  } catch (replyError) {
    logger.error("Failed to send error message to user", replyError)
  }
}

/**
 * Handle generic errors
 */
async function handleGenericError(ctx: BotContext, error: Error) {
  logger.error("Generic error", error)

  try {
    await ctx.reply(
      "❌ An unexpected error occurred.\n\n" +
      "Our team has been notified. Please try again later.",
    )
  } catch (replyError) {
    logger.error("Failed to send error message to user", replyError)
  }
}

/**
 * Wrap async handler with try-catch
 */
export function catchErrors(
  handler: (ctx: BotContext) => Promise<void>,
): (ctx: BotContext) => Promise<void> {
  return async (ctx: BotContext) => {
    try {
      await handler(ctx)
    } catch (error) {
      logger.error("Handler error", error)

      try {
        await ctx.reply(
          "❌ An error occurred while processing your request.\n\n" +
          "Please try again or use /help for assistance.",
        )
      } catch (replyError) {
        logger.error("Failed to send error message", replyError)
      }
    }
  }
}
