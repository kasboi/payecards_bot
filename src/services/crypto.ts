import { config } from "../config/env.ts"
import type { CoinGeckoSimplePrice, CryptoPrice } from "../types/index.ts"

/**
 * Supported cryptocurrencies
 */
export const SUPPORTED_COINS = {
  bitcoin: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ethereum: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  binancecoin: { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
  cardano: { id: "cardano", symbol: "ADA", name: "Cardano" },
  solana: { id: "solana", symbol: "SOL", name: "Solana" },
  ripple: { id: "ripple", symbol: "XRP", name: "XRP" },
  polkadot: { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  dogecoin: { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  avalanche: { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  polygon: { id: "matic-network", symbol: "MATIC", name: "Polygon" },
}

/**
 * Get simple price for a cryptocurrency
 * @param coinId CoinGecko coin ID
 * @returns Price data or null on error
 */
export async function getCryptoPrice(
  coinId: string,
): Promise<CoinGeckoSimplePrice | null> {
  try {
    const url = `${config.COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`

    const response = await fetch(url)

    if (!response.ok) {
      console.error(
        `❌ CoinGecko API error: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const data: CoinGeckoSimplePrice = await response.json()
    return data
  } catch (error) {
    console.error("❌ Error fetching crypto price:", error)
    return null
  }
}

/**
 * Get detailed market data for a cryptocurrency
 * @param coinId CoinGecko coin ID
 * @returns Detailed price data or null on error
 */
export async function getCryptoMarketData(
  coinId: string,
): Promise<CryptoPrice | null> {
  try {
    const url = `${config.COINGECKO_API_URL}/coins/markets?vs_currency=usd&ids=${coinId}`

    const response = await fetch(url)

    if (!response.ok) {
      console.error(
        `❌ CoinGecko API error: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const data: CryptoPrice[] = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("❌ Error fetching crypto market data:", error)
    return null
  }
}

/**
 * Get prices for multiple cryptocurrencies
 * @param coinIds Array of CoinGecko coin IDs
 * @returns Price data or null on error
 */
export async function getMultipleCryptoPrices(
  coinIds: string[],
): Promise<CoinGeckoSimplePrice | null> {
  try {
    const ids = coinIds.join(",")
    const url = `${config.COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

    const response = await fetch(url)

    if (!response.ok) {
      console.error(
        `❌ CoinGecko API error: ${response.status} ${response.statusText}`,
      )
      return null
    }

    const data: CoinGeckoSimplePrice = await response.json()
    return data
  } catch (error) {
    console.error("❌ Error fetching multiple crypto prices:", error)
    return null
  }
}

/**
 * Format price with proper decimals and commas
 */
export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } else {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    })
  }
}

/**
 * Format percentage change with color indicator
 */
export function formatPercentageChange(change: number): string {
  const emoji = change >= 0 ? "🟢" : "🔴"
  const sign = change >= 0 ? "+" : ""
  return `${emoji} ${sign}${change.toFixed(2)}%`
}

/**
 * Search for coin by symbol or name
 */
export function findCoin(
  query: string,
): (typeof SUPPORTED_COINS)[keyof typeof SUPPORTED_COINS] | null {
  const queryLower = query.toLowerCase()

  // Search by symbol or name
  for (const coin of Object.values(SUPPORTED_COINS)) {
    if (
      coin.symbol.toLowerCase() === queryLower ||
      coin.name.toLowerCase() === queryLower ||
      coin.id.toLowerCase() === queryLower
    ) {
      return coin
    }
  }

  return null
}
