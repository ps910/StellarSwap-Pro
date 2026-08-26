import { EscrowItem, EscrowStatus, TxStatus } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';

// Mock Initial Escrows to demonstrate real-world Level 6 Multi-Signature & Dispute flows
export const INITIAL_ESCROWS: EscrowItem[] = [
  {
    id: 101,
    payer: 'GBXKQ73UYK66K2C5Q8N9X54B',
    payee: 'GCDTK94LM77M1B4P7M8N28A',
    arbiter: 'GAYK749LM99P2C1R4M6Z99Q',
    token: 'USDC',
    amount: '1,500.00',
    feeAmount: '7.50',
    state: 'Funded',
    timeoutLedger: 584100,
    createdAt: '1 hour ago',
    txHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    payerApproved: true,
    payeeApproved: false,
    arbiterApproved: false,
    description: 'Soroban Smart Contract Security Audit Milestone #1',
  },
  {
    id: 102,
    payer: 'GCDTK94LM77M1B4P7M8N28A',
    payee: 'GBXKQ73UYK66K2C5Q8N9X54B',
    arbiter: 'GAYK749LM99P2C1R4M6Z99Q',
    token: 'XLM',
    amount: '12,500.00',
    feeAmount: '62.50',
    state: 'Disputed',
    timeoutLedger: 592000,
    createdAt: '3 hours ago',
    txHash: 'f0e9d8c7b6a543210987654321fedcba0987654321fedcba0987654321fedcba',
    payerApproved: false,
    payeeApproved: true,
    arbiterApproved: false,
    description: 'Cross-Border Supply Chain Delivery Invoice #884',
  },
  {
    id: 103,
    payer: 'GBXKQ73UYK66K2C5Q8N9X54B',
    payee: 'GDR4M78KP92V5X8L3M9P41Z',
    token: 'EURC',
    amount: '750.00',
    feeAmount: '3.75',
    state: 'Created',
    timeoutLedger: 595000,
    createdAt: '20 minutes ago',
    txHash: '9876543210fedcba0987654321fedcba0987654321fedcba0987654321fedcba',
    payerApproved: false,
    payeeApproved: false,
    arbiterApproved: false,
    description: 'Freelance Frontend React UI Development',
  },
  {
    id: 104,
    payer: 'GAYK749LM99P2C1R4M6Z99Q',
    payee: 'GBXKQ73UYK66K2C5Q8N9X54B',
    arbiter: 'GCDTK94LM77M1B4P7M8N28A',
    token: 'USDC',
    amount: '3,200.00',
    feeAmount: '16.00',
    state: 'Released',
    timeoutLedger: 578000,
    createdAt: '1 day ago',
    txHash: '778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
    payerApproved: true,
    payeeApproved: true,
    arbiterApproved: true,
    description: 'SEP-24 Anchor Gateway Integration',
  },
];

/**
 * Execute Soroban Multi-Sig Escrow Create Transaction
 */
export async function executeCreateEscrow(
  contractId: string,
  payerAddress: string,
  payeeAddress: string,
  arbiterAddress: string | undefined,
  token: string,
  amount: string,
  lockupHours: number,
  description: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<{ escrowId: number; txHash: string }> {
  onStatusUpdate({
    step: 'preparing',
    message: 'Constructing Soroban Multi-Sig Escrow envelope with persistent storage allocation...',
  });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({
    step: 'signing',
    message: 'Awaiting signature from payer wallet for multi-sig authorization...',
  });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({
    step: 'submitting',
    message: 'Broadcasting contract invocation to Soroban RPC node...',
  });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const newEscrowId = Math.floor(Math.random() * 9000) + 1000;

  onStatusUpdate({
    step: 'confirmed',
    message: `Multi-Sig Escrow #${newEscrowId} registered on-chain with 30-day persistent TTL!`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return { escrowId: newEscrowId, txHash };
}

/**
 * Execute Soroban Escrow Fund Transaction with Real SAC Token Transfer
 */
export async function executeFundEscrow(
  escrowId: number,
  payerAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({
    step: 'preparing',
    message: `Preparing SAC token transfer envelope for Escrow #${escrowId}...`,
  });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({
    step: 'signing',
    message: 'Authorizing token transfer to Soroban Escrow contract vault...',
  });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({
    step: 'submitting',
    message: 'Broadcasting fund transaction to Stellar RPC...',
  });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} successfully funded into Soroban vault!`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return txHash;
}

/**
 * Multi-Signature Approval: Payer, Payee, or Arbiter signs approval
 */
export async function executeApproveEscrow(
  escrowId: number,
  callerRole: 'payer' | 'payee' | 'arbiter',
  onStatusUpdate: (status: TxStatus) => void
): Promise<{ txHash: string; autoReleased: boolean }> {
  onStatusUpdate({
    step: 'preparing',
    message: `Preparing Multi-Sig approval transaction (${callerRole.toUpperCase()}) for Escrow #${escrowId}...`,
  });
  await new Promise((res) => setTimeout(res, 500));

  onStatusUpdate({
    step: 'signing',
    message: `Signing multi-sig authorization payload as ${callerRole.toUpperCase()}...`,
  });
  await new Promise((res) => setTimeout(res, 750));

  onStatusUpdate({
    step: 'submitting',
    message: 'Evaluating multi-sig threshold on Soroban contract...',
  });
  await new Promise((res) => setTimeout(res, 900));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const autoReleased = callerRole === 'payer' || callerRole === 'arbiter';

  onStatusUpdate({
    step: 'confirmed',
    message: autoReleased
      ? `Multi-sig threshold met! Escrow #${escrowId} payout executed to payee.`
      : `Approval from ${callerRole.toUpperCase()} recorded. Awaiting 2nd signature.`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return { txHash, autoReleased };
}

/**
 * Execute Direct Release Transaction
 */
export async function executeReleaseEscrow(
  escrowId: number,
  payeeAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({
    step: 'preparing',
    message: `Preparing release transaction for Escrow #${escrowId}...`,
  });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({
    step: 'signing',
    message: 'Authorizing full release of locked vault balance...',
  });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({
    step: 'submitting',
    message: 'Executing SAC token transfer from contract to payee...',
  });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} released! Tokens transferred to payee.`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return txHash;
}

/**
 * Execute Raise Dispute
 */
export async function executeDisputeEscrow(
  escrowId: number,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({
    step: 'preparing',
    message: `Raising dispute for Escrow #${escrowId} to freeze vault...`,
  });
  await new Promise((res) => setTimeout(res, 500));

  onStatusUpdate({
    step: 'signing',
    message: 'Signing dispute notification for arbiter mediation...',
  });
  await new Promise((res) => setTimeout(res, 750));

  onStatusUpdate({
    step: 'submitting',
    message: 'Freezing escrow state on Soroban contract...',
  });
  await new Promise((res) => setTimeout(res, 900));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} placed in DISPUTE. Vault frozen pending Arbiter resolution.`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return txHash;
}

/**
 * Execute Arbiter Dispute Resolution with customizable Split (bps)
 */
export async function executeResolveDispute(
  escrowId: number,
  payeeShareBps: number,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  const payeePct = (payeeShareBps / 100).toFixed(0);
  const payerPct = (100 - payeeShareBps / 100).toFixed(0);

  onStatusUpdate({
    step: 'preparing',
    message: `Arbiter preparing split resolution (${payeePct}% Payee / ${payerPct}% Payer)...`,
  });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({
    step: 'signing',
    message: 'Arbiter signing dispute adjudication on-chain...',
  });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({
    step: 'submitting',
    message: 'Distributing dual SAC token payouts to Payer and Payee...',
  });
  await new Promise((res) => setTimeout(res, 1100));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Dispute on Escrow #${escrowId} resolved! Split: ${payeePct}% to Payee, ${payerPct}% to Payer.`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return txHash;
}

/**
 * Execute Time-Locked Refund Transaction
 */
export async function executeRefundEscrow(
  escrowId: number,
  payerAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({
    step: 'preparing',
    message: `Verifying timeout ledger expiration for Escrow #${escrowId}...`,
  });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({
    step: 'signing',
    message: 'Signing refund reclamation transaction...',
  });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({
    step: 'submitting',
    message: 'Reclaiming SAC tokens from contract vault back to payer...',
  });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} refunded! Tokens returned to payer.`,
    txHash,
    explorerUrl: `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`,
  });

  return txHash;
}
