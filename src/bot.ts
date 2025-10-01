import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import { config } from "./config/env.ts"
import { registerCommands } from "./handlers/commands.ts"
import type { BotContext } from "./types/index.ts"

/**
 * Main bot initialization and startup
 */
async function main() {
  console.log("🤖 Starting Payecards Bot...")

  // Initialize bot with token
  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  // Register command handlers
  registerCommands(bot)

  // Error handling for bot
  bot.catch((err) => {
    console.error("❌ Bot error occurred:", err)
  })

  // Start bot with long polling
  console.log("✅ Bot is running! Press Ctrl+C to stop.")
  await bot.start()
}

// Handle graceful shutdown
Deno.addSignalListener("SIGINT", () => {
  console.log("\n👋 Shutting down bot...")
  Deno.exit(0)
})

Deno.addSignalListener("SIGTERM", () => {
  console.log("\n👋 Shutting down bot...")
  Deno.exit(0)
})

// Start the bot
if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error("❌ Fatal error:", error)
    Deno.exit(1)
  }
}
