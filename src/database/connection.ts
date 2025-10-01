import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.32.0/mod.ts"
import { config } from "../config/env.ts"

let db: Database | null = null
let client: MongoClient | null = null

/**
 * Initialize MongoDB connection
 * @returns {Promise<Database>} MongoDB database instance
 */
export async function connectDB(): Promise<Database> {
  if (db) {
    return db
  }

  try {
    console.log("🔌 Connecting to MongoDB...")

    client = new MongoClient()
    await client.connect(config.MONGO_URI)

    // Extract database name from URI or use default
    const dbName =
      config.MONGO_URI.split("/").pop()?.split("?")[0] || "payecards_bot"
    db = client.database(dbName)

    console.log(`✅ Connected to MongoDB database: ${dbName}`)
    return db
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to connect to MongoDB: ${message}`)
  }
}

/**
 * Get database instance (must be connected first)
 */
export function getDB(): Database {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.")
  }
  return db
}

/**
 * Close MongoDB connection gracefully
 */
export async function closeDB(): Promise<void> {
  if (client) {
    console.log("👋 Closing MongoDB connection...")
    await client.close()
    db = null
    client = null
    console.log("✅ MongoDB connection closed")
  }
}
