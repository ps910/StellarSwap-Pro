import { isConnected as checkFreighter, getAddress as getFreighterAddress } from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';
import { WalletOption, WalletType, AppError } from '../types';

export const SUPPORTED_WALLETS: WalletOption[] = [
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '✨',
    description: 'Web-based lightweight wallet requiring no browser extension',
    isInstalled: true,
  },
  {
    id: 'demo',
    name: 'Demo Testnet Account',
    icon: '⚡',
    description: 'Instant 1-click testnet account for reviewing & testing features',
    isInstalled: true,
  },
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    description: 'Official browser extension wallet by Stellar Development Foundation',
    isInstalled: false,
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🦞',
    description: 'Popular Stellar mobile wallet & browser extension',
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
    albedo: true,
    demo: true,
    freighter: freighterInstalled,
    lobstr: lobstrInstalled,
    xbull: xbullInstalled,
    rabet: rabetInstalled,
  };
}

export async function connectWallet(walletId: WalletType): Promise<string> {
  try {
    if (walletId === 'demo') {
      return 'GCNJYHKOM3Y7P2L5X99AA11BB22CC33DD44EE55FF66GG77HH';
    }

    if (walletId === 'albedo') {
      const res = await albedo.publicKey({});
      return res.pubkey;
    }

    if (walletId === 'freighter') {
      try {
        const isConnRes = await checkFreighter();
        const isConn = typeof isConnRes === 'boolean' ? isConnRes : !!(isConnRes as any)?.isConnected;
        if (isConn) {
          const addrRes = await getFreighterAddress();
          const address = typeof addrRes === 'string' ? addrRes : (addrRes as any)?.address;
          if (address) return address;
        }
      } catch {
        /* fallback below */
      }
      console.warn('[Wallet] Freighter extension not active, connecting via Albedo Web Auth');
      const res = await albedo.publicKey({});
      return res.pubkey;
    }

    if (walletId === 'rabet') {
      try {
        const rabet = (window as any).rabet;
        if (rabet) {
          const res = await rabet.connect();
          if (res?.publicKey) return res.publicKey;
        }
      } catch {
        /* fallback below */
      }
      console.warn('[Wallet] Rabet extension not active, connecting via Albedo Web Auth');
      const res = await albedo.publicKey({});
      return res.pubkey;
    }

    if (walletId === 'xbull') {
      try {
        const xbull = (window as any).xBull;
        if (xbull) {
          const address = await xbull.connect();
          if (address) return address;
        }
      } catch {
        /* fallback below */
      }
      console.warn('[Wallet] xBull extension not active, connecting via Albedo Web Auth');
      const res = await albedo.publicKey({});
      return res.pubkey;
    }

    if (walletId === 'lobstr') {
      try {
        const lobstr = (window as any).lobstr;
        if (lobstr) {
          const address = await lobstr.getPublicKey();
          if (address) return address;
        }
      } catch {
        /* fallback below */
      }
      console.warn('[Wallet] LOBSTR extension not active, connecting via Albedo Web Auth');
      const res = await albedo.publicKey({});
      return res.pubkey;
    }

    throw new Error('UNKNOWN_WALLET');
  } catch (err: any) {
    if (err && typeof err === 'object' && 'type' in err && 'title' in err) {
      throw err;
    }
    throw parseWalletError(err, 'connect');
  }
}

export function parseWalletError(error: any, context: 'connect' | 'tx' = 'tx'): AppError {
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
      actionHint: 'Please install the browser extension or select Albedo Web Wallet which requires no extension.',
      rawDetails: msg,
    };
  }

  if (
    msg.includes('USER_CANCELLED') ||
    msg.includes('User rejected') ||
    msg.includes('rejected') ||
    msg.includes('closed') ||
    msg.includes('declined') ||
    msg.includes('User denied') ||
    msg.includes('user_declined')
  ) {
    if (context === 'connect') {
      return {
        type: 'USER_REJECTED',
        title: 'Wallet Connection Declined',
        message: 'The connection request was closed or declined in your wallet prompt.',
        actionHint: 'Click "Connect Wallet" again and approve the request in your wallet popup, or select Albedo Web Wallet.',
        rawDetails: msg,
      };
    }
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
    title: context === 'connect' ? 'Wallet Connection Failed' : 'Wallet Interaction Failed',
    message: 'An unexpected issue occurred while communicating with the Stellar wallet.',
    actionHint: 'Check browser popup permissions or select Albedo Web Wallet.',
    rawDetails: msg,
  };
}
