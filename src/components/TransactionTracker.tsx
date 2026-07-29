import React from 'react';
import { TxStatus, TxStep } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface TransactionTrackerProps {
  status: TxStatus;
  onClose: () => void;
}

const STEPS: { key: TxStep; label: string }[] = [
  { key: 'preparing', label: '1. Prepare XDR Invocation' },
  { key: 'signing', label: '2. Wallet Signature' },
  { key: 'submitting', label: '3. Testnet Consensus' },
  { key: 'confirmed', label: '4. Ledger Finalized' },
];

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ status, onClose }) => {
  if (status.step === 'idle') return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === status.step);
  const isFailed = status.step === 'failed';
  const isConfirmed = status.step === 'confirmed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/50">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Soroban Transaction Tracker</h3>
          </div>
          {(isConfirmed || isFailed) && (
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Pipeline Stepper */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between relative">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -z-0" />
            
            {STEPS.map((step, idx) => {
              const isPast = currentStepIndex > idx || isConfirmed;
              const isCurrent = currentStepIndex === idx && !isConfirmed && !isFailed;
              
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40 ring-4 ring-cyan-500/20 animate-pulse'
                        : isFailed && currentStepIndex === idx
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium mt-2 max-w-[70px] text-center line-clamp-1 ${
                      isCurrent || isPast ? 'text-cyan-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {step.label.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message Container */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          {isConfirmed ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-800/60">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-400">Transaction Confirmed!</h4>
              <p className="text-xs text-slate-300">{status.message}</p>

              {status.txHash && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">Testnet Transaction Hash:</span>
                  <a
                    href={`${STELLAR_CONFIG.explorerUrl}/tx/${status.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-800 text-xs font-mono text-cyan-400 transition-all group"
                  >
                    <span>{status.txHash.slice(0, 10)}...{status.txHash.slice(-10)}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ) : isFailed ? (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-950 text-rose-400 mx-auto flex items-center justify-center border border-rose-800/60">
                <XCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-rose-400">Transaction Execution Failed</h4>
              <p className="text-xs text-slate-300">{status.error || status.message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
              <p className="text-sm font-semibold text-white">{status.message}</p>
              <p className="text-xs text-slate-400">Communicating with Stellar Testnet consensus network...</p>
            </div>
          )}
        </div>

        {/* Action Button when confirmed/failed */}
        {(isConfirmed || isFailed) && (
          <button
            onClick={onClose}
            className="mt-5 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-semibold text-white text-sm transition-colors"
          >
            Back to Exchange
          </button>
        )}
      </div>
    </div>
  );
};
