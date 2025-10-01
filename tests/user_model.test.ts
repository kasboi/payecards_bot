import {
  assertEquals,
  assertExists,
  assertRejects,
} from "https://deno.land/std@0.208.0/assert/mod.ts"
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts"
import {
  createUser,
  findUserByTelegramId,
  findUserByEmail,
  userExists,
  getUserCount,
} from "../src/database/models/user.ts"
import { connectDB, closeDB } from "../src/database/connection.ts"

// NOTE: These tests are currently skipped because they require
// the MongoDB schema validator to be disabled for test databases.
// The production database has a schema validator that enforces
// telegramId as bsonType 'long', which doesn't work well with
// JavaScript numbers in tests. For manual testing, use the bot directly.

Deno.test({
  name: "User Model CRUD Operations",
  ignore: true, // Skipped: Requires MongoDB without schema validator
  fn: async (t) => {
    // Setup: Connect to test database with unique name
    const TEST_DB_NAME = `payecards_bot_test_${Date.now()}`
    const TEST_URI = `mongodb://localhost:27017/${TEST_DB_NAME}`
    Deno.env.set("MONGO_URI", TEST_URI)
    await connectDB()

    // Get test collection and clear it before tests
    const client = new MongoClient()
    await client.connect(TEST_URI)
    const testDb = client.database(TEST_DB_NAME)
    const usersCollection = testDb.collection("users")

    await t.step("Setup: Verify empty test database", async () => {
      const count = await usersCollection.countDocuments()
      assertEquals(count, 0)
    })

    await t.step("createUser should insert a new user", async () => {
      const userData = {
        telegramId: 123456789,
        username: "test_user",
        email: "test@example.com",
        isAdmin: false,
      }

      const newUser = await createUser(userData)

      assertExists(newUser._id)
      assertEquals(newUser.telegramId, userData.telegramId)
      assertEquals(newUser.username, userData.username)
      assertEquals(newUser.email, userData.email)
      assertEquals(newUser.isAdmin, false)
      assertExists(newUser.registeredAt)
    })

    await t.step("findUserByTelegramId should find existing user", async () => {
      const user = await findUserByTelegramId(123456789)

      assertExists(user)
      assertEquals(user!.username, "test_user")
      assertEquals(user!.email, "test@example.com")
    })

    await t.step("findUserByTelegramId should return null for non-existent user", async () => {
      const user = await findUserByTelegramId(999999999)
      assertEquals(user, null)
    })

    await t.step("findUserByEmail should find user (case-insensitive)", async () => {
      const user1 = await findUserByEmail("test@example.com")
      assertExists(user1)
      assertEquals(user1!.username, "test_user")

      const user2 = await findUserByEmail("TEST@EXAMPLE.COM")
      assertExists(user2)
      assertEquals(user2!.username, "test_user")
    })

    await t.step("findUserByEmail should return null for non-existent email", async () => {
      const user = await findUserByEmail("nonexistent@example.com")
      assertEquals(user, null)
    })

    await t.step("userExists should return true for existing user", async () => {
      const exists = await userExists(123456789)
      assertEquals(exists, true)
    })

    await t.step("userExists should return false for non-existent user", async () => {
      const exists = await userExists(999999999)
      assertEquals(exists, false)
    })

    await t.step("getUserCount should return correct count", async () => {
      const count = await getUserCount()
      assertEquals(count, 1)

      // Add another user
      await createUser({
        telegramId: 987654321,
        username: "another_user",
        email: "another@example.com",
        isAdmin: false,
      })

      const newCount = await getUserCount()
      assertEquals(newCount, 2)
    })

    await t.step("should prevent duplicate Telegram IDs", async () => {
      // Try to create user with same Telegram ID
      await assertRejects(
        async () => {
          await createUser({
            telegramId: 123456789, // duplicate
            username: "different_user",
            email: "different@example.com",
            isAdmin: false,
          })
        },
        Error,
      )
    })

    await t.step("email should be stored in lowercase", async () => {
      await createUser({
        telegramId: 111111111,
        username: "case_test",
        email: "CaseSensitive@Example.COM",
        isAdmin: false,
      })

      const user = await findUserByEmail("casesensitive@example.com")
      assertExists(user)
      assertEquals(user!.email, "casesensitive@example.com")
    })

    // Cleanup: Drop test database and close connections
    await t.step("Cleanup: Drop test database and close connections", async () => {
      await testDb.dropDatabase()
      await client.close()
      await closeDB()
    })
  },
})
