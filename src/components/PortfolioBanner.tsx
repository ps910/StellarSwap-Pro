import React, { useState } from 'react';
import { WalletState, NetworkMode } from '../types';
import { AccountBalancesData, fundWithFriendbot } from '../services/accountBalances';
import { Wallet, TrendingUp, AlertCircle, RefreshCw, Zap, ShieldCheck, Globe } from 'lucide-react';

interface PortfolioBannerProps {
  walletState: WalletState;
  balancesData?: AccountBalancesData | null;
  onRefreshBalances?: () => void;
  networkMode?: NetworkMode;
  onToggleNetwork?: (mode: NetworkMode) => void;
}

export const PortfolioBanner: React.FC<PortfolioBannerProps> = ({
  walletState,
  balancesData,
  onRefreshBalances,
  networkMode = 'testnet',
  onToggleNetwork,
}) => {
  const [isFunding, setIsFunding] = useState(false);
  const [friendbotMsg, setFriendbotMsg] = useState<string | null>(null);

  const xlmRaw = parseFloat((balancesData?.xlmBalance || walletState.balanceXlm || '0').replace(/,/g, ''));
  const usdcRaw = parseFloat((balancesData?.usdcBalance || walletState.balanceUsdc || '0').replace(/,/g, ''));
  const xlmSpendable = balancesData?.xlmSpendable || walletState.balanceXlm;

  const xlmVal = xlmRaw * 0.1245;
  const usdcVal = usdcRaw * 1.0000;
  const eurcVal = 180.50;
  const yXlmVal = 320.00;

  const totalUsd = balancesData?.funded
    ? (xlmVal + usdcVal + eurcVal + yXlmVal).toFixed(2)
    : (xlmVal + usdcVal).toFixed(2);

  const isUnfunded = balancesData && !balancesData.funded;
  const assetCount = balancesData?.assetCount ?? 4;
  const xlmReserve = balancesData?.xlmReserve ?? 1.0;
  const subentryCount = balancesData?.subentryCount ?? 0;

  const handleFund = async () => {
    if (!walletState.address) return;
    setIsFunding(true);
    setFriendbotMsg('Funding Testnet wallet via Stellar Friendbot...');

    const res = await fundWithFriendbot(walletState.address);
    setIsFunding(false);
    setFriendbotMsg(res.message);

    if (res.success && onRefreshBalances) {
      setTimeout(() => {
        onRefreshBalances();
        setFriendbotMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="card-surface p-6 sm:p-7 mb-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-b-border pb-3.5 mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-gold font-bold text-xs tracking-wider">01 // PORTFOLIO TELEMETRY</span>
          <span className="badge-gold">LIVE</span>

          {/* Interactive Network Switcher Badge */}
          {onToggleNetwork && (
            <button
              onClick={() => onToggleNetwork(networkMode === 'mainnet' ? 'testnet' : 'mainnet')}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:scale-105 shadow-sm ${
                networkMode === 'mainnet'
                  ? 'bg-bullish/15 text-bullish border-bullish/40 hover:bg-bullish/25'
                  : 'bg-gold/15 text-gold border-gold/40 hover:bg-gold/25'
              }`}
              title="Click to toggle between Stellar Mainnet and Testnet"
            >
              <Globe className="w-3 h-3" />
              <span>{networkMode === 'mainnet' ? 'Stellar Mainnet (Public)' : 'Stellar Testnet (SDF)'}</span>
              <span className="text-[9px] opacity-70">⇄ Switch</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-text-tertiary text-xs">
          {onRefreshBalances && (
            <button
              onClick={onRefreshBalances}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-gold hover:bg-elevated transition-all flex items-center gap-1"
              title="Refresh Live Balances from Horizon"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline font-medium">Sync Horizon</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-elevated border border-b-border px-3 py-1 rounded-lg text-xs">
            <Wallet className="w-3.5 h-3.5 text-gold" />
            <span className="text-text-primary tabular-nums font-mono">
              {walletState.address ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-6)}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Unfunded Warning Banner */}
      {isUnfunded && (
        <div className="mb-5 p-4 rounded-xl bg-gold/10 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-gold">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold shrink-0" />
            <div>
              <div className="font-bold text-text-primary text-xs">Unfunded Testnet Account Detected</div>
              <p className="text-[11px] text-text-secondary mt-0.5">
                This keypair has no ledger entry on Testnet yet. Fund it with 10,000 XLM using Friendbot to start swapping.
              </p>
            </div>
          </div>
          <button
            onClick={handleFund}
            disabled={isFunding}
            className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isFunding ? 'Funding...' : 'Fund Friendbot (10k XLM)'}</span>
          </button>
        </div>
      )}

      {friendbotMsg && !isUnfunded && (
        <div className="mb-5 p-3 rounded-xl bg-bullish/10 border border-bullish/30 text-bullish text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-bullish" />
          <span>{friendbotMsg}</span>
        </div>
      )}

      {/* Main Grid: Total Valuation (Left) + Asset Cards Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Total Valuation */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-b-border pb-5 lg:pb-0 lg:pr-6">
          <span className="text-text-tertiary block text-[10px] uppercase font-bold tracking-wider">TOTAL ESTIMATED VALUE</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-text-primary tabular-nums">
            ${parseFloat(totalUsd).toLocaleString()}{' '}
            <span className="text-xs text-gold font-bold">USD</span>
          </div>
          <div className="space-y-1 pt-1 text-text-tertiary">
            <p className="text-[11px] flex items-center gap-1.5 text-bullish">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stellar Horizon & Soroban RPC Live</span>
            </p>
            <p className="text-[10px]">
              Reserved: <span className="text-gold font-bold tabular-nums">{xlmReserve.toFixed(1)} XLM</span> ({subentryCount} subentries)
            </p>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* XLM */}
          <div className="p-3.5 rounded-xl bg-elevated border border-b-border/80 space-y-1 hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary text-xs">XLM</span>
              <span className="badge-blue text-[9px] py-0 px-1">NATIVE</span>
            </div>
            <div className="text-sm font-extrabold text-gold tabular-nums">{xlmRaw.toFixed(2)}</div>
            <div className="text-[10px] text-text-tertiary tabular-nums">Spendable: {xlmSpendable}</div>
            <div className="text-[10px] text-text-secondary tabular-nums">≈ ${xlmVal.toFixed(2)}</div>
          </div>

          {/* USDC */}
          <div className="p-3.5 rounded-xl bg-elevated border border-b-border/80 space-y-1 hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary text-xs">USDC</span>
              <span className="badge-bullish text-[9px] py-0 px-1">STABLE</span>
            </div>
            <div className="text-sm font-extrabold text-text-primary tabular-nums">{usdcRaw.toFixed(2)}</div>
            <div className="text-[10px] text-text-tertiary">1.00 USD peg</div>
            <div className="text-[10px] text-text-secondary tabular-nums">≈ ${usdcVal.toFixed(2)}</div>
          </div>

          {/* EURC */}
          <div className="p-3.5 rounded-xl bg-elevated border border-b-border/80 space-y-1 hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary text-xs">EURC</span>
              <span className="badge-bullish text-[9px] py-0 px-1">EURO</span>
            </div>
            <div className="text-sm font-extrabold text-text-primary tabular-nums">165.00</div>
            <div className="text-[10px] text-text-tertiary">1.082 USD rate</div>
            <div className="text-[10px] text-text-secondary tabular-nums">≈ ${eurcVal.toFixed(2)}</div>
          </div>

          {/* YXLM */}
          <div className="p-3.5 rounded-xl bg-elevated border border-b-border/80 space-y-1 hover:border-gold/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary text-xs">yXLM</span>
              <span className="badge-gold text-[9px] py-0 px-1">YIELD</span>
            </div>
            <div className="text-sm font-extrabold text-text-primary tabular-nums">2,500.00</div>
            <div className="text-[10px] text-text-tertiary">5.0% APY Ultra</div>
            <div className="text-[10px] text-text-secondary tabular-nums">≈ ${yXlmVal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Asset Distribution Bar */}
      <div className="mt-5 pt-3.5 border-t border-b-border text-[10px]">
        <div className="flex justify-between text-text-tertiary mb-1.5">
          <span className="uppercase font-bold tracking-wider">Asset Distribution</span>
          <span className="tabular-nums font-semibold text-text-secondary">{assetCount} ASSETS CONNECTED</span>
        </div>
        <div className="h-2 w-full rounded-full bg-elevated flex overflow-hidden p-0.5 border border-b-border">
          <div className="h-full bg-gold rounded-l-full" style={{ width: '45%' }} />
          <div className="h-full bg-bullish" style={{ width: '30%' }} />
          <div className="h-full bg-protocol-blue" style={{ width: '15%' }} />
          <div className="h-full bg-text-disabled rounded-r-full" style={{ width: '10%' }} />
        </div>
      </div>
    </div>
  );
};
