import React from 'react';
import { WalletOption, WalletType } from '../types';
import { X, CheckCircle2, ArrowUpRight, Shield, Info } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-md bg-surface border border-b-border rounded-2xl p-6 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-b-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gold/10">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Connect Stellar Wallet</h3>
              <p className="text-[10px] text-text-tertiary">Select network endpoint ({STELLAR_CONFIG.name})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-canvas border border-b-border flex items-start gap-2.5">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Non-custodial connection. We never access your private keys. Stellar requires a minimum ~1.5 XLM balance for reserves & trustlines.
          </p>
        </div>

        {/* Wallet Options List */}
        <div className="mt-3.5 space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
          {wallets.map((wallet) => {
            const isInstalled = installedState[wallet.id] ?? wallet.isInstalled;
            return (
              <button
                key={wallet.id}
                onClick={() => onSelectWallet(wallet.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-elevated border border-b-border hover:border-gold/40 hover:bg-elevated-hover transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-canvas border border-b-border flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                    {wallet.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary text-sm group-hover:text-gold transition-colors">
                        {wallet.name}
                      </span>
                      {isInstalled ? (
                        <span className="badge-bullish text-[9px] py-0">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                        </span>
                      ) : (
                        <span className="badge-gold text-[9px] py-0">
                          Web / Install
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-0.5 line-clamp-1">
                      {wallet.description}
                    </p>
                  </div>
                </div>

                <div className="text-text-tertiary group-hover:text-gold group-hover:translate-x-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-b-border text-center flex items-center justify-between text-[10px] text-text-tertiary">
          <span>StellarWalletsKit Protocol v2</span>
          <span className="text-bullish font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
            RPC Connected
          </span>
        </div>
      </div>
    </div>
  );
};
