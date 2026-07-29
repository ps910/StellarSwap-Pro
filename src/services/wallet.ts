import { isConnected as checkFreighter, getAddress as getFreighterAddress } from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';
import { WalletOption, WalletType, AppError } from '../types';

export const SUPPORTED_WALLETS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    description: 'Official browser extension wallet by Stellar Development Foundation',
    isInstalled: false,
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '✨',
    description: 'Web-based lightweight wallet requiring no extension installation',
    isInstalled: true,
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🦞',
    description: 'Popular Stellar mobile wallet with browser extension link',
    isInstalled: false,
  },
  {
    id: 'xbull',
    name: 'xBull',
    icon: '🐂',
    description: 'Feature-rich extension wallet designed for DeFi power users',
    isInstalled: false,
  },
  {
    id: 'rabet',
    name: 'Rabet',
    icon: '🐇',
    description: 'Sleek browser extension wallet for Stellar & Soroban ecosystem',
    isInstalled: false,
  },
];

export async function checkInstalledWallets(): Promise<Record<WalletType, boolean>> {
  let freighterInstalled = false;
  try {
    const res = await checkFreighter();
    freighterInstalled = typeof res === 'boolean' ? res : !!(res as any)?.isConnected;
  } catch {
    freighterInstalled = false;
  }

  const rabetInstalled = typeof window !== 'undefined' && !!(window as any).rabet;
  const xbullInstalled = typeof window !== 'undefined' && !!(window as any).xBull;
  const lobstrInstalled = typeof window !== 'undefined' && !!(window as any).lobstr;

  return {
    freighter: freighterInstalled,
    albedo: true,
    lobstr: lobstrInstalled,
    xbull: xbullInstalled,
    rabet: rabetInstalled,
  };
}

export async function connectWallet(walletId: WalletType): Promise<string> {
  try {
    if (walletId === 'freighter') {
      const isConnRes = await checkFreighter();
      const isConn = typeof isConnRes === 'boolean' ? isConnRes : !!(isConnRes as any)?.isConnected;
      if (!isConn) {
        throw parseWalletError(new Error('FREIGHTER_NOT_INSTALLED'));
      }
      const addrRes = await getFreighterAddress();
      const address = typeof addrRes === 'string' ? addrRes : (addrRes as any)?.address;
      if (!address) {
        throw parseWalletError(new Error('USER_CANCELLED'));
      }
      return address;
    } else if (walletId === 'albedo') {
      const res = await albedo.publicKey({});
      return res.pubkey;
    } else if (walletId === 'rabet') {
      const rabet = (window as any).rabet;
      if (!rabet) throw parseWalletError(new Error('RABET_NOT_INSTALLED'));
      const res = await rabet.connect();
      return res.publicKey;
    } else if (walletId === 'xbull') {
      const xbull = (window as any).xBull;
      if (!xbull) throw parseWalletError(new Error('XBULL_NOT_INSTALLED'));
      const address = await xbull.connect();
      return address;
    } else if (walletId === 'lobstr') {
      const lobstr = (window as any).lobstr;
      if (!lobstr) throw parseWalletError(new Error('LOBSTR_NOT_INSTALLED'));
      const address = await lobstr.getPublicKey();
      return address;
    }

    throw parseWalletError(new Error('UNKNOWN_WALLET'));
  } catch (err: any) {
    throw parseWalletError(err);
  }
}

export function parseWalletError(error: any): AppError {
  const msg = error?.message || String(error || '');

  if (
    msg.includes('NOT_INSTALLED') ||
    msg.includes('Freighter not found') ||
    msg.includes('Extension not detected')
  ) {
    return {
      type: 'WALLET_NOT_FOUND',
      title: 'Wallet Extension Not Installed',
      message: 'The selected Stellar wallet extension was not detected in your browser.',
      actionHint: 'Please install the wallet extension from Chrome Web Store or choose Albedo Web Wallet.',
      rawDetails: msg,
    };
  }

  if (
    msg.includes('USER_CANCELLED') ||
    msg.includes('User rejected') ||
    msg.includes('rejected') ||
    msg.includes('closed') ||
    msg.includes('declined') ||
    msg.includes('User denied')
  ) {
    return {
      type: 'USER_REJECTED',
      title: 'Transaction Signature Rejected',
      message: 'You explicitly cancelled or closed the signature prompt in your wallet.',
      actionHint: 'To complete the action, click swap/deposit again and approve the request in your wallet popup.',
      rawDetails: msg,
    };
  }

  if (
    msg.includes('INSUFFICIENT_BALANCE') ||
    msg.includes('tx_insufficient_balance') ||
    msg.includes('underfunded') ||
    msg.includes('low balance')
  ) {
    return {
      type: 'INSUFFICIENT_BALANCE',
      title: 'Insufficient Balance',
      message: 'Your wallet balance is too low to cover the amount and required Stellar network fee.',
      actionHint: 'Fund your Testnet account using Friendbot or reduce your swap/deposit amount.',
      rawDetails: msg,
    };
  }

  return {
    type: 'UNKNOWN',
    title: 'Wallet Interaction Failed',
    message: 'An unexpected issue occurred while communicating with the Stellar wallet.',
    actionHint: 'Check browser extension permissions or select a different wallet.',
    rawDetails: msg,
  };
}
