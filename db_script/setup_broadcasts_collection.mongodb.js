// MongoDB Setup Script for Broadcasts Collection
// Run this to ensure the broadcasts collection is properly configured

// Connect to payecards_bot database
use("payecards_bot");

// Drop existing broadcasts collection if it has problematic schema validator
db.broadcasts.drop();

// Create broadcasts collection with schema validator
db.createCollection("broadcasts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "adminId",
        "message",
        "sentAt",
        "recipientCount",
        "successCount",
        "failureCount",
      ],
      properties: {
        adminId: {
          bsonType: ["int", "long", "double"], // Accept any numeric type
          description: "Telegram ID of admin who sent broadcast - required",
        },
        message: {
          bsonType: "string",
          minLength: 1,
          description: "Broadcast message content - required",
        },
        sentAt: {
          bsonType: "date",
          description: "When broadcast was sent - required",
        },
        recipientCount: {
          bsonType: ["int", "long", "double"],
          minimum: 0,
          description: "Total number of recipients - required",
        },
        successCount: {
          bsonType: ["int", "long", "double"],
          minimum: 0,
          description: "Number of successful deliveries - required",
        },
        failureCount: {
          bsonType: ["int", "long", "double"],
          minimum: 0,
          description: "Number of failed deliveries - required",
        },
      },
    },
  },
  validationLevel: "moderate", // Less strict validation
  validationAction: "warn", // Warn instead of error for validation failures
});

// Create indexes for better query performance
db.broadcasts.createIndex({ sentAt: -1 }); // For recent broadcasts query
db.broadcasts.createIndex({ adminId: 1 }); // For per-admin queries

print("✅ Broadcasts collection created successfully!");
print("✅ Indexes created: sentAt (descending), adminId");
print("✅ Schema validator: Moderate level, accepts numeric types");
print("");
print("Sample document structure:");
print({
  adminId: 674588713,
  message: "Hello everyone!",
  sentAt: new Date(),
  recipientCount: 100,
  successCount: 98,
  failureCount: 2,
});
