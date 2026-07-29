import React from 'react';
import { WalletOption, WalletType } from '../types';
import { X, CheckCircle2, ArrowUpRight, Shield } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletOption[];
  installedState: Record<WalletType, boolean>;
  onSelectWallet: (walletId: WalletType) => void;
  isLoading: boolean;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  installedState,
  onSelectWallet,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Decorative Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Connect Stellar Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Select your preferred Stellar/Soroban wallet to interact with liquidity pools and smart contract functions.
        </p>

        {/* Wallet Options List */}
        <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {wallets.map((wallet) => {
            const isInstalled = installedState[wallet.id] ?? wallet.isInstalled;
            return (
              <button
                key={wallet.id}
                onClick={() => onSelectWallet(wallet.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {wallet.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm group-hover:text-cyan-400 transition-colors">
                        {wallet.name}
                      </span>
                      {isInstalled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 text-[10px] font-medium border border-emerald-800/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium">
                          Web / Store
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {wallet.description}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            Powered by <span className="text-slate-300 font-semibold">StellarWalletsKit</span> & Stellar SDK
          </p>
        </div>
      </div>
    </div>
  );
};
