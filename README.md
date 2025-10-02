# Payecards Telegram Bot

A functional Telegram bot demonstrating scalable solution design using Telegram's Bot API, featuring user registration, cryptocurrency price tracking, and admin broadcast messaging.

## 🚀 Features

- **User Registration**: Users can register with username and email
- **Cryptocurrency Tracking**: Real-time crypto prices from CoinGecko API
- **Admin Broadcasting**: Send messages to all registered users with broadcast history
- **Error Handling**: Comprehensive error handling and logging with retry mechanisms
- **Session Management**: Stateful conversations for multi-step flows
- **Database**: MongoDB for persistent data storage

## 📋 Tech Stack

- **Runtime**: Deno (v1.40.0+)
- **Language**: TypeScript
- **Framework**: grammY (v1.38.2)
- **Database**: MongoDB (v7.0+)
- **API**: CoinGecko

## 🛠️ Setup Instructions

### Prerequisites

**Option A: Local Development**

- [Deno](https://deno.land/) (v1.40.0 or higher)
- [MongoDB](https://www.mongodb.com/) (v7.0 or higher)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

**Option B: Docker**

- [Docker](https://www.docker.com/) (v20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0 or higher)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Clone Repository

```bash
git clone https://github.com/kasboi/payecards_bot.git
cd payecards_bot
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
BOT_TOKEN=your_bot_token_here
MONGO_URI=your_mongodb_connection_string
ADMIN_IDS=your_telegram_id
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

**Get Your Bot Token:**

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the token provided

**Get Your Telegram ID:**

1. Send a message to [@userinfobot](https://t.me/userinfobot)
2. Copy your ID

### 3. Initialize Database

```bash
# Start MongoDB
mongod

# In another terminal, initialize the database
mongosh < db_script/payecards_bot.mongodb.js
```

### 4. Run the Bot

**Development Mode** (with auto-reload):

```bash
deno task dev
```

**Production Mode**:

```bash
deno task start
```

## 📚 Bot Commands

### User Commands

- `/start` - Welcome message and bot overview
- `/register` - Register your account (username + email)
- `/crypto [coin]` - Get cryptocurrency prices
  - Examples: `/crypto btc`, `/crypto bitcoin`, `/crypto eth`
- `/help` - Show help and available commands

### Admin Commands

- `/broadcast` - Send message to all registered users
- `/broadcast_history` - View recent broadcast history
- `/cancel_broadcast` - Cancel ongoing broadcast composition
- `/stats` - View bot statistics (users, broadcasts, etc.)

## 🏗️ Project Structure

```
payecards_bot/
├── src/
│   ├── bot.ts                    # Main entry point
│   ├── config/
│   │   └── env.ts                # Environment configuration
│   ├── database/
│   │   ├── connection.ts         # MongoDB connection
│   │   └── models/
│   │       └── user.ts           # User model
│   ├── handlers/
│   │   ├── commands.ts           # Command handlers
│   │   ├── registration.ts       # Registration flow
│   │   ├── crypto.ts             # Crypto price handlers
│   │   └── broadcast.ts          # Broadcast handlers
│   ├── middleware/
│   │   ├── auth.ts               # Admin authentication
│   │   ├── error.ts              # Error handling
│   │   └── session.ts            # Session management
│   ├── services/
│   │   ├── crypto.ts             # CoinGecko API service
│   │   └── broadcast.ts          # Broadcast service
│   ├── utils/
│   │   ├── logger.ts             # Logging utility
│   │   ├── validation.ts         # Input validation
│   │   ├── errors.ts             # Custom error classes
│   │   └── retry.ts              # Retry mechanism
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── tests/
│   ├── validation.test.ts        # Validation tests
│   ├── user_model.test.ts        # User model tests
│   └── message_formatting.test.ts # Message formatting tests
├── db_script/
│   ├── payecards_bot.mongodb.js  # Database initialization
│   └── setup_broadcasts_collection.mongodb.js
├── deno.json
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## 🎨 Design Decisions

### 1. **Deno over Node.js**

- Modern TypeScript runtime with built-in tooling
- Secure by default (explicit permissions)
- Native TypeScript support without transpilation
- Built-in formatter, linter, and test runner

### 2. **grammY Framework**

- Type-safe Telegram bot framework
- Excellent TypeScript support with full type inference
- Middleware architecture for extensibility
- Active community and comprehensive documentation

### 3. **MongoDB Database**

- Flexible schema for evolving requirements
- Native JSON support for JavaScript/TypeScript integration
- Scalable for growing user base
- Easy to deploy and maintain

### 4. **Modular Architecture**

- Clear separation of concerns (handlers, services, utils)
- Easy to test and maintain
- Scalable as features grow
- Reusable components across the application

### 5. **Error Handling Strategy**

- Comprehensive logging for debugging
- User-friendly error messages (no stack traces to users)
- Graceful degradation on failures
- Retry mechanisms for transient errors (API calls)
- Custom error classes for different error types

### 6. **Session Management**

- In-memory sessions for development
- Type-safe session data with TypeScript
- Stateful multi-step conversations
- Automatic session cleanup

## 🔒 Security Considerations

- **Environment Variables**: Sensitive data stored in `.env` (gitignored)
- **Admin Authentication**: Dual-layer admin verification (env + database)
- **Input Validation**: All user inputs validated before processing
- **Error Messages**: Generic errors to prevent information leakage
- **Rate Limiting**: Broadcast service includes delays to prevent API abuse
- **Database Validation**: MongoDB schema validation for data integrity
- **Secure Permissions**: Deno's explicit permission model

## 🎯 Key Features Explained

### User Registration System

- Two-step registration process (username → email)
- Email and username validation
- Duplicate prevention
- Database persistence with timestamps
- Session-based flow tracking

### Cryptocurrency Price Tracking

- Real-time prices from CoinGecko API
- Support for multiple cryptocurrencies (50+ coins)
- Search by symbol or name (e.g., "btc" or "bitcoin")
- Formatted price display with 24h change
- Error handling with retry mechanism
- Rate limiting to respect API quotas

### Admin Broadcasting

- Compose and confirm message before sending
- Send to all registered users
- Track delivery status (success/failed)
- Broadcast history with statistics
- Cancel ongoing composition
- Admin-only access with authentication

### Error Handling

- User-friendly error messages
- Comprehensive logging system
- Retry mechanism for transient failures
- Graceful degradation
- Database connection resilience

## 🚧 Future Enhancements

- [ ] Implement user preferences/settings
- [ ] Add scheduled broadcasts (cron jobs)
- [ ] Implement analytics dashboard
- [ ] Implement webhook mode for production (instead of polling)
- [ ] Add user notification preferences
- [ ] Implement cryptocurrency price alerts
- [ ] Add portfolio tracking feature
- [ ] Implement Redis for session storage (production)

## 🧪 Testing

The project includes comprehensive unit tests:

- **Validation Tests**: Email and username validation
- **User Model Tests**: Database operations
- **Message Formatting Tests**: Message display formatting
- **Crypto Service Tests**: Price formatting and coin lookup

Run tests with `deno task test` for full coverage.

## 📝 Development Workflow

### Git Workflow

- One feature per commit with clear commit messages
- Test each stage before moving to next
- Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Abdullah Solahudeen**

- Email: solahudeen15@gmail.com
- GitHub: [@kasboi](https://github.com/kasboi)

## 🙏 Acknowledgments

- [grammY](https://grammy.dev/) - Excellent Telegram bot framework
- [CoinGecko](https://www.coingecko.com/) - Free cryptocurrency API
- [Deno](https://deno.land/) - Modern TypeScript runtime
- [MongoDB](https://www.mongodb.com/) - Flexible NoSQL database

## 🐛 Troubleshooting

### Bot doesn't respond

- Check that MongoDB is running: `mongod`
- Verify `.env` file has correct `BOT_TOKEN`
- Check bot logs for errors

### Database connection errors

- Ensure MongoDB is running
- Verify `MONGO_URI` in `.env` is correct
- Check that database was initialized

### Admin commands not working

- Verify your Telegram ID is in `ADMIN_IDS` in `.env`
- Send `/start` to register as a user first
- Check logs for authentication errors

### Crypto prices not showing

- Verify internet connection
- Check CoinGecko API is accessible
- Try using full coin name: `/crypto bitcoin` instead of `/crypto btc`
- Check logs for API errors

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub

---

**Built for Payecards Assessment**
