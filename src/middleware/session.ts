import { session } from "https://deno.land/x/grammy@v1.38.2/mod.ts";
import type { BotContext, SessionData } from "../types/index.ts";

/**
 * Session middleware for managing multi-step conversations
 * 
 * This middleware provides session storage for:
 * - Registration flow (username and email collection)
 * - Broadcast flow (message composition and confirmation)
 */
export const sessionMiddleware = session<SessionData, BotContext>({
  initial: () => ({}),
});
