import { Bot } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import { getAllUsers } from "../database/models/user.ts"
import { getDB } from "../database/connection.ts"

/**
 * Broadcast result interface
 */
export interface BroadcastResult {
  total: number
  success: number
  failed: number
  errors: Array<{ userId: number; error: string }>
}

/**
 * Broadcast a message to all registered users
 * @param bot Bot instance
 * @param message Message to broadcast
 * @param adminId Admin who initiated the broadcast
 * @returns Broadcast result statistics
 */
export async function broadcastMessage(
  bot: Bot<BotContext>,
  message: string,
  adminId: number,
): Promise<BroadcastResult> {
  const users = await getAllUsers()
  const result: BroadcastResult = {
    total: users.length,
    success: 0,
    failed: 0,
    errors: [],
  }

  console.log(`📢 Starting broadcast to ${users.length} users...`)

  // Add header to broadcast message
  const broadcastMessage = `📢 *Broadcast from Payecards*\n\n${message}`

  // Send to each user with delay to avoid rate limits
  for (const user of users) {
    try {
      await bot.api.sendMessage(user.telegramId, broadcastMessage, {
        parse_mode: "Markdown",
      })
      result.success++

      // Small delay to avoid hitting rate limits (50ms)
      await new Promise((resolve) => setTimeout(resolve, 50))
    } catch (error) {
      result.failed++
      result.errors.push({
        userId: user.telegramId,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      console.error(
        `❌ Failed to send to user ${user.telegramId}:`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  // Save broadcast history to database
  await saveBroadcastHistory({
    adminId,
    message,
    sentAt: new Date(),
    recipientCount: result.total,
    successCount: result.success,
    failureCount: result.failed,
  })

  console.log(
    `✅ Broadcast complete: ${result.success}/${result.total} sent successfully`,
  )

  return result
}

/**
 * Broadcast history interface
 */
export interface BroadcastHistory {
  adminId: number
  message: string
  sentAt: Date
  recipientCount: number
  successCount: number
  failureCount: number
}

/**
 * Save broadcast history to database
 */
async function saveBroadcastHistory(history: BroadcastHistory): Promise<void> {
  const db = getDB()
  const collection = db.collection<BroadcastHistory>("broadcasts")

  // Ensure all fields are properly typed
  const document: BroadcastHistory = {
    adminId: Number(history.adminId),
    message: String(history.message),
    sentAt: new Date(history.sentAt),
    recipientCount: Number(history.recipientCount),
    successCount: Number(history.successCount),
    failureCount: Number(history.failureCount),
  }

  try {
    // Log what we're trying to insert for debugging
    console.log("📝 Attempting to save broadcast history:", {
      adminId: document.adminId,
      messageLength: document.message.length,
      sentAt: document.sentAt,
      recipientCount: document.recipientCount,
      successCount: document.successCount,
      failureCount: document.failureCount,
    })

    await collection.insertOne(document)
    console.log("✅ Broadcast history saved")
  } catch (error) {
    console.error("❌ Failed to save broadcast history:", error)
    console.error("📋 Document that failed:", JSON.stringify(document, null, 2))
    // Don't throw - just log the error so broadcast can continue
  }
}

/**
 * Get recent broadcast history
 * @param limit Number of recent broadcasts to retrieve
 * @returns Array of broadcast history
 */
export async function getBroadcastHistory(
  limit = 10,
): Promise<BroadcastHistory[]> {
  try {
    const db = getDB()
    const collection = db.collection<BroadcastHistory>("broadcasts")
    return await collection
      .find({})
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray()
  } catch (error) {
    console.error("❌ Failed to retrieve broadcast history:", error)
    return []
  }
}
