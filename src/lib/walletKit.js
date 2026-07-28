/**
 * StellarWalletsKit Setup (v2.5.0)
 * Multi-wallet integration with Freighter, xBull, and LOBSTR
 * Uses the static API pattern with subpath module imports
 */
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule, XBULL_ID } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { LobstrModule, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { NETWORK_PASSPHRASE } from './stellar';

// ── Wallet Metadata ──
export const WALLET_OPTIONS = [
  {
    id: FREIGHTER_ID,
    name: 'Freighter',
    icon: '🚀',
    iconClass: 'wallet-option__icon--freighter',
    description: 'Most popular Stellar wallet',
  },
  {
    id: XBULL_ID,
    name: 'xBull',
    icon: '🐂',
    iconClass: 'wallet-option__icon--xbull',
    description: 'Advanced Stellar wallet',
  },
  {
    id: LOBSTR_ID,
    name: 'LOBSTR',
    icon: '🦞',
    iconClass: 'wallet-option__icon--lobstr',
    description: 'User-friendly mobile wallet',
  },
];

// ── Initialize Kit ──
let initialized = false;

export function initWalletKit() {
  if (initialized) return;

  StellarWalletsKit.init({
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
    ],
    network: Networks.TESTNET,
    selectedWalletId: FREIGHTER_ID,
  });

  initialized = true;
}

/**
 * Connect to a specific wallet
 * @param {string} walletId - The wallet identifier
 * @returns {Promise<string>} - The public key
 */
export async function connectWallet(walletId) {
  initWalletKit();
  StellarWalletsKit.setWallet(walletId);

  const { address } = await StellarWalletsKit.getAddress();
  return address;
}

/**
 * Sign a transaction XDR using the connected wallet
 * @param {string} xdr - The transaction XDR to sign
 * @returns {Promise<string>} - The signed XDR
 */
export async function signTransaction(xdr) {
  initWalletKit();
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  return signedTxXdr;
}

/**
 * Disconnect the wallet
 */
export async function disconnectWallet() {
  if (initialized) {
    await StellarWalletsKit.disconnect();
  }
}
