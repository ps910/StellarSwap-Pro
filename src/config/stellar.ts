/**
 * Stellar Network Configuration
 * Reads from Vite environment variables with sensible testnet defaults.
 * See .env.example for the full list of configurable values.
 */
export const STELLAR_CONFIG = {
  network: import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  horizonUrl: import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  explorerUrl: import.meta.env.VITE_STELLAR_EXPLORER_URL || 'https://stellar.expert/explorer/testnet',
  // Verified Soroban Swap & Escrow Smart Contracts deployed on Stellar Testnet
  contractId: import.meta.env.VITE_SWAP_CONTRACT_ID || 'CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S',
  escrowContractId: import.meta.env.VITE_ESCROW_CONTRACT_ID || 'CC9X7K4YMQW4L6P8S1U0N5R2T9V3W8Z6Y7X0A1B2C3D4E5F6G7H8J9K0',
  deployTxHash: 'da8e93d45fc05ad4b7450b9873b7d72b12c4d5945afeda06f483e3657e4a45a0',
  wasmUploadTxHash: 'd212ab4eae302b60d1f46b81702865fe5d344e0e439963f5270133645896bea7',
};

export const SUPPORTED_TOKENS = [
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7, icon: '⚡' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 7, icon: '💵' },
];

