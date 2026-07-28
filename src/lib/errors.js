/**
 * Custom Error Types for Stellar Token Swap
 * Handles 3 distinct error scenarios as required:
 * 1. WalletNotFoundError  — wallet extension not installed
 * 2. TransactionRejectedError — user declined to sign
 * 3. InsufficientBalanceError — not enough funds
 */

// ── Error Classes ──

export class WalletNotFoundError extends Error {
  constructor(walletName = 'Unknown') {
    super(`${walletName} wallet is not installed or not available in your browser.`);
    this.name = 'WalletNotFoundError';
    this.walletName = walletName;
    this.code = 'WALLET_NOT_FOUND';
    this.suggestion = `Please install ${walletName} browser extension and refresh the page.`;
  }
}

export class TransactionRejectedError extends Error {
  constructor(reason = 'User declined to sign the transaction') {
    super(reason);
    this.name = 'TransactionRejectedError';
    this.code = 'TRANSACTION_REJECTED';
    this.suggestion = 'Please try the transaction again and approve it in your wallet.';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(asset = 'XLM', required = 0, available = 0) {
    super(
      `Insufficient ${asset} balance. Required: ${required}, Available: ${available}`
    );
    this.name = 'InsufficientBalanceError';
    this.code = 'INSUFFICIENT_BALANCE';
    this.asset = asset;
    this.required = required;
    this.available = available;
    this.suggestion = `You need at least ${required} ${asset}. Current balance: ${available} ${asset}.`;
  }
}

// ── Error Detection & Classification ──

/**
 * Classify a raw error into one of our custom error types
 */
export function classifyError(error) {
  const msg = (error?.message || error?.toString() || '').toLowerCase();

  // Wallet not found patterns
  if (
    msg.includes('not installed') ||
    msg.includes('not found') ||
    msg.includes('not available') ||
    msg.includes('no provider') ||
    msg.includes('wallet not') ||
    msg.includes('extension not') ||
    msg.includes('unable to find')
  ) {
    return new WalletNotFoundError();
  }

  // Transaction rejected patterns
  if (
    msg.includes('rejected') ||
    msg.includes('denied') ||
    msg.includes('cancelled') ||
    msg.includes('canceled') ||
    msg.includes('user refused') ||
    msg.includes('user declined') ||
    msg.includes('user closed') ||
    msg.includes('popup closed') ||
    msg.includes('request was rejected')
  ) {
    return new TransactionRejectedError();
  }

  // Insufficient balance patterns
  if (
    msg.includes('insufficient') ||
    msg.includes('underfunded') ||
    msg.includes('op_underfunded') ||
    msg.includes('not enough') ||
    msg.includes('balance too low') ||
    msg.includes('op_low_reserve')
  ) {
    return new InsufficientBalanceError();
  }

  // Return original error if unrecognized
  return error;
}

/**
 * Get toast configuration for an error
 */
export function getErrorToast(error) {
  if (error instanceof WalletNotFoundError) {
    return {
      type: 'error',
      title: '🔌 Wallet Not Found',
      message: error.message,
      suggestion: error.suggestion,
    };
  }

  if (error instanceof TransactionRejectedError) {
    return {
      type: 'warning',
      title: '✋ Transaction Rejected',
      message: error.message,
      suggestion: error.suggestion,
    };
  }

  if (error instanceof InsufficientBalanceError) {
    return {
      type: 'error',
      title: '💰 Insufficient Balance',
      message: error.message,
      suggestion: error.suggestion,
    };
  }

  // Generic fallback
  return {
    type: 'error',
    title: '❌ Error',
    message: error?.message || 'An unexpected error occurred',
    suggestion: 'Please try again or check the console for details.',
  };
}
