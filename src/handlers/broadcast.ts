import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import { adminOnly } from "../middleware/auth.ts"
import {
  broadcastMessage,
  getBroadcastHistory,
} from "../services/broadcast.ts"
import { getUserCount } from "../database/models/user.ts"

// Store broadcast state temporarily
const broadcastState = new Map<number, { step: string; message?: string }>()

/**
 * Register broadcast-related handlers
 */
export function registerBroadcastHandlers(bot: Bot<BotContext>) {
  // /broadcast command - Start broadcast process (admin only)
  bot.command("broadcast", adminOnly, async (ctx) => {
    const adminId = ctx.from?.id
    if (!adminId) return

    const userCount = await getUserCount()

    broadcastState.set(adminId, { step: "composing" })

    await ctx.reply(
      `📢 *Broadcast Message*\n\n` +
      `You are about to send a message to *${userCount} registered users*.\n\n` +
      `Please type your message:\n\n` +
      `⚠️ *Important:*\n` +
      `• Message supports Markdown formatting\n` +
      `• Review carefully before sending\n` +
      `• Use /cancel\\_broadcast to cancel\n\n` +
      `*Examples of Markdown:*\n` +
      `\\*bold\\* or \\*\\*bold\\*\\* for *bold*\n` +
      `\\_italic\\_ for _italic_\n` +
      `\\[text\\]\\(url\\) for links`,
      { parse_mode: "Markdown" },
    )
  })

  // /broadcast_history command - View broadcast history (admin only)
  bot.command("broadcast_history", adminOnly, async (ctx) => {
    const history = await getBroadcastHistory(5)

    if (history.length === 0) {
      await ctx.reply("📭 No broadcast history found.")
      return
    }

    let message = "📊 *Recent Broadcast History*\n\n"

    for (const [index, broadcast] of history.entries()) {
      const date = new Date(broadcast.sentAt).toLocaleString()
      const successRate = (
        (broadcast.successCount / broadcast.recipientCount) *
        100
      ).toFixed(1)

      // Escape special Markdown characters in the preview
      const preview = broadcast.message
        .substring(0, 50)
        .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')

      message += `*${index + 1}\. ${date}*\n`
      message += `📩 Recipients: ${broadcast.recipientCount}\n`
      message += `✅ Success: ${broadcast.successCount} (${successRate}%)\n`
      message += `❌ Failed: ${broadcast.failureCount}\n`
      message += `📝 Preview: ${preview}\.\.\n\n`
    }

    await ctx.reply(message, { parse_mode: "Markdown" })
  })

  // /cancel_broadcast command - Cancel active broadcast
  bot.command("cancel_broadcast", adminOnly, async (ctx) => {
    const adminId = ctx.from?.id
    if (!adminId) return

    const state = broadcastState.get(adminId)
    if (!state) {
      await ctx.reply("ℹ️ No active broadcast to cancel.")
      return
    }

    broadcastState.delete(adminId)
    await ctx.reply("❌ Broadcast cancelled.")
  })

  // Handle broadcast message composition
  bot.on("message:text", async (ctx) => {
    const adminId = ctx.from?.id
    if (!adminId) return

    const state = broadcastState.get(adminId)
    if (!state || state.step !== "composing") return

    const message = ctx.message.text.trim()

    // Save message and show confirmation
    state.message = message
    state.step = "confirming"
    broadcastState.set(adminId, state)

    const userCount = await getUserCount()

    const keyboard = new InlineKeyboard()
      .text("✅ Send Now", "broadcast_confirm")
      .text("❌ Cancel", "broadcast_cancel")

    await ctx.reply(
      `📢 *Broadcast Preview*\n\n` +
      `*Recipients:* ${userCount} users\n\n` +
      `*Message:*\n${message}\n\n` +
      `⚠️ This message will be sent to all registered users\\. Continue?`,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    )
  })

  // Handle broadcast confirmation
  bot.callbackQuery("broadcast_confirm", adminOnly, async (ctx) => {
    const adminId = ctx.from?.id
    if (!adminId) return

    const state = broadcastState.get(adminId)
    if (!state || !state.message) {
      await ctx.answerCallbackQuery(
        "❌ Broadcast session expired. Please start again.",
      )
      return
    }

    await ctx.answerCallbackQuery("📤 Sending broadcast...")
    await ctx.editMessageText("⏳ Sending broadcast message to all users...")

    // Send broadcast
    const result = await broadcastMessage(bot, state.message, adminId)

    // Clear state
    broadcastState.delete(adminId)

    // Send result
    const successRate = ((result.success / result.total) * 100).toFixed(1)

    let resultMessage =
      `✅ *Broadcast Complete\\!*\n\n` +
      `📊 *Statistics:*\n` +
      `• Total Recipients: ${result.total}\n` +
      `• Successfully Sent: ${result.success} (${successRate}%)\n` +
      `• Failed: ${result.failed}\n\n`

    if (result.failed > 0) {
      resultMessage += `⚠️ Some messages failed to deliver\\. This usually happens when:\n`
      resultMessage += `• Users blocked the bot\n`
      resultMessage += `• Users deleted their Telegram account\n`
      resultMessage += `• Network issues occurred\n\n`
    }

    resultMessage += `Use /broadcast\\_history to view past broadcasts\\.`

    await ctx.reply(resultMessage, { parse_mode: "Markdown" })
  })

  // Handle broadcast cancellation
  bot.callbackQuery("broadcast_cancel", async (ctx) => {
    const adminId = ctx.from?.id
    if (!adminId) return

    broadcastState.delete(adminId)

    await ctx.answerCallbackQuery("Broadcast cancelled")
    await ctx.editMessageText("❌ Broadcast cancelled.")
  })
}
