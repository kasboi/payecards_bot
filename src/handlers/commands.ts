import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts";
import type { BotContext } from "../types/index.ts";

/**
 * Register all command handlers
 */
export function registerCommands(bot: Bot<BotContext>) {
  // /start command - Welcome message
  bot.command("start", async (ctx) => {
    const firstName = ctx.from?.first_name || "there";

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
    `.trim();

    await ctx.reply(welcomeMessage);
  });

  // /help command
  bot.command("help", async (ctx) => {
    const helpMessage = `
🤖 **Payecards Bot Help**

**Available Commands:**
/start - Welcome message and overview
/register - Register your account with username and email
/crypto [coin] - Get current cryptocurrency prices
/help - Show this help message

**Need Support?**
Contact: egideonchuks@payecards.com

**About:**
This bot provides cryptocurrency price tracking and user management features.
    `.trim();

    await ctx.reply(helpMessage, { parse_mode: "Markdown" });
  });
}
