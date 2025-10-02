import {
  MongoClient,
  Database,
} from "https://deno.land/x/mongo@v0.32.0/mod.ts"
import { config } from "../config/env.ts"
import { createLogger } from "../utils/logger.ts"
import { createDatabaseError } from "../utils/errors.ts"

const logger = createLogger("Database")
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
    logger.info("Connecting to MongoDB...")

    client = new MongoClient()
    await client.connect(config.MONGO_URI)

    // Extract database name from URI or use default
    const dbName =
      config.MONGO_URI.split("/").pop()?.split("?")[0] || "payecards_bot"
    db = client.database(dbName)

    logger.info(`Connected to MongoDB database: ${dbName}`)
    return db
  } catch (error) {
    logger.error("MongoDB connection failed", error)
    throw createDatabaseError("Failed to connect to MongoDB", error as Error)
  }
}

/**
 * Get database instance (must be connected first)
 */
export function getDB(): Database {
  if (!db) {
    throw createDatabaseError(
      "Database not initialized. Call connectDB() first.",
    )
  }
  return db
}

/**
 * Close MongoDB connection gracefully
 */
export async function closeDB(): Promise<void> {
  if (client) {
    try {
      logger.info("Closing MongoDB connection...")
      await client.close()
      db = null
      client = null
      logger.info("MongoDB connection closed")
    } catch (error) {
      logger.error("Error closing MongoDB connection", error)
    }
  }
}
