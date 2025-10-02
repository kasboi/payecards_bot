// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("payecards_bot");

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
