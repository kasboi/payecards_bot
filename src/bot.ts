import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import { config } from "./config/env.ts"
import { connectDB, closeDB } from "./database/connection.ts"
import { registerCommands } from "./handlers/commands.ts"
import { registerRegistrationHandlers } from "./handlers/registration.ts"
import type { BotContext } from "./types/index.ts"

/**
 * Main bot initialization and startup
 */
async function main() {
  console.log("🤖 Starting Payecards Bot...")

  // Connect to MongoDB first
  try {
    await connectDB()
  } catch (_error) {
    console.error("❌ Failed to connect to database. Exiting...")
    Deno.exit(1)
  }

  // Initialize bot with token
  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  // Register all handlers
  registerCommands(bot)
  registerRegistrationHandlers(bot)

  // Error handling for bot
  bot.catch((err) => {
    console.error("❌ Bot error occurred:", err)
  })

  // Start bot with long polling
  console.log("✅ Bot is running! Press Ctrl+C to stop.")
  await bot.start()
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log("\n👋 Shutting down bot...")
  await closeDB()
  Deno.exit(0)
}

Deno.addSignalListener("SIGINT", shutdown)
Deno.addSignalListener("SIGTERM", shutdown)

// Start the bot
if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error("❌ Fatal error:", error)
    Deno.exit(1)
  }
}
