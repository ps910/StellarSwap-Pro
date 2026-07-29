export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  walletName: string | null;
  balanceXlm: string;
  balanceUsdc: string;
}

export type WalletType = 'freighter' | 'albedo' | 'lobstr' | 'xbull' | 'rabet';

export interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isInstalled: boolean;
}

export type TxStep = 'idle' | 'preparing' | 'signing' | 'submitting' | 'confirmed' | 'failed';

export interface TxStatus {
  step: TxStep;
  message: string;
  txHash?: string;
  error?: string;
}

export interface ContractEvent {
  id: string;
  type: 'swap' | 'deposit';
  user: string;
  tokenIn?: string;
  tokenOut?: string;
  token?: string;
  amountIn?: string;
  amountOut?: string;
  amount?: string;
  timestamp: string;
  txHash: string;
}

export interface PoolReserves {
  xlm: string;
  usdc: string;
  feeBps: number;
}

export interface AppError {
  type: 'WALLET_NOT_FOUND' | 'USER_REJECTED' | 'INSUFFICIENT_BALANCE' | 'UNKNOWN';
  title: string;
  message: string;
  actionHint: string;
  rawDetails?: string;
}
