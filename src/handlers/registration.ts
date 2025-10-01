import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import {
  createUser,
  findUserByTelegramId,
  findUserByEmail,
  userExists,
} from "../database/models/user.ts"
import { validateUsername, validateEmail } from "../utils/validation.ts"

// Registration state interface
interface RegistrationState {
  step: string
  data: {
    username?: string
  }
}

// Store registration state temporarily (in production, use session middleware)
const registrationState = new Map<number, RegistrationState>()

/**
 * Register registration-related handlers
 */
export function registerRegistrationHandlers(bot: Bot<BotContext>) {
  // /register command - Start registration process
  bot.command("register", async (ctx) => {
    const telegramId = ctx.from?.id

    if (!telegramId) {
      await ctx.reply("❌ Unable to identify user. Please try again.")
      return
    }

    // Check if user already registered
    const exists = await userExists(telegramId)
    if (exists) {
      const user = await findUserByTelegramId(telegramId)
      await ctx.reply(
        `✅ You are already registered!\n\n` +
        `👤 Username: ${user?.username}\n` +
        `📧 Email: ${user?.email}\n\n` +
        `Use /help to see available commands.`,
      )
      return
    }

    // Start registration process
    registrationState.set(telegramId, { step: "username", data: {} })

    await ctx.reply(
      "📝 *Let's get you registered!*\n\n" +
      "Please enter your desired username:\n" +
      "• 3-50 characters\n" +
      "• Letters, numbers, underscores, and hyphens only\n\n" +
      "Example: john\\_doe or user123\n\n" +
      "Type /cancel to cancel registration.",
      { parse_mode: "Markdown" },
    )
  })

  // /cancel command - Cancel registration
  bot.command("cancel", async (ctx) => {
    const telegramId = ctx.from?.id
    if (telegramId && registrationState.has(telegramId)) {
      registrationState.delete(telegramId)
      await ctx.reply(
        "❌ Registration cancelled. Use /register to start again.",
      )
    } else {
      await ctx.reply("No active registration process to cancel.")
    }
  })

  // Handle text messages during registration
  bot.on("message:text", async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    const state = registrationState.get(telegramId)
    if (!state) return // Not in registration process

    const text = ctx.message.text.trim()

    // Handle username input
    if (state.step === "username") {
      const validation = validateUsername(text)

      if (!validation.isValid) {
        await ctx.reply(
          `❌ ${validation.error}\n\nPlease try again or /cancel:`,
        )
        return
      }

      // Save username and move to email step
      state.data.username = text
      state.step = "email"
      registrationState.set(telegramId, state)

      await ctx.reply(
        `✅ Username "${text}" looks good!\n\n` +
        `📧 Now, please enter your email address:\n\n` +
        `Example: user@example.com\n\n` +
        `Type /cancel to cancel registration.`,
      )
      return
    }

    // Handle email input
    if (state.step === "email") {
      const validation = validateEmail(text)

      if (!validation.isValid) {
        await ctx.reply(
          `❌ ${validation.error}\n\nPlease try again or /cancel:`,
        )
        return
      }

      // Check if email already exists
      const emailLower = text.toLowerCase()
      const existingUser = await findUserByEmail(emailLower)

      if (existingUser) {
        await ctx.reply(
          `❌ This email is already registered!\n\n` +
          `Please use a different email or contact support if this is an error.\n\n` +
          `Type /cancel to cancel registration.`,
        )
        return
      }

      // Create user in database
      try {
        // Username must exist at this point (validated in previous step)
        if (!state.data.username) {
          throw new Error("Username is missing from registration state")
        }

        const newUser = await createUser({
          telegramId,
          username: state.data.username,
          email: emailLower,
          isAdmin: false,
        })

        // Clear registration state
        registrationState.delete(telegramId)

        // Success message with inline keyboard
        const keyboard = new InlineKeyboard().text(
          "📊 Get Crypto Prices",
          "crypto_menu",
        )

        await ctx.reply(
          `🎉 *Registration Successful!*\n\n` +
          `✅ Welcome to Payecards Bot, ${state.data.username}!\n\n` +
          `📝 Your Details:\n` +
          `👤 Username: ${newUser.username}\n` +
          `📧 Email: ${newUser.email}\n` +
          `🆔 Telegram ID: ${newUser.telegramId}\n\n` +
          `You can now use all bot features!\n\n` +
          `Use /help to see available commands.`,
          {
            parse_mode: "Markdown",
            reply_markup: keyboard,
          },
        )

        console.log(
          `✅ New user registered: ${newUser.username} (${newUser.email})`,
        )
      } catch (error) {
        console.error("❌ Error creating user:", error)
        registrationState.delete(telegramId)

        await ctx.reply(
          `❌ An error occurred during registration.\n\n` +
          `Please try again with /register or contact support.`,
        )
      }
    }
  })
}
