export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  walletName: string | null;
  balanceXlm: string;
  balanceUsdc: string;
  balanceEurc?: string;
  balanceYxlm?: string;
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
  explorerUrl?: string;
}

export type EventType =
  | 'swap'
  | 'deposit'
  | 'withdraw'
  | 'escrow_create'
  | 'escrow_fund'
  | 'escrow_release'
  | 'escrow_refund'
  | 'escrow_approve'
  | 'escrow_dispute'
  | 'escrow_resolve';

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
  totalLp?: string;
}

export type EscrowStatus = 'Created' | 'Funded' | 'Released' | 'Refunded' | 'Disputed' | 'Resolved';

export interface EscrowItem {
  id: number;
  payer: string;
  payee: string;
  arbiter?: string;
  token: string;
  amount: string;
  feeAmount?: string;
  state: EscrowStatus;
  timeoutLedger: number;
  createdAt: string;
  txHash: string;
  payerApproved: boolean;
  payeeApproved: boolean;
  arbiterApproved: boolean;
  description?: string;
  resolutionSplit?: {
    payeeAmount: string;
    payerAmount: string;
    payeeShareBps: number;
  };
}

export interface UserFeedback {
  id: string;
  walletAddress: string;
  rating: number;
  comment: string;
  timestamp: string;
  npsScore?: number;
  featureVote?: string;
}

export interface AppError {
  type: 'WALLET_NOT_FOUND' | 'USER_REJECTED' | 'INSUFFICIENT_BALANCE' | 'TIMEOUT_NOT_EXPIRED' | 'NO_TRUSTLINE' | 'INSUFFICIENT_RESERVE' | 'DISPUTED' | 'UNKNOWN';
  title: string;
  message: string;
  actionHint: string;
  rawDetails?: string;
}

// ── Level 5 (Blue Belt) & Level 6 (Black Belt) Types ──

export type AppTab = 'swap' | 'escrow' | 'analytics' | 'multisig';

export type NetworkMode = 'mainnet' | 'testnet';

export interface PlatformStats {
  totalSwaps: number;
  totalEscrows: number;
  totalVolume: string;
  uniqueUsers: number;
  avgRating: number;
  totalFeedback: number;
  uptimePercent: number;
  dailyActivity: DailyActivity[];
  mainnetVerifiedUsers: number;
  mainnetTxCount: number;
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

export type TrustlineStatus = 'exists' | 'missing' | 'unknown';

export type ViewMode = 'simple' | 'pro';
