import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts"
import { getAllCommands } from "../src/utils/commands.ts"

Deno.test("Commands - User commands are defined", () => {
  const commands = getAllCommands()

  assertExists(commands.user)
  assertEquals(commands.user.length, 4)

  // Check each user command
  const commandNames = commands.user.map((cmd) => cmd.command)
  assertEquals(commandNames.includes("start"), true)
  assertEquals(commandNames.includes("register"), true)
  assertEquals(commandNames.includes("crypto"), true)
  assertEquals(commandNames.includes("help"), true)
})

Deno.test("Commands - Admin commands include user commands plus admin-only", () => {
  const commands = getAllCommands()

  assertExists(commands.admin)
  assertEquals(commands.admin.length, 8)

  // Check admin-only commands are present
  const commandNames = commands.admin.map((cmd) => cmd.command)
  assertEquals(commandNames.includes("broadcast"), true)
  assertEquals(commandNames.includes("cancel_broadcast"), true)
  assertEquals(commandNames.includes("broadcast_history"), true)
  assertEquals(commandNames.includes("stats"), true)

  // Check user commands are also included
  assertEquals(commandNames.includes("start"), true)
  assertEquals(commandNames.includes("register"), true)
  assertEquals(commandNames.includes("crypto"), true)
  assertEquals(commandNames.includes("help"), true)
})

Deno.test("Commands - All commands have descriptions", () => {
  const commands = getAllCommands()

  // Check user commands
  for (const cmd of commands.user) {
    assertExists(cmd.command)
    assertExists(cmd.description)
    assertEquals(cmd.description.length > 0, true)
  }

  // Check admin commands
  for (const cmd of commands.admin) {
    assertExists(cmd.command)
    assertExists(cmd.description)
    assertEquals(cmd.description.length > 0, true)
  }
})

Deno.test("Commands - Command names are valid format", () => {
  const commands = getAllCommands()

  const validCommandRegex = /^[a-z_]+$/

  // Check all command names follow Telegram's requirements
  for (const cmd of commands.admin) {
    assertEquals(
      validCommandRegex.test(cmd.command),
      true,
      `Command "${cmd.command}" should only contain lowercase letters and underscores`,
    )
  }
})
