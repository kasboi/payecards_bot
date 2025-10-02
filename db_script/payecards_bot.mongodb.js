/* global use, db */
// MongoDB Playground for Payecards Bot
// This script initializes the database with proper collections and validation

const database = "payecards_bot";

// Switch to the payecards_bot database
use(database);

// ============================================
// Users Collection - Store registered users
// ============================================
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["telegramId", "username", "email", "registeredAt"],
      properties: {
        telegramId: {
          bsonType: ["int", "long", "double"],
          description: "Telegram user ID - required and must be a number",
        },
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 50,
          description: "Username - required, 3-50 characters",
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email address - required and must be valid format",
        },
        isAdmin: {
          bsonType: "bool",
          description: "Admin status - defaults to false",
        },
        registeredAt: {
          bsonType: "date",
          description: "Registration timestamp - required",
        },
        lastActiveAt: {
          bsonType: "date",
          description: "Last activity timestamp",
        },
      },
    },
  },
  validationLevel: "moderate",
  validationAction: "error",
});

// Create unique index on telegramId (one account per Telegram user)
db.users.createIndex({ telegramId: 1 }, { unique: true });

// Create unique index on email (one account per email)
db.users.createIndex({ email: 1 }, { unique: true });

// Create index on username for faster lookups
db.users.createIndex({ username: 1 });

// Create index on isAdmin for admin queries
db.users.createIndex({ isAdmin: 1 });

// ============================================
// Broadcast History Collection - Track broadcasts
// ============================================
db.createCollection("broadcasts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["adminId", "message", "sentAt", "recipientCount"],
      properties: {
        adminId: {
          bsonType: "long",
          description: "Telegram ID of admin who sent broadcast",
        },
        message: {
          bsonType: "string",
          minLength: 1,
          description: "Broadcast message content",
        },
        sentAt: {
          bsonType: "date",
          description: "Timestamp when broadcast was sent",
        },
        recipientCount: {
          bsonType: "int",
          minimum: 0,
          description: "Number of users who received the message",
        },
        successCount: {
          bsonType: "int",
          minimum: 0,
          description: "Number of successfully delivered messages",
        },
        failureCount: {
          bsonType: "int",
          minimum: 0,
          description: "Number of failed deliveries",
        },
      },
    },
  },
  validationLevel: "moderate",
  validationAction: "error",
});

// Create index on sentAt for chronological queries
db.broadcasts.createIndex({ sentAt: -1 });

// Create index on adminId to track admin activity
db.broadcasts.createIndex({ adminId: 1 });

// ============================================
// Bot Statistics Collection - Track usage
// ============================================
db.createCollection("statistics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["date", "totalUsers", "activeUsers"],
      properties: {
        date: {
          bsonType: "date",
          description: "Date of statistics",
        },
        totalUsers: {
          bsonType: "int",
          minimum: 0,
          description: "Total registered users",
        },
        activeUsers: {
          bsonType: "int",
          minimum: 0,
          description: "Active users in the period",
        },
        commandsExecuted: {
          bsonType: "int",
          minimum: 0,
          description: "Total commands executed",
        },
        cryptoRequests: {
          bsonType: "int",
          minimum: 0,
          description: "Number of crypto price requests",
        },
        newRegistrations: {
          bsonType: "int",
          minimum: 0,
          description: "New user registrations",
        },
      },
    },
  },
});

// Create unique index on date (one entry per day)
db.statistics.createIndex({ date: 1 }, { unique: true });

// ============================================
// Sample Data - Insert test documents
// ============================================

// Insert a sample admin user (replace with your actual Telegram ID)
db.users.insertOne({
  telegramId: NumberLong("123456789"),
  username: "admin_user",
  email: "admin@payecards.com",
  isAdmin: true,
  registeredAt: new Date(),
  lastActiveAt: new Date(),
});

// Insert a sample regular user
db.users.insertOne({
  telegramId: NumberLong("987654321"),
  username: "test_user",
  email: "test@example.com",
  isAdmin: false,
  registeredAt: new Date(),
  lastActiveAt: new Date(),
});

// Insert initial statistics entry
db.statistics.insertOne({
  date: new Date(),
  totalUsers: 2,
  activeUsers: 2,
  commandsExecuted: 0,
  cryptoRequests: 0,
  newRegistrations: 2,
});

// ============================================
// Verification Queries
// ============================================

print("=".repeat(50));
print("Database Setup Complete!");
print("=".repeat(50));

print("\n📊 Collections created:");
db.getCollectionNames().forEach((collection) => {
  print(`  ✓ ${collection}`);
});

print("\n👥 Users count:", db.users.countDocuments());
print("📢 Broadcasts count:", db.broadcasts.countDocuments());
print("📈 Statistics entries:", db.statistics.countDocuments());

print("\n🔍 Sample users:");
db.users.find().forEach((user) => {
  print(`  • ${user.username} (${user.email}) - Admin: ${user.isAdmin}`);
});

print("\n✅ Database initialization successful!");
print("=".repeat(50));
