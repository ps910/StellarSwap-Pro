export const STELLAR_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  explorerUrl: 'https://stellar.expert/explorer/testnet',
  // Verified Soroban Smart Contract deployed on Stellar Testnet
  contractId: 'CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S',
  deployTxHash: 'da8e93d45fc05ad4b7450b9873b7d72b12c4d5945afeda06f483e3657e4a45a0',
  wasmUploadTxHash: 'd212ab4eae302b60d1f46b81702865fe5d344e0e439963f5270133645896bea7',
};

export const SUPPORTED_TOKENS = [
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7, icon: '⚡' },
  { symbol: 'USDC', name: 'USD Coin', decimals: 7, icon: '💵' },
];
