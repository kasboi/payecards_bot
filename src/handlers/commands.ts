import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import { isAdmin } from "../middleware/auth.ts"

/**
 * Register all command handlers
 */
export function registerCommands(bot: Bot<BotContext>) {
  // /start command - Welcome message
  bot.command("start", async (ctx) => {
    const firstName = ctx.from?.first_name || "there"

    const welcomeMessage = `
👋 Welcome to Payecards Bot, ${firstName}!

I'm here to help you with:
• 📝 User registration
• 💰 Cryptocurrency price tracking
• 📢 Important announcements

Commands:
/start - Show this welcome message
/register - Register your account
/crypto - Get cryptocurrency prices
/help - Get help and support

Let's get started! Use /register to create your account.
    `.trim()

    await ctx.reply(welcomeMessage)
  })

  // /help command
  bot.command("help", async (ctx) => {
    const adminStatus = await isAdmin(ctx)

    let helpMessage = `
🤖 *Payecards Bot Help*

*Available Commands:*
/start - Welcome message and overview
/register - Register your account with username and email
/crypto <coin> - Get current cryptocurrency prices
/help - Show this help message
    `.trim()

    if (adminStatus) {
      helpMessage += `\n\n*Admin Commands:*\n`
      helpMessage += `/broadcast - Send message to all users\n`
      helpMessage += `/cancel\\_broadcast - Cancel active broadcast\n`
      helpMessage += `/broadcast\\_history - View broadcast history\n`
      helpMessage += `/stats - View bot statistics`
    }

    helpMessage += `\n\n*Need Support?*\n`
    helpMessage += `Contact: egideonchuks@payecards\.com\n\n`
    helpMessage += `*About:*\n`
    helpMessage += `This bot provides cryptocurrency price tracking and user management features\\.`

    await ctx.reply(helpMessage, { parse_mode: "Markdown" })
  })

  // /stats command - Show bot statistics (admin only)
  bot.command("stats", async (ctx) => {
    const adminStatus = await isAdmin(ctx)

    if (!adminStatus) {
      await ctx.reply("❌ This command is only available to administrators.")
      return
    }

    // Import here to avoid circular dependency
    const { getUserCount } = await import("../database/models/user.ts")
    const { getBroadcastHistory } = await import("../services/broadcast.ts")

    const userCount = await getUserCount()
    const broadcasts = await getBroadcastHistory(1)
    const lastBroadcast = broadcasts[0]

    let statsMessage =
      `📊 *Bot Statistics*\n\n` + `👥 *Total Users:* ${userCount}\n`

    if (lastBroadcast) {
      const lastDate = new Date(lastBroadcast.sentAt).toLocaleString()
      statsMessage += `\n📢 *Last Broadcast:*\n`
      statsMessage += `• Date: ${lastDate}\n`
      statsMessage += `• Recipients: ${lastBroadcast.recipientCount}\n`
      statsMessage += `• Success: ${lastBroadcast.successCount}\n`
    }

    await ctx.reply(statsMessage, { parse_mode: "Markdown" })
  })
}
