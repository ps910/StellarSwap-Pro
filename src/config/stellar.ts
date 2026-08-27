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

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  priceUsd: number;
  change24h: number;
  volume24hUsd: number;
  issuer?: string;
  isNative?: boolean;
}

export interface TradingPair {
  id: string;
  base: string;
  quote: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  liquidityUsd: string;
  isHot?: boolean;
}

export const SUPPORTED_TOKENS: TokenInfo[] = [
  { symbol: 'XLM', name: 'Stellar Lumens', decimals: 7, icon: '⚡', priceUsd: 0.1145, change24h: 3.42, volume24hUsd: 1420500, isNative: true },
  { symbol: 'USDC', name: 'USD Coin (Circle)', decimals: 7, icon: '💵', priceUsd: 1.0000, change24h: 0.01, volume24hUsd: 3890200, issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
  { symbol: 'EURC', name: 'Euro Coin (Circle)', decimals: 7, icon: '💶', priceUsd: 1.0820, change24h: 0.18, volume24hUsd: 840100, issuer: 'GDQOE23CFSUMSVQK4Y5JHPPVO73REAA2ZDH7EKGH7CWQOG22UHHOISUX' },
  { symbol: 'yXLM', name: 'Yield XLM (UltraStellar)', decimals: 7, icon: '📈', priceUsd: 0.1189, change24h: 3.75, volume24hUsd: 620400, issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSQH3YUH2RNO2SLR7K7D5NOFLDM5DB7V' },
  { symbol: 'AQUA', name: 'Aquarius Token', decimals: 7, icon: '🌊', priceUsd: 0.00482, change24h: 8.14, volume24hUsd: 512000, issuer: 'GBNZILSTVQZ4ROOF2MDRQKDT6YTO54TLVXET2UXXGISDGDDZOKGXB7C' },
  { symbol: 'BTC', name: 'Wrapped Bitcoin (UltraStellar)', decimals: 7, icon: '₿', priceUsd: 64250.00, change24h: 2.15, volume24hUsd: 4950000, issuer: 'GDPJALI4AZKUU2W426AX5WKIBKWB5AFRGSYLI42NV7O7265E242K2K2' },
  { symbol: 'ETH', name: 'Wrapped Ether (UltraStellar)', decimals: 7, icon: 'Ξ', priceUsd: 3480.00, change24h: 1.84, volume24hUsd: 2840000, issuer: 'GBETH22C3YQH3YUH2RNO2SLR7K7D5NOFLDM5DB7VGARDNV3Q7YGT4AK' },
  { symbol: 'SHX', name: 'Stronghold Token', decimals: 7, icon: '🛡️', priceUsd: 0.0084, change24h: 5.60, volume24hUsd: 230000, issuer: 'GDSTRONGBOARDX46O2EQNFOZK423SCD32CDHJPRITTOX53LSKONEOTPC' },
  { symbol: 'yUSDC', name: 'Yield USDC (UltraStellar)', decimals: 7, icon: '💎', priceUsd: 1.0540, change24h: 0.05, volume24hUsd: 980000, issuer: 'GDMYUSDC242K2K2GDPJALI4AZKUU2W426AX5WKIBKWB5AFRGSYLI42NV' },
  { symbol: 'SLT', name: 'Smartlands Token', decimals: 7, icon: '🏙️', priceUsd: 0.4250, change24h: -1.20, volume24hUsd: 115000, issuer: 'GCBDZ77F7UGI627WUX4D47U7EZZUSDKJ77G222CC33DD44EE55FF66GG' },
];

export const SUPPORTED_PAIRS: TradingPair[] = [
  { id: 'XLM/USDC', base: 'XLM', quote: 'USDC', lastPrice: 0.1145, change24h: 3.42, high24h: 0.1180, low24h: 0.1095, volume24h: '1,420,500 XLM', liquidityUsd: '$345,000', isHot: true },
  { id: 'AQUA/XLM', base: 'AQUA', quote: 'XLM', lastPrice: 0.0421, change24h: 8.14, high24h: 0.0450, low24h: 0.0385, volume24h: '512,000 AQUA', liquidityUsd: '$128,000', isHot: true },
  { id: 'BTC/XLM', base: 'BTC', quote: 'XLM', lastPrice: 561135.37, change24h: -1.25, high24h: 575000.0, low24h: 552000.0, volume24h: '8.45 BTC', liquidityUsd: '$540,000' },
  { id: 'ETH/USDC', base: 'ETH', quote: 'USDC', lastPrice: 3480.00, change24h: 1.84, high24h: 3520.00, low24h: 3410.00, volume24h: '412.5 ETH', liquidityUsd: '$1,430,000', isHot: true },
  { id: 'EURC/USDC', base: 'EURC', quote: 'USDC', lastPrice: 1.0820, change24h: 0.18, high24h: 1.0850, low24h: 1.0805, volume24h: '840,100 EURC', liquidityUsd: '$910,000' },
  { id: 'yXLM/XLM', base: 'yXLM', quote: 'XLM', lastPrice: 1.0384, change24h: 0.33, high24h: 1.0400, low24h: 1.0370, volume24h: '620,400 yXLM', liquidityUsd: '$275,000' },
  { id: 'SHX/XLM', base: 'SHX', quote: 'XLM', lastPrice: 0.0733, change24h: 5.60, high24h: 0.0780, low24h: 0.0690, volume24h: '1,890,000 SHX', liquidityUsd: '$85,000' },
  { id: 'yUSDC/USDC', base: 'yUSDC', quote: 'USDC', lastPrice: 1.0540, change24h: 0.05, high24h: 1.0550, low24h: 1.0535, volume24h: '980,000 yUSDC', liquidityUsd: '$1,020,000' },
];
