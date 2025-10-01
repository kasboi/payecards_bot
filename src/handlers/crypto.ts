import { Bot, InlineKeyboard } from "https://deno.land/x/grammy@v1.38.2/mod.ts"
import type { BotContext } from "../types/index.ts"
import {
  getCryptoMarketData,
  getMultipleCryptoPrices,
  formatPrice,
  formatPercentageChange,
  findCoin,
  SUPPORTED_COINS,
} from "../services/crypto.ts"

/**
 * Register crypto-related handlers
 */
export function registerCryptoHandlers(bot: Bot<BotContext>) {
  // /crypto command - Get cryptocurrency prices
  bot.command("crypto", async (ctx) => {
    const args = ctx.message?.text.split(" ").slice(1)

    // If no argument provided, show menu
    if (!args || args.length === 0) {
      await showCryptoMenu(ctx)
      return
    }

    const query = args.join(" ").trim()
    const coin = findCoin(query)

    if (!coin) {
      await ctx.reply(
        `❌ Cryptocurrency "${query}" not found.\n\n` +
        `Use /crypto without arguments to see supported coins.`,
      )
      return
    }

    await sendCryptoPrice(ctx, coin.id)
  })

  // Handle crypto menu callback queries
  bot.callbackQuery(/^crypto_(.+)$/, async (ctx) => {
    const coinId = ctx.match[1]

    if (coinId === "menu") {
      await showCryptoMenu(ctx)
    } else if (coinId === "top") {
      await sendTopCryptos(ctx)
    } else {
      await sendCryptoPrice(ctx, coinId)
    }

    await ctx.answerCallbackQuery()
  })
}

/**
 * Show cryptocurrency menu with popular coins
 */
async function showCryptoMenu(ctx: BotContext) {
  const keyboard = new InlineKeyboard()
    .text("💰 Bitcoin (BTC)", "crypto_bitcoin")
    .text("💎 Ethereum (ETH)", "crypto_ethereum")
    .row()
    .text("🟡 Binance Coin (BNB)", "crypto_binancecoin")
    .text("🔵 Cardano (ADA)", "crypto_cardano")
    .row()
    .text("🟣 Solana (SOL)", "crypto_solana")
    .text("🌊 XRP", "crypto_ripple")
    .row()
    .text("🔴 Polkadot (DOT)", "crypto_polkadot")
    .text("🐕 Dogecoin (DOGE)", "crypto_dogecoin")
    .row()
    .text("📊 Top 10 Cryptos", "crypto_top")

  const message =
    `💰 **Cryptocurrency Price Tracker**\n\n` +
    `Select a cryptocurrency to see its current price:\n\n` +
    `Or use: /crypto <name>\n` +
    `Examples:\n` +
    `• /crypto bitcoin\n` +
    `• /crypto eth\n` +
    `• /crypto btc\n\n` +
    `**Supported Coins:**\n` +
    Object.values(SUPPORTED_COINS)
      .map((coin) => `• ${coin.name} (${coin.symbol})`)
      .join("\n")

  if (ctx.callbackQuery) {
    await ctx.editMessageText(message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    })
  } else {
    await ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    })
  }
}

/**
 * Send detailed price information for a cryptocurrency
 */
async function sendCryptoPrice(ctx: BotContext, coinId: string) {
  // Send loading message
  const loadingMsg = await ctx.reply("⏳ Fetching price data...")

  try {
    const data = await getCryptoMarketData(coinId)

    if (!data) {
      await ctx.api.editMessageText(
        ctx.chat?.id!,
        loadingMsg.message_id,
        "❌ Failed to fetch cryptocurrency data. Please try again later.",
      )
      return
    }

    const message =
      `💰 **${data.name} (${data.symbol.toUpperCase()})** Price\n\n` +
      `💵 **Current Price:** $${formatPrice(data.current_price)}\n` +
      `📊 **24h Change:** ${formatPercentageChange(
        data.price_change_percentage_24h,
      )}\n` +
      `📈 **24h Price Change:** $${formatPrice(
        Math.abs(data.price_change_24h),
      )}\n` +
      `💎 **Market Cap:** $${formatPrice(data.market_cap)}\n` +
      `📦 **24h Volume:** $${formatPrice(data.total_volume)}\n\n` +
      `🕐 Last updated: ${new Date(data.last_updated).toLocaleString()}\n\n` +
      `_Powered by CoinGecko_`

    const keyboard = new InlineKeyboard()
      .text("🔄 Refresh", `crypto_${coinId}`)
      .text("📋 Menu", "crypto_menu")

    await ctx.api.editMessageText(
      ctx.chat?.id!,
      loadingMsg.message_id,
      message,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    )
  } catch (error) {
    console.error("❌ Error sending crypto price:", error)
    await ctx.api.editMessageText(
      ctx.chat?.id!,
      loadingMsg.message_id,
      "❌ An error occurred while fetching data. Please try again.",
    )
  }
}

/**
 * Send top cryptocurrencies
 */
async function sendTopCryptos(ctx: BotContext) {
  const loadingMsg = await ctx.reply("⏳ Fetching top cryptocurrencies...")

  try {
    const coinIds = Object.keys(SUPPORTED_COINS)
    const data = await getMultipleCryptoPrices(coinIds)

    if (!data) {
      await ctx.api.editMessageText(
        ctx.chat?.id!,
        loadingMsg.message_id,
        "❌ Failed to fetch cryptocurrency data. Please try again later.",
      )
      return
    }

    let message = "📊 **Top Cryptocurrencies**\n\n"

    for (const [coinId, coin] of Object.entries(SUPPORTED_COINS)) {
      const priceData = data[coinId]
      if (priceData) {
        const change = formatPercentageChange(priceData.usd_24h_change)
        message += `**${coin.name} (${coin.symbol})**\n`
        message += `💵 $${formatPrice(priceData.usd)} ${change}\n\n`
      }
    }

    message += `\n_Powered by CoinGecko_`

    const keyboard = new InlineKeyboard()
      .text("🔄 Refresh", "crypto_top")
      .text("📋 Menu", "crypto_menu")

    await ctx.api.editMessageText(
      ctx.chat?.id!,
      loadingMsg.message_id,
      message,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      },
    )
  } catch (error) {
    console.error("❌ Error sending top cryptos:", error)
    await ctx.api.editMessageText(
      ctx.chat?.id!,
      loadingMsg.message_id,
      "❌ An error occurred while fetching data. Please try again.",
    )
  }
}
