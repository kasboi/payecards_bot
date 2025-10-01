import { ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts"
import { getDB } from "../connection.ts"
import type { User } from "../../types/index.ts"

// MongoDB user document interface (includes _id)
export interface UserDocument extends User {
  _id?: ObjectId
}

/**
 * Get users collection
 */
function getUsersCollection() {
  return getDB().collection<UserDocument>("users")
}

/**
 * Create a new user in the database
 * @param userData User data to insert
 * @returns Created user document
 */
export async function createUser(
  userData: Omit<User, "registeredAt">,
): Promise<UserDocument> {
  const collection = getUsersCollection()

  const newUser: UserDocument = {
    ...userData,
    registeredAt: new Date(),
    isAdmin: userData.isAdmin || false,
  }

  const insertId = await collection.insertOne(newUser)

  return {
    ...newUser,
    _id: insertId,
  }
}

/**
 * Find user by Telegram ID
 * @param telegramId Telegram user ID
 * @returns User document or null
 */
export async function findUserByTelegramId(
  telegramId: number,
): Promise<UserDocument | null> {
  const collection = getUsersCollection()
  const user = await collection.findOne({ telegramId })
  return user ?? null
}

/**
 * Find user by email
 * @param email User email address
 * @returns User document or null
 */
export async function findUserByEmail(
  email: string,
): Promise<UserDocument | null> {
  const collection = getUsersCollection()
  const user = await collection.findOne({ email: email.toLowerCase() })
  return user ?? null
}

/**
 * Check if user exists by Telegram ID
 * @param telegramId Telegram user ID
 * @returns True if user exists
 */
export async function userExists(telegramId: number): Promise<boolean> {
  const user = await findUserByTelegramId(telegramId)
  return user !== null
}

/**
 * Get all registered users
 * @returns Array of all users
 */
export async function getAllUsers(): Promise<UserDocument[]> {
  const collection = getUsersCollection()
  return await collection.find({}).toArray()
}

/**
 * Get total user count
 * @returns Number of registered users
 */
export async function getUserCount(): Promise<number> {
  const collection = getUsersCollection()
  return await collection.countDocuments()
}

/**
 * Update user's last active timestamp
 * @param telegramId Telegram user ID
 */
export async function updateLastActive(telegramId: number): Promise<void> {
  const collection = getUsersCollection()
  await collection.updateOne(
    { telegramId },
    { $set: { lastActiveAt: new Date() } },
  )
}

/**
 * Check if user is admin
 * @param telegramId Telegram user ID
 * @returns True if user is admin
 */
export async function isUserAdmin(telegramId: number): Promise<boolean> {
  const user = await findUserByTelegramId(telegramId)
  return user?.isAdmin || false
}
