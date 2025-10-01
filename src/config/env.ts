import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts"
import type { EnvConfig } from "../types/index.ts"

// Load environment variables from .env file
await load({ export: true })

/**
 * Validates and returns environment configuration
 * @throws {Error} If required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const BOT_TOKEN = Deno.env.get("BOT_TOKEN")
  const MONGO_URI = Deno.env.get("MONGO_URI")
  const ADMIN_IDS_STR = Deno.env.get("ADMIN_IDS")
  const COINGECKO_API_URL =
    Deno.env.get("COINGECKO_API_URL") || "https://api.coingecko.com/api/v3"

  // Validate required variables
  if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN environment variable is required")
  }

  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required")
  }

  // Parse admin IDs
  const ADMIN_IDS = ADMIN_IDS_STR
    ? ADMIN_IDS_STR.split(",").map((id) => parseInt(id.trim(), 10))
    : []

  return {
    BOT_TOKEN,
    MONGO_URI,
    ADMIN_IDS,
    COINGECKO_API_URL,
  }
}

// Export singleton config
export const config = getEnvConfig()
