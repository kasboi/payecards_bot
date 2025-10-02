import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import { config } from "./config/env.ts"
import { connectDB, closeDB } from "./database/connection.ts"
import { registerCommands } from "./handlers/commands.ts"
import { registerRegistrationHandlers } from "./handlers/registration.ts"
import { registerCryptoHandlers } from "./handlers/crypto.ts"
import { registerBroadcastHandlers } from "./handlers/broadcast.ts"
import { sessionMiddleware } from "./middleware/session.ts"
import { errorHandler } from "./middleware/error.ts"
import { createLogger } from "./utils/logger.ts"
import type { BotContext } from "./types/index.ts"

const logger = createLogger("Bot")

/**
 * Main bot initialization and startup
 */
async function main() {
  logger.info("Starting Payecards Bot...")

  // Connect to MongoDB first
  try {
    await connectDB()
  } catch (error) {
    logger.error("Failed to connect to database. Exiting...", error)
    Deno.exit(1)
  }

  // Initialize bot with token
  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  // Apply session middleware first (before handlers)
  bot.use(sessionMiddleware)
  logger.info("Session middleware enabled")

  // Register all handlers
  registerCommands(bot)
  registerRegistrationHandlers(bot)
  registerCryptoHandlers(bot)
  registerBroadcastHandlers(bot)

  // Register error handler
  bot.catch(errorHandler)

  // Start bot with long polling
  logger.info("Bot is running! Press Ctrl+C to stop.")
  logger.info(`Admin IDs: ${config.ADMIN_IDS.join(", ")}`)
  await bot.start()
}

// Handle graceful shutdown
const shutdown = async () => {
  logger.info("Shutting down bot...")
  await closeDB()
  Deno.exit(0)
}

Deno.addSignalListener("SIGINT", shutdown)
Deno.addSignalListener("SIGTERM", shutdown)

// Start the bot
if (import.meta.main) {
  main().catch((error) => {
    logger.error("Fatal error", error)
    Deno.exit(1)
  })
}
