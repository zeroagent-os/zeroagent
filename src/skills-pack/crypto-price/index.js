#!/usr/bin/env node

// crypto-price skill
// Uses CoinGecko public API — no API key required
// Supports any coin by name or symbol

const https = require('https');

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
const SYMBOL_MAP = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'sol': 'solana',
  'bnb': 'binancecoin',
  'xrp': 'ripple',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'matic': 'matic-network',
  'link': 'chainlink',
  'uni': 'uniswap',
  'ltc': 'litecoin',
  'atom': 'cosmos',
  'near': 'near',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'zeroagent/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

function normalizeCoinId(input) {
  const lower = input.toLowerCase().trim();
  // Check symbol map first
  if (SYMBOL_MAP[lower]) return SYMBOL_MAP[lower];
  // Otherwise assume it's already a CoinGecko ID
  return lower.replace(/\s+/g, '-');
}

function formatNumber(num) {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${num.toLocaleString()}`;
  return `$${num.toFixed(4)}`;
}

function formatPrice(price) {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

async function run(inputs) {
  const coin = inputs.coin || 'bitcoin';
  const coinId = normalizeCoinId(coin);

  try {
    const url = `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
    const data = await fetchJson(url);

    if (data.error) {
      // Try searching for the coin
      const searchUrl = `${COINGECKO_BASE}/search?query=${encodeURIComponent(coin)}`;
      const searchData = await fetchJson(searchUrl);
      
      if (searchData.coins && searchData.coins.length > 0) {
        const suggestion = searchData.coins[0];
        return {
          success: false,
          error: `Coin "${coin}" not found. Did you mean "${suggestion.name}" (${suggestion.symbol.toUpperCase()})? Try: zeroagent run crypto-price --coin ${suggestion.id}`
        };
      }
      return { success: false, error: `Coin "${coin}" not found on CoinGecko.` };
    }

    const market = data.market_data;
    const price = market.current_price.usd;
    const change24h = market.price_change_percentage_24h;
    const marketCap = market.market_cap.usd;
    const volume = market.total_volume.usd;
    const high24h = market.high_24h.usd;
    const low24h = market.low_24h.usd;
    const changeEmoji = change24h >= 0 ? '📈' : '📉';
    const changeSign = change24h >= 0 ? '+' : '';

    const output = [
      ``,
      `  ₿  ${data.name} (${data.symbol.toUpperCase()})`,
      ``,
      `  Price       ${formatPrice(price)}`,
      `  24h Change  ${changeEmoji} ${changeSign}${change24h.toFixed(2)}%`,
      `  24h High    ${formatPrice(high24h)}`,
      `  24h Low     ${formatPrice(low24h)}`,
      `  Market Cap  ${formatNumber(marketCap)}`,
      `  Volume 24h  ${formatNumber(volume)}`,
      `  Rank        #${data.market_cap_rank}`,
      ``,
      `  Last updated: ${new Date(market.last_updated).toLocaleTimeString()}`,
      ``,
    ].join('\n');

    return {
      success: true,
      coin: data.name,
      symbol: data.symbol.toUpperCase(),
      price,
      change24h,
      marketCap,
      volume,
      rank: data.market_cap_rank,
      output
    };

  } catch (err) {
    return {
      success: false,
      error: `Failed to fetch price for "${coin}". Check the coin name and try again.`
    };
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const coinArg = args.find((_, i) => args[i - 1] === '--coin') || args[0] || 'bitcoin';
  
  run({ coin: coinArg }).then(result => {
    if (result.success) {
      console.log(result.output);
    } else {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }
  }).catch(err => {
    console.error(`❌ Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { run };
