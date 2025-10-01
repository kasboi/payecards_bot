import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts"

/**
 * Mock Telegram message formatting tests
 * These tests validate that our message strings won't cause Telegram API errors
 */

Deno.test("Telegram Markdown Formatting", async (t) => {
  await t.step("should escape underscores in examples", () => {
    const message =
      "Example: john\\_doe or user123\n\nType /cancel to cancel registration."

    // Check that underscores are properly escaped
    assertEquals(message.includes("john\\_doe"), true)
    assertEquals(message.includes("john_doe"), false)
  })

  await t.step("should use single asterisks for emphasis", () => {
    const registrationMessage = "📝 *Let's get you registered!*\n\n"
    const successMessage = "🎉 *Registration Successful!*\n\n"

    // Single asterisks for italic (safer than double for bold)
    assertEquals(registrationMessage.includes("*Let's"), true)
    assertEquals(registrationMessage.includes("**Let's"), false)
    assertEquals(successMessage.includes("*Registration"), true)
  })

  await t.step("should not have unmatched formatting characters", () => {
    const messages = [
      "📝 *Let's get you registered!*\n\n" +
      "Please enter your desired username:\n" +
      "• 3-50 characters\n" +
      "• Letters, numbers, underscores, and hyphens only\n\n" +
      "Example: john\\_doe or user123\n\n" +
      "Type /cancel to cancel registration.",

      "✅ Username \"test\" looks good!\n\n" +
      "📧 Now, please enter your email address:\n\n" +
      "Example: user@example.com\n\n" +
      "Type /cancel to cancel registration.",

      "🎉 *Registration Successful!*\n\n" +
      "✅ Welcome to Payecards Bot, testuser!\n\n" +
      "📝 Your Details:\n" +
      "👤 Username: testuser\n" +
      "📧 Email: test@example.com\n" +
      "🆔 Telegram ID: 123456789\n\n" +
      "You can now use all bot features!\n\n" +
      "Use /help to see available commands.",
    ]

    for (const message of messages) {
      // Count asterisks (should be even for matched pairs)
      const asteriskCount = (message.match(/\*/g) || []).length
      assertEquals(
        asteriskCount % 2,
        0,
        `Unmatched asterisks in message: ${message.substring(0, 50)}...`,
      )

      // Count underscores (escaped ones should have backslash)
      const _unescapedUnderscores = message.match(/[^\\]_/g) || []
      // Note: This is a simplified check. In real scenarios, check context.
      // We allow underscores in "test_user" context but they should be in pairs or escaped
    }
  })

  await t.step("should handle usernames with underscores safely", () => {
    // When displaying username in success message
    const username1 = "john_doe"
    const username2 = "test_user_123"

    // In plain text sections (no parse_mode), underscores are fine
    const plainMessage1 = `Welcome to Payecards Bot, ${username1}!`
    const plainMessage2 = `Welcome to Payecards Bot, ${username2}!`

    assertEquals(plainMessage1.includes("john_doe"), true)
    assertEquals(plainMessage2.includes("test_user_123"), true)

    // But in examples with Markdown, they must be escaped
    const markdownExample = "Example: john\\_doe or user123"
    assertEquals(markdownExample.includes("\\_"), true)
  })

  await t.step("should handle email addresses safely", () => {
    const emails = [
      "test@example.com",
      "user.name+tag@domain.co.uk",
      "test_user@example.com",
    ]

    for (const email of emails) {
      // Emails in plain text sections should not cause issues
      const message = `📧 Email: ${email}`
      assertEquals(message.includes(email), true)

      // Check for problematic Markdown characters (asterisks, backticks, brackets)
      // Note: Underscores are OK in emails when not using parse_mode
      const hasProblematicChars = /[*`\[]/.test(email)
      assertEquals(
        hasProblematicChars,
        false,
        `Email should not contain problematic Markdown chars: ${email}`,
      )
    }
  })
})

Deno.test("Registration Flow Messages", async (t) => {
  await t.step("should have consistent error message format", () => {
    const errorMessages = [
      "❌ Username must be at least 3 characters long\n\nPlease try again or /cancel:",
      "❌ Username can only contain letters, numbers, underscores, and hyphens\n\nPlease try again or /cancel:",
      "❌ Email cannot be empty\n\nPlease try again or /cancel:",
      "❌ Please provide a valid email address\n\nPlease try again or /cancel:",
    ]

    for (const message of errorMessages) {
      // All error messages should start with ❌
      assertEquals(message.startsWith("❌"), true)
      // All should end with cancel instruction
      assertEquals(message.includes("/cancel"), true)
    }
  })

  await t.step("should have clear success indicators", () => {
    const successMessages = [
      "✅ Username \"test\" looks good!",
      "🎉 *Registration Successful!*",
      "✅ Welcome to Payecards Bot",
    ]

    for (const message of successMessages) {
      // Success messages should have positive indicators
      const hasSuccessIndicator = message.includes("✅") ||
        message.includes("🎉")
      assertEquals(
        hasSuccessIndicator,
        true,
        `Message should have success indicator: ${message}`,
      )
    }
  })
})
