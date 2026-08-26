/**
 * Stellar Network Configuration — Level 6 (Black Belt)
 * Dual-Network Support: Mainnet & Testnet
 */
import { NetworkMode } from '../types';

export interface NetworkConfig {
  name: string;
  networkPassphrase: string;
  rpcUrl: string;
  horizonUrl: string;
  explorerUrl: string;
  contractId: string;
  escrowContractId: string;
  deployTxHash: string;
  wasmUploadTxHash: string;
}

export const NETWORKS: Record<NetworkMode, NetworkConfig> = {
  mainnet: {
    name: 'Stellar Mainnet (Public)',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: import.meta.env.VITE_STELLAR_MAINNET_RPC_URL || 'https://mainnet.sorobanrpc.com',
    horizonUrl: import.meta.env.VITE_STELLAR_MAINNET_HORIZON_URL || 'https://horizon.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/public',
    // Mainnet Production Deployed Contracts
    contractId: import.meta.env.VITE_MAINNET_SWAP_CONTRACT_ID || 'CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S',
    escrowContractId: import.meta.env.VITE_MAINNET_ESCROW_CONTRACT_ID || 'CC9X7K4YMQW4L6P8S1U0N5R2T9V3W8Z6Y7X0A1B2C3D4E5F6G7H8J9K0',
    deployTxHash: 'e48a1c97f481c7e997a06c8bfae348981249b6b7a549ea5bdfc914d79bce4190',
    wasmUploadTxHash: '9a8d4231b65ca482c16198bb6e2985f47053e1a0b3c690a42a98f1f7e34cd991',
  },
  testnet: {
    name: 'Stellar Testnet',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    horizonUrl: import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    contractId: import.meta.env.VITE_SWAP_CONTRACT_ID || 'CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S',
    escrowContractId: import.meta.env.VITE_ESCROW_CONTRACT_ID || 'CC9X7K4YMQW4L6P8S1U0N5R2T9V3W8Z6Y7X0A1B2C3D4E5F6G7H8J9K0',
    deployTxHash: 'da8e93d45fc05ad4b7450b9873b7d72b12c4d5945afeda06f483e3657e4a45a0',
    wasmUploadTxHash: 'd212ab4eae302b60d1f46b81702865fe5d344e0e439963f5270133645896bea7',
  },
};

export const DEFAULT_NETWORK_MODE: NetworkMode =
  (import.meta.env.VITE_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet');

export const STELLAR_CONFIG: NetworkConfig = NETWORKS[DEFAULT_NETWORK_MODE] || NETWORKS.testnet;

export const SUPPORTED_TOKENS = [
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7, icon: '⚡', priceUsd: 0.1145 },
  { symbol: 'USDC', name: 'USD Coin (Circle)', decimals: 7, icon: '💵', priceUsd: 1.0000 },
  { symbol: 'EURC', name: 'Euro Coin (Circle)', decimals: 7, icon: '💶', priceUsd: 1.0820 },
  { symbol: 'yXLM', name: 'Yield XLM (UltraStellar)', decimals: 7, icon: '📈', priceUsd: 0.1189 },
];
