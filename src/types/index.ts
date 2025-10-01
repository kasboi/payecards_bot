import { Context } from "https://deno.land/x/grammy@v1.38.2/mod.ts";

// Custom context type (can be extended later)
export type BotContext = Context;

// User interface (for database later)
export interface User {
  telegramId: number;
  username: string;
  email: string;
  isAdmin: boolean;
  registeredAt: Date;
}

// Environment variables interface
export interface EnvConfig {
  BOT_TOKEN: string;
  MONGO_URI: string;
  ADMIN_IDS: number[];
}
