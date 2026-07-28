/**
 * Stellar Network Configuration & Helpers
 * Connects to Horizon Testnet and Soroban RPC
 */
import {
  Horizon,
  rpc as SorobanRpc,
  Networks,
  Asset,
  TransactionBuilder,
  Operation,
  BASE_FEE,
} from '@stellar/stellar-sdk';

// ── Network Configuration ──
export const NETWORK = 'TESTNET';
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const FRIENDBOT_URL = 'https://friendbot.stellar.org';
export const EXPLORER_URL = 'https://stellar.expert/explorer/testnet';

// ── Server Instances ──
export const horizonServer = new Horizon.Server(HORIZON_URL);
export const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL);

// ── Re-export rpc namespace for contract.js ──
export { SorobanRpc };

// ── Deployed Contract Address ──
// TODO: Update after deploying the SwapTracker contract
export const SWAP_TRACKER_CONTRACT_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

// ── Testnet Assets ──
export const ASSETS = {
  XLM: Asset.native(),
  USDC: new Asset(
    'USDC',
    'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
  ),
  SRT: new Asset(
    'SRT',
    'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B'
  ),
};

export const ASSET_LIST = [
  { code: 'XLM', name: 'Stellar Lumens', icon: '✦', asset: ASSETS.XLM, color: 'xlm' },
  { code: 'USDC', name: 'USD Coin', icon: '$', asset: ASSETS.USDC, color: 'usdc' },
];

// ── Helper Functions ──

/**
 * Load account from Horizon
 */
export async function loadAccount(publicKey) {
  return await horizonServer.loadAccount(publicKey);
}

/**
 * Get XLM and token balances for an account
 */
export async function getBalances(publicKey) {
  try {
    const account = await loadAccount(publicKey);
    const balances = {};

    for (const balance of account.balances) {
      if (balance.asset_type === 'native') {
        balances.XLM = parseFloat(balance.balance);
      } else if (balance.asset_code) {
        balances[balance.asset_code] = parseFloat(balance.balance);
      }
    }

    return balances;
  } catch (err) {
    console.error('Failed to fetch balances:', err);
    return { XLM: 0 };
  }
}

/**
 * Fetch orderbook for a trading pair
 */
export async function fetchOrderbook(sellingAsset, buyingAsset, limit = 15) {
  try {
    const orderbook = await horizonServer
      .orderbook(sellingAsset, buyingAsset)
      .limit(limit)
      .call();

    return {
      bids: orderbook.bids.map(b => ({
        price: parseFloat(b.price),
        amount: parseFloat(b.amount),
      })),
      asks: orderbook.asks.map(a => ({
        price: parseFloat(a.price),
        amount: parseFloat(a.amount),
      })),
    };
  } catch (err) {
    console.error('Failed to fetch orderbook:', err);
    return { bids: [], asks: [] };
  }
}

/**
 * Stream orderbook updates
 * Returns a close function to stop streaming
 */
export function streamOrderbook(sellingAsset, buyingAsset, onUpdate) {
  const close = horizonServer
    .orderbook(sellingAsset, buyingAsset)
    .cursor('now')
    .stream({
      onmessage: (update) => {
        onUpdate({
          bids: update.bids.map(b => ({
            price: parseFloat(b.price),
            amount: parseFloat(b.amount),
          })),
          asks: update.asks.map(a => ({
            price: parseFloat(a.price),
            amount: parseFloat(a.amount),
          })),
        });
      },
      onerror: (err) => {
        console.error('Orderbook stream error:', err);
      },
    });

  return close;
}

/**
 * Build and return a manage sell offer transaction
 */
export async function buildSwapTransaction(publicKey, sellingAsset, buyingAsset, amount, price) {
  const account = await loadAccount(publicKey);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.manageSellOffer({
        selling: sellingAsset,
        buying: buyingAsset,
        amount: amount.toString(),
        price: price.toString(),
        offerId: '0', // New offer
      })
    )
    .setTimeout(30)
    .build();

  return transaction;
}

/**
 * Submit a signed transaction to the network
 */
export async function submitTransaction(signedXdr) {
  const transaction = TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );
  return await horizonServer.submitTransaction(transaction);
}

/**
 * Fund an account on testnet via Friendbot
 */
export async function fundAccount(publicKey) {
  try {
    const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
    if (!response.ok) throw new Error('Friendbot request failed');
    return await response.json();
  } catch (err) {
    console.error('Failed to fund account:', err);
    throw err;
  }
}

/**
 * Format a public key for display (truncated)
 */
export function truncateAddress(address, start = 4, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a number with commas and decimal places
 */
export function formatAmount(amount, decimals = 7) {
  if (!amount && amount !== 0) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}
