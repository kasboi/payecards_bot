import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import { config } from "../config/env.ts"
import { createLogger } from "./logger.ts"

const logger = createLogger("Commands")

// Define command structure
interface BotCommand {
  command: string
  description: string
}

/**
 * User commands available to all users
 */
const userCommands: BotCommand[] = [
  { command: "start", description: "Welcome message and overview" },
  { command: "register", description: "Register your account" },
  { command: "crypto", description: "Get cryptocurrency prices" },
  { command: "help", description: "Get help and support" },
]

/**
 * Admin commands available only to administrators
 */
const adminCommands: BotCommand[] = [
  ...userCommands,
  { command: "broadcast", description: "Send message to all users" },
  { command: "cancel_broadcast", description: "Cancel active broadcast" },
  { command: "broadcast_history", description: "View broadcast history" },
  { command: "stats", description: "View bot statistics" },
]

/**
 * Set up bot command menus for users and admins
 */
export async function setupBotCommands(bot: Bot<BotContext>): Promise<void> {
  try {
    // Set commands for all users (default scope)
    await bot.api.setMyCommands(userCommands)
    logger.info(`Set ${userCommands.length} commands for all users`)

    // Set commands for each admin user
    for (const adminId of config.ADMIN_IDS) {
      await bot.api.setMyCommands(adminCommands, {
        scope: { type: "chat", chat_id: adminId },
      })
    }
    logger.info(
      `Set ${adminCommands.length} commands for ${config.ADMIN_IDS.length} admin(s)`,
    )
  } catch (error) {
    logger.error("Failed to set bot commands", error)
    // Don't throw - bot can still work without menu commands
  }
}

/**
 * Get all available commands for documentation purposes
 */
export function getAllCommands(): {
  user: BotCommand[]
  admin: BotCommand[]
} {
  return {
    user: userCommands,
    admin: adminCommands,
  }
}
