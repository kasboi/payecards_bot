import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts"
import {
  validateUsername,
  validateEmail,
  isValidEmail,
} from "../src/utils/validation.ts"

Deno.test("Email Validation", async (t) => {
  await t.step("should accept valid email formats", () => {
    assertEquals(isValidEmail("user@example.com"), true)
    assertEquals(isValidEmail("test.user@domain.co.uk"), true)
    assertEquals(isValidEmail("user+tag@example.com"), true)
    assertEquals(isValidEmail("123@test.com"), true)
    assertEquals(isValidEmail("user_name@example.com"), true)
  })

  await t.step("should reject invalid email formats", () => {
    assertEquals(isValidEmail("notanemail"), false)
    assertEquals(isValidEmail("user@"), false)
    assertEquals(isValidEmail("@example.com"), false)
    assertEquals(isValidEmail("user@.com"), false)
    assertEquals(isValidEmail("user space@example.com"), false)
    assertEquals(isValidEmail(""), false)
  })

  await t.step("validateEmail should return correct validation results", () => {
    const validResult = validateEmail("test@example.com")
    assertEquals(validResult.isValid, true)
    assertEquals(validResult.error, undefined)

    const invalidResult = validateEmail("notanemail")
    assertEquals(invalidResult.isValid, false)
    assertExists(invalidResult.error)
    assertEquals(
      invalidResult.error,
      "Please provide a valid email address",
    )

    const emptyResult = validateEmail("")
    assertEquals(emptyResult.isValid, false)
    assertEquals(emptyResult.error, "Email cannot be empty")
  })
})

Deno.test("Username Validation", async (t) => {
  await t.step("should accept valid usernames", () => {
    const valid1 = validateUsername("john_doe")
    assertEquals(valid1.isValid, true)
    assertEquals(valid1.error, undefined)

    const valid2 = validateUsername("user123")
    assertEquals(valid2.isValid, true)

    const valid3 = validateUsername("test-user")
    assertEquals(valid3.isValid, true)

    const valid4 = validateUsername("abc") // minimum length
    assertEquals(valid4.isValid, true)

    const valid5 = validateUsername("a".repeat(50)) // maximum length
    assertEquals(valid5.isValid, true)
  })

  await t.step("should reject usernames that are too short", () => {
    const result = validateUsername("ab")
    assertEquals(result.isValid, false)
    assertEquals(
      result.error,
      "Username must be at least 3 characters long",
    )
  })

  await t.step("should reject usernames that are too long", () => {
    const result = validateUsername("a".repeat(51))
    assertEquals(result.isValid, false)
    assertEquals(result.error, "Username must not exceed 50 characters")
  })

  await t.step("should reject usernames with invalid characters", () => {
    const result1 = validateUsername("user@name")
    assertEquals(result1.isValid, false)
    assertEquals(
      result1.error,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )

    const result2 = validateUsername("user name")
    assertEquals(result2.isValid, false)

    const result3 = validateUsername("user!name")
    assertEquals(result3.isValid, false)

    const result4 = validateUsername("user.name")
    assertEquals(result4.isValid, false)
  })

  await t.step("should reject empty usernames", () => {
    const result1 = validateUsername("")
    assertEquals(result1.isValid, false)
    assertEquals(result1.error, "Username cannot be empty")

    const result2 = validateUsername("   ")
    assertEquals(result2.isValid, false)
    assertEquals(result2.error, "Username cannot be empty")
  })
})
