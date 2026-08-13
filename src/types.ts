export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  walletName: string | null;
  balanceXlm: string;
  balanceUsdc: string;
}

export type WalletType = 'albedo' | 'demo' | 'freighter' | 'lobstr' | 'xbull' | 'rabet';

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

export type EventType = 'swap' | 'deposit' | 'escrow_create' | 'escrow_fund' | 'escrow_release' | 'escrow_refund';

export interface ContractEvent {
  id: string;
  type: EventType;
  user: string;
  tokenIn?: string;
  tokenOut?: string;
  token?: string;
  amountIn?: string;
  amountOut?: string;
  amount?: string;
  escrowId?: number;
  timestamp: string;
  txHash: string;
}

export interface PoolReserves {
  xlm: string;
  usdc: string;
  feeBps: number;
}

export type EscrowStatus = 'Created' | 'Funded' | 'Released' | 'Refunded';

export interface EscrowItem {
  id: number;
  payer: string;
  payee: string;
  token: string;
  amount: string;
  state: EscrowStatus;
  timeoutLedger: number;
  createdAt: string;
  txHash: string;
}

export interface UserFeedback {
  id: string;
  walletAddress: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface AppError {
  type: 'WALLET_NOT_FOUND' | 'USER_REJECTED' | 'INSUFFICIENT_BALANCE' | 'TIMEOUT_NOT_EXPIRED' | 'UNKNOWN';
  title: string;
  message: string;
  actionHint: string;
  rawDetails?: string;
}

// ── Level 5 (Blue Belt) Types ──

export type AppTab = 'swap' | 'escrow' | 'analytics';

export interface PlatformStats {
  totalSwaps: number;
  totalEscrows: number;
  totalVolume: string;
  uniqueUsers: number;
  avgRating: number;
  totalFeedback: number;
  uptimePercent: number;
  dailyActivity: DailyActivity[];
}

export interface DailyActivity {
  date: string;
  swaps: number;
  escrows: number;
  users: number;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
}

export interface UserGrowthEntry {
  walletAddress: string;
  joinedAt: string;
  totalTxs: number;
  lastActive: string;
}

