import React, { useState, useEffect } from 'react';
import { WalletState, AppTab } from '../types';
import { Wallet, ShieldCheck, ExternalLink, MessageSquare, TrendingUp, BarChart3, Users } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

interface NavbarProps {
  walletState: WalletState;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletState,
  activeTab,
  onSelectTab,
  onOpenWalletModal,
  onDisconnect,
  onOpenFeedback,
}) => {
  const [ledgerSeq, setLedgerSeq] = useState(54210);

  useEffect(() => {
    const timer = setInterval(() => {
      setLedgerSeq((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050505]/95 backdrop-blur-md border-b border-neutral-900 font-mono text-xs">
      {/* Top Asset Price Ticker Tape */}
      <div className="bg-[#09090b] border-b border-neutral-900/80 py-1 px-4 overflow-x-auto text-[10px] text-slate-400 flex items-center justify-between gap-6 whitespace-nowrap">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1">
            <span className="text-white font-bold">XLM</span>
            <span className="text-slate-300">$0.1245</span>
            <span className="text-lime-400 font-semibold">+2.4%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-white font-bold">USDC</span>
            <span className="text-slate-300">$1.0000</span>
            <span className="text-slate-400">+0.0%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-white font-bold">EURC</span>
            <span className="text-slate-300">$1.0820</span>
            <span className="text-lime-400 font-semibold">+0.1%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-white font-bold">AQUA</span>
            <span className="text-slate-300">$0.0034</span>
            <span className="text-lime-400 font-semibold">+5.2%</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          {/* User Count Badge — Level 5 */}
          <span className="flex items-center gap-1.5 text-blue-400">
            <Users className="w-3 h-3" />
            <span className="font-bold">52 users</span>
          </span>
          <span className="flex items-center gap-1.5 text-lime-400">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping"></span>
            <span>TESTNET RPC ONLINE</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Badges */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => onSelectTab('swap')}
              className="flex items-center gap-1 cursor-pointer select-none"
            >
              <span className="font-sans font-black text-xl tracking-tight text-white">
                StellarSwap
              </span>
              <span className="font-sans font-black text-xl text-lime-400">
                +
              </span>
            </div>

            {/* Network & Ledger Badges */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
                <span>TESTNET</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] text-slate-300">
                LEDGER <span className="text-lime-400 font-bold">#{ledgerSeq.toLocaleString()}</span>
              </span>

              {/* Level 5 Badge */}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                L5 BLUE BELT
              </span>
            </div>
          </div>

          {/* Center: Connected Dashboard Navigation Tabs */}
          {walletState.isConnected && (
            <div className="hidden md:flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px]">
              <button
                onClick={() => onSelectTab('swap')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'swap'
                    ? 'bg-lime-400 text-black font-extrabold shadow-md shadow-lime-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PATH PAYMENT DEX
              </button>
              <button
                onClick={() => onSelectTab('escrow')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'escrow'
                    ? 'bg-lime-400 text-black font-extrabold shadow-md shadow-lime-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SOROBAN ESCROW VAULT
              </button>
              <button
                onClick={() => onSelectTab('analytics')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-lime-400 text-black font-extrabold shadow-md shadow-lime-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                ANALYTICS
              </button>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-lime-400 hover:border-lime-400/40 transition-all text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">FEEDBACK</span>
            </button>

            {walletState.isConnected ? (
              <div className="flex items-center gap-2 bg-neutral-900 border border-lime-400/30 p-1 pl-3 rounded-xl">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white font-mono">
                    {walletState.address?.slice(0, 5)}...{walletState.address?.slice(-4)}
                  </span>
                  <span className="text-[9px] text-lime-400 capitalize flex items-center gap-1 justify-end font-mono">
                    <ShieldCheck className="w-3 h-3 text-lime-400" />
                    {walletState.walletName}
                  </span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all border border-transparent hover:border-rose-900/50"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenWalletModal}
                className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs shadow-lg shadow-lime-400/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 label-mono"
              >
                <Wallet className="w-4 h-4" />
                <span>CONNECT</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Selector (when connected) */}
        {walletState.isConnected && (
          <div className="md:hidden flex items-center justify-between bg-neutral-900 p-1 rounded-xl border border-neutral-800 mb-3 text-[11px]">
            <button
              onClick={() => onSelectTab('swap')}
              className={`w-1/3 py-2 rounded-lg font-bold text-center transition-all ${
                activeTab === 'swap'
                  ? 'bg-lime-400 text-black font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SWAP
            </button>
            <button
              onClick={() => onSelectTab('escrow')}
              className={`w-1/3 py-2 rounded-lg font-bold text-center transition-all ${
                activeTab === 'escrow'
                  ? 'bg-lime-400 text-black font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ESCROW
            </button>
            <button
              onClick={() => onSelectTab('analytics')}
              className={`w-1/3 py-2 rounded-lg font-bold text-center transition-all ${
                activeTab === 'analytics'
                  ? 'bg-lime-400 text-black font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ANALYTICS
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
