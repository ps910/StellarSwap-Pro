import React from 'react';
import { AppError } from '../types';
import { AlertTriangle, X, ShieldAlert, Wallet, ExternalLink, RefreshCw, Link2 } from 'lucide-react';

interface ErrorModalProps {
  error: AppError | null;
  onClose: () => void;
  onSelectAlbedo?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose, onSelectAlbedo }) => {
  if (!error) return null;

  const errorColors: Record<string, { border: string; bg: string; icon: string }> = {
    WALLET_NOT_FOUND: { border: 'border-bearish/30', bg: 'bg-bearish/8', icon: 'text-bearish' },
    USER_REJECTED: { border: 'border-gold/30', bg: 'bg-gold/8', icon: 'text-gold' },
    INSUFFICIENT_BALANCE: { border: 'border-bearish/30', bg: 'bg-bearish/8', icon: 'text-bearish' },
    NO_TRUSTLINE: { border: 'border-gold/30', bg: 'bg-gold/8', icon: 'text-gold' },
    INSUFFICIENT_RESERVE: { border: 'border-bearish/30', bg: 'bg-bearish/8', icon: 'text-bearish' },
    TIMEOUT_NOT_EXPIRED: { border: 'border-gold/30', bg: 'bg-gold/8', icon: 'text-gold' },
    UNKNOWN: { border: 'border-bearish/30', bg: 'bg-bearish/8', icon: 'text-bearish' },
  };

  const colors = errorColors[error.type] || errorColors.UNKNOWN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-lg animate-fadeIn">
      <div className={`relative w-full max-w-md bg-surface border ${colors.border} rounded-2xl p-6 shadow-2xl animate-slide-up`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-b-border">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colors.bg}`}>
              <ShieldAlert className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.icon}`}>
              {error.type.replace(/_/g, ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-3">
          <h3 className="text-base font-bold text-text-primary">{error.title}</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{error.message}</p>

          {/* Resolution Box */}
          <div className="p-3.5 rounded-xl bg-canvas border border-b-border space-y-2">
            <span className="text-[10px] font-bold text-gold block uppercase tracking-wider">
              Recommended Fix
            </span>
            <p className="text-xs text-text-secondary">{error.actionHint}</p>

            {error.type === 'WALLET_NOT_FOUND' && (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://chromewebstore.google.com/detail/freighter/bcacfldlbbcophiicggaafflaaaaijbg"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-protocol-blue/10 hover:bg-protocol-blue/20 border border-protocol-blue/30 text-protocol-blue text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Install Freighter Wallet
                </a>
                {onSelectAlbedo && (
                  <button
                    onClick={() => { onClose(); onSelectAlbedo(); }}
                    className="w-full py-2 px-3 rounded-xl bg-elevated hover:bg-elevated-hover border border-b-border text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5 text-gold" />
                    Use Albedo Web Wallet
                  </button>
                )}
              </div>
            )}

            {error.type === 'INSUFFICIENT_BALANCE' && (
              <div className="pt-2">
                <a
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-bullish/10 hover:bg-bullish/20 border border-bullish/30 text-bullish text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Fund via Stellar Friendbot
                </a>
              </div>
            )}

            {error.type === 'NO_TRUSTLINE' && (
              <div className="pt-2">
                <button className="w-full py-2 px-3 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Link2 className="w-3.5 h-3.5" />
                  Add Asset Trustline
                </button>
              </div>
            )}

            {error.type === 'INSUFFICIENT_RESERVE' && (
              <div className="pt-2 p-2 rounded-lg bg-elevated text-[10px] text-text-tertiary tabular-nums">
                <div className="flex justify-between">
                  <span>Base Reserve:</span><span className="text-text-secondary">0.5 XLM</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Trustline:</span><span className="text-text-secondary">0.5 XLM</span>
                </div>
                <div className="flex justify-between border-t border-b-border mt-1 pt-1">
                  <span className="font-semibold">Min Required:</span>
                  <span className="text-gold font-bold">1.5 XLM</span>
                </div>
              </div>
            )}
          </div>

          {error.rawDetails && (
            <details className="text-[10px] text-text-tertiary cursor-pointer">
              <summary className="hover:text-text-secondary">Technical Details</summary>
              <pre className="mt-1 p-2 rounded-lg bg-canvas border border-b-border overflow-x-auto font-mono text-[9px] text-bearish">
                {error.rawDetails}
              </pre>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-elevated hover:bg-elevated-hover border border-b-border font-semibold text-text-primary text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
