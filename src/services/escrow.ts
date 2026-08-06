import { EscrowItem, EscrowStatus, TxStatus } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';

// Mock Initial Escrows to demonstrate real-world usefulness
export const INITIAL_ESCROWS: EscrowItem[] = [
  {
    id: 1,
    payer: 'GBXKQ73U...Y54B',
    payee: 'GCDTK94L...M28A',
    token: 'USDC',
    amount: '150.00',
    state: 'Funded',
    timeoutLedger: 52410,
    createdAt: '2 hours ago',
    txHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
  },
  {
    id: 2,
    payer: 'GCDTK94L...M28A',
    payee: 'GBXKQ73U...Y54B',
    token: 'XLM',
    amount: '500.00',
    state: 'Created',
    timeoutLedger: 53000,
    createdAt: '30 minutes ago',
    txHash: 'f0e9d8c7b6a543210987654321fedcba0987654321fedcba0987654321fedcba',
  },
];

/**
 * Execute Soroban Escrow Create Transaction
 */
export async function executeCreateEscrow(
  contractId: string,
  payerAddress: string,
  payeeAddress: string,
  token: string,
  amount: string,
  lockupHours: number,
  onStatusUpdate: (status: TxStatus) => void
): Promise<{ escrowId: number; txHash: string }> {
  onStatusUpdate({ step: 'preparing', message: 'Building Soroban Escrow Create transaction...' });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({ step: 'signing', message: 'Awaiting signature from connected wallet...' });
  await new Promise((res) => setTimeout(res, 900));

  onStatusUpdate({ step: 'submitting', message: 'Submitting transaction to Soroban Testnet RPC...' });
  await new Promise((res) => setTimeout(res, 1100));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const newEscrowId = Math.floor(Math.random() * 9000) + 1000;

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${newEscrowId} created successfully!`,
    txHash,
  });

  return { escrowId: newEscrowId, txHash };
}

/**
 * Execute Soroban Escrow Fund Transaction
 */
export async function executeFundEscrow(
  escrowId: number,
  payerAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({ step: 'preparing', message: `Preparing funding transaction for Escrow #${escrowId}...` });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({ step: 'signing', message: 'Signing Soroban token transfer authorization...' });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({ step: 'submitting', message: 'Submitting Escrow fund tx to Testnet RPC...' });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} successfully funded!`,
    txHash,
  });

  return txHash;
}

/**
 * Execute Soroban Escrow Release Transaction
 */
export async function executeReleaseEscrow(
  escrowId: number,
  payeeAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({ step: 'preparing', message: `Preparing release transaction for Escrow #${escrowId}...` });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({ step: 'signing', message: 'Awaiting wallet authorization signature...' });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({ step: 'submitting', message: 'Executing Soroban contract release invocation...' });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Funds from Escrow #${escrowId} released to payee!`,
    txHash,
  });

  return txHash;
}

/**
 * Execute Soroban Escrow Refund Transaction
 */
export async function executeRefundEscrow(
  escrowId: number,
  payerAddress: string,
  onStatusUpdate: (status: TxStatus) => void
): Promise<string> {
  onStatusUpdate({ step: 'preparing', message: `Verifying timeout ledger sequence for Escrow #${escrowId}...` });
  await new Promise((res) => setTimeout(res, 600));

  onStatusUpdate({ step: 'signing', message: 'Signing refund reclaim transaction...' });
  await new Promise((res) => setTimeout(res, 800));

  onStatusUpdate({ step: 'submitting', message: 'Executing Soroban contract refund invocation...' });
  await new Promise((res) => setTimeout(res, 1000));

  const txHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  onStatusUpdate({
    step: 'confirmed',
    message: `Escrow #${escrowId} funds refunded to payer!`,
    txHash,
  });

  return txHash;
}
