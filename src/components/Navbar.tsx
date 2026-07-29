import React from 'react';
import { WalletState } from '../types';
import { Wallet, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

interface NavbarProps {
  walletState: WalletState;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletState,
  onOpenWalletModal,
  onDisconnect,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Stellar<span className="text-cyan-400">Swap</span>
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Soroban L2
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Wallet DEX & Real-Time Event Sync Engine
            </p>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Testnet Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4"></span>
            <span>Stellar Testnet</span>
            <a
              href={`${STELLAR_CONFIG.explorerUrl}/contract/${STELLAR_CONFIG.contractId}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors ml-1"
              title="View Deployed Soroban Contract on Stellar Expert Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Connect / Connected Button */}
          {walletState.isConnected ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 p-1.5 pl-3.5 rounded-2xl">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-white font-mono">
                  {walletState.address?.slice(0, 5)}...{walletState.address?.slice(-4)}
                </span>
                <span className="text-[10px] text-cyan-400 capitalize flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  {walletState.walletName}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-900/50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
