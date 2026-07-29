import React from 'react';
import { AppError } from '../types';
import { AlertTriangle, X, ShieldAlert, Wallet, ExternalLink, RefreshCw } from 'lucide-react';

interface ErrorModalProps {
  error: AppError | null;
  onClose: () => void;
  onSelectAlbedo?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose, onSelectAlbedo }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-900/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/40">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Error Handled ({error.type})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-3">
          <h3 className="text-base font-bold text-white">{error.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{error.message}</p>

          {/* Actionable Resolution box based on Error Type */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-cyan-400 block uppercase tracking-wider">
              Recommended Resolution:
            </span>
            <p className="text-xs text-slate-300">{error.actionHint}</p>

            {error.type === 'WALLET_NOT_FOUND' && (
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://chromewebstore.google.com/detail/freighter/bcacfldlbbcophiicggaafflaaaaijbg"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Install Freighter Wallet Extension
                </a>
                {onSelectAlbedo && (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectAlbedo();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                    Use Albedo Web Wallet Instead
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
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Fund Testnet Account via Stellar Friendbot
                </a>
              </div>
            )}
          </div>

          {error.rawDetails && (
            <details className="text-[10px] text-slate-400 cursor-pointer">
              <summary className="hover:text-slate-300">Technical Diagnostic Error Details</summary>
              <pre className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto font-mono text-[9px] text-rose-300">
                {error.rawDetails}
              </pre>
            </details>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold text-white text-xs transition-colors"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};
