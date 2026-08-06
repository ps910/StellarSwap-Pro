import React, { useState } from 'react';
import { WalletState } from '../types';
import { AccountBalancesData, fundWithFriendbot } from '../services/accountBalances';
import { Wallet, TrendingUp, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface PortfolioBannerProps {
  walletState: WalletState;
  balancesData?: AccountBalancesData | null;
  onRefreshBalances?: () => void;
}

export const PortfolioBanner: React.FC<PortfolioBannerProps> = ({
  walletState,
  balancesData,
  onRefreshBalances,
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
    <div className="p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <span>01 // PORTFOLIO BALANCE</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          {onRefreshBalances && (
            <button
              onClick={onRefreshBalances}
              className="p-1 rounded-lg text-slate-400 hover:text-lime-400 hover:bg-neutral-800 transition-colors flex items-center gap-1"
              title="Refresh Live Balances from Horizon"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-[10px]">Sync</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg">
            <Wallet className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-white font-mono">
              {walletState.address ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-6)}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Unfunded Warning Banner */}
      {isUnfunded && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-300 text-xs">Unfunded Testnet Account Detected</div>
              <p className="text-[11px] text-amber-400/80 mt-0.5">
                This keypair has no ledger entry on Testnet yet. Fund it with 10,000 XLM using Friendbot to start swapping.
              </p>
            </div>
          </div>
          <button
            onClick={handleFund}
            disabled={isFunding}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isFunding ? 'Funding...' : 'Fund with Friendbot (10k XLM)'}</span>
          </button>
        </div>
      )}

      {friendbotMsg && !isUnfunded && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{friendbotMsg}</span>
        </div>
      )}

      {/* Main Grid: Total Valuation (Left) + Asset Cards Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Total Valuation */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-6 lg:pb-0 lg:pr-8">
          <span className="text-slate-400 block text-[10px]">TOTAL ESTIMATED VALUE</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            ${parseFloat(totalUsd).toLocaleString()}{' '}
            <span className="text-xs text-lime-400 font-sans font-bold">USD</span>
          </div>
          <div className="space-y-1 pt-1">
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
              <span>Stellar Horizon & Soroban RPC Live Feed</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Reserved XLM: <span className="text-amber-400 font-bold">{xlmReserve.toFixed(1)} XLM</span> ({subentryCount} subentries)
            </p>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          {/* XLM */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">XLM</span>
              <span className="text-[10px] text-slate-500">NATIVE</span>
            </div>
            <div className="text-sm font-extrabold text-lime-400">{xlmRaw.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">Spendable: {xlmSpendable}</div>
            <div className="text-[10px] text-slate-400">≈ ${xlmVal.toFixed(2)} USD</div>
          </div>

          {/* USDC */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">USDC</span>
              <span className="text-[10px] text-slate-500">STABLE</span>
            </div>
            <div className="text-sm font-extrabold text-white">{usdcRaw.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">≈ ${usdcVal.toFixed(2)} USD</div>
          </div>

          {/* EURC */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">EURC</span>
              <span className="text-[10px] text-slate-500">STABLE</span>
            </div>
            <div className="text-sm font-extrabold text-slate-200">165.00</div>
            <div className="text-[10px] text-slate-400">≈ ${eurcVal.toFixed(2)} USD</div>
          </div>

          {/* YXLM */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">YXLM</span>
              <span className="text-[10px] text-slate-500">YIELD</span>
            </div>
            <div className="text-sm font-extrabold text-slate-200">2,500.00</div>
            <div className="text-[10px] text-slate-400">≈ ${yXlmVal.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {/* Asset Distribution Bar */}
      <div className="mt-6 pt-4 border-t border-neutral-800/80 font-mono text-[10px]">
        <div className="flex justify-between text-slate-400 mb-2">
          <span>ASSET ALLOCATION</span>
          <span>{assetCount} ASSETS CONNECTED</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#050505] flex overflow-hidden p-0.5 border border-neutral-800">
          <div className="h-full bg-lime-400 rounded-l-full" style={{ width: '45%' }} />
          <div className="h-full bg-white" style={{ width: '30%' }} />
          <div className="h-full bg-slate-400" style={{ width: '15%' }} />
          <div className="h-full bg-slate-600 rounded-r-full" style={{ width: '10%' }} />
        </div>
      </div>
    </div>
  );
};
