import React from 'react';
import { WalletState } from '../types';
import { Wallet, TrendingUp } from 'lucide-react';

interface PortfolioBannerProps {
  walletState: WalletState;
}

export const PortfolioBanner: React.FC<PortfolioBannerProps> = ({ walletState }) => {
  const xlmVal = parseFloat(walletState.balanceXlm.replace(/,/g, '')) * 0.1245;
  const usdcVal = parseFloat(walletState.balanceUsdc.replace(/,/g, ''));
  const eurcVal = 180.50;
  const yXlmVal = 320.00;
  const totalUsd = (xlmVal + usdcVal + eurcVal + yXlmVal).toFixed(2);

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <span>01 // PORTFOLIO BALANCE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Wallet className="w-3.5 h-3.5 text-lime-400" />
          <span className="text-white font-mono">{walletState.address}</span>
        </div>
      </div>

      {/* Main Grid: Total Valuation (Left) + Asset Cards Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Total Valuation */}
        <div className="lg:col-span-4 space-y-2 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-6 lg:pb-0 lg:pr-8">
          <span className="text-slate-400 block text-[10px]">TOTAL ESTIMATED VALUE</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
            ${parseFloat(totalUsd).toLocaleString()}{' '}
            <span className="text-xs text-lime-400 font-sans font-bold">USD</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-lime-400" />
            <span>Horizon & Soroban RPC Valuation</span>
          </p>
        </div>

        {/* Asset Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          {/* XLM */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">XLM</span>
              <span className="text-[10px] text-slate-500">NATIVE</span>
            </div>
            <div className="text-sm font-extrabold text-lime-400">{walletState.balanceXlm}</div>
            <div className="text-[10px] text-slate-400">≈ ${xlmVal.toFixed(2)} USD</div>
          </div>

          {/* USDC */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">USDC</span>
              <span className="text-[10px] text-slate-500">STABLE</span>
            </div>
            <div className="text-sm font-extrabold text-white">{walletState.balanceUsdc}</div>
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
          <span>4 TOKENS CONNECTED</span>
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
