import { Context } from "https://deno.land/x/grammy@v1.38.2/mod.ts"

// Custom context type (can be extended later)
export type BotContext = Context

// User interface (for database)
export interface User {
  telegramId: number
  username: string
  email: string
  isAdmin: boolean
  registeredAt: Date
  lastActiveAt?: Date
}

// Environment variables interface
export interface EnvConfig {
  BOT_TOKEN: string
  MONGO_URI: string
  ADMIN_IDS: number[]
  COINGECKO_API_URL: string
}

// Cryptocurrency interfaces
export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  last_updated: string
}

export interface CoinGeckoSimplePrice {
  [currency: string]: {
    usd: number
    usd_24h_change: number
  }
}
