import type { BotContext } from "../types/index.ts"
import { config } from "../config/env.ts"
import { isUserAdmin as checkIsUserAdmin } from "../database/models/user.ts"

/**
 * Middleware to check if user is admin
 * Checks both environment variable and database
 */
export async function isAdmin(ctx: BotContext): Promise<boolean> {
  const userId = ctx.from?.id

  if (!userId) {
    return false
  }

  // Check if user ID is in environment admin list
  const isEnvAdmin = config.ADMIN_IDS.includes(userId)

  // Check if user is marked as admin in database
  const isDbAdmin = await checkIsUserAdmin(userId)

  return isEnvAdmin || isDbAdmin
}

/**
 * Middleware function to restrict access to admins only
 */
export async function adminOnly(ctx: BotContext, next: () => Promise<void>) {
  const adminStatus = await isAdmin(ctx)

  if (!adminStatus) {
    await ctx.reply(
      "❌ **Access Denied**\n\n" +
      "This command is only available to administrators.\n\n" +
      "Contact support if you believe this is an error.",
      { parse_mode: "Markdown" },
    )
    return
  }

  await next()
}
