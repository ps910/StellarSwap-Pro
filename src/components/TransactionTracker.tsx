import React, { useState, useEffect } from 'react';
import { TxStatus, TxStep } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ShieldCheck, Cpu, Clock } from 'lucide-react';

interface TransactionTrackerProps {
  status: TxStatus;
  onClose: () => void;
}

const STEPS: { key: TxStep; label: string; shortLabel: string }[] = [
  { key: 'preparing', label: 'Simulating Contract Execution on Soroban RPC', shortLabel: 'Simulate' },
  { key: 'signing', label: 'Awaiting Wallet Signature (Freighter/Albedo)', shortLabel: 'Sign' },
  { key: 'submitting', label: 'Submitting to Stellar Ledger... (In Flight)', shortLabel: 'Submit' },
  { key: 'confirmed', label: 'Finalizing Ledger State & Updating Balances', shortLabel: 'Finalized' },
];

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ status, onClose }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status.step === 'idle' || status.step === 'confirmed' || status.step === 'failed') {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status.step]);

  if (status.step === 'idle') return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === status.step);
  const isFailed = status.step === 'failed';
  const isConfirmed = status.step === 'confirmed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface border border-b-border rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-b-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gold/10">
              <Cpu className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Transaction Progress</h3>
              {!isConfirmed && !isFailed && (
                <p className="text-[10px] text-text-tertiary flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Elapsed: {elapsed}s
                </p>
              )}
            </div>
          </div>
          {(isConfirmed || isFailed) && (
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg bg-elevated hover:bg-elevated-hover text-text-secondary transition-colors border border-b-border"
            >
              Close
            </button>
          )}
        </div>

        {/* ── Vertical Stepper ── */}
        <div className="mt-5 mb-5 space-y-0">
          {STEPS.map((step, idx) => {
            const isPast = currentStepIndex > idx || isConfirmed;
            const isCurrent = currentStepIndex === idx && !isConfirmed && !isFailed;
            const isFuture = !isPast && !isCurrent;
            const isFailedStep = isFailed && currentStepIndex === idx;

            return (
              <div key={step.key} className="flex items-start gap-3 relative">
                {/* Vertical Line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-[32px] w-0.5 h-8 ${
                      isPast ? 'bg-bullish' : 'bg-b-border'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${
                    isPast
                      ? 'bg-bullish text-black'
                      : isCurrent
                      ? 'bg-gold text-black animate-pulse-gold'
                      : isFailedStep
                      ? 'bg-bearish text-white'
                      : 'bg-elevated text-text-disabled border border-b-border'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFailedStep ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Step Label */}
                <div className="pb-8 pt-1">
                  <p
                    className={`text-xs font-medium ${
                      isPast
                        ? 'text-bullish'
                        : isCurrent
                        ? 'text-gold font-semibold'
                        : isFailedStep
                        ? 'text-bearish'
                        : 'text-text-disabled'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-text-tertiary mt-0.5">{status.message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Result Card ── */}
        <div className="p-4 rounded-xl bg-canvas border border-b-border text-center">
          {isConfirmed ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-bullish/10 text-bullish mx-auto flex items-center justify-center border border-bullish/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-bullish">Transaction Confirmed!</h4>
              <p className="text-xs text-text-secondary">{status.message}</p>

              {status.txHash && (
                <div className="pt-2 border-t border-b-border">
                  <span className="text-[10px] text-text-tertiary block mb-1.5">Transaction Hash:</span>
                  <a
                    href={`${STELLAR_CONFIG.explorerUrl}/tx/${status.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated hover:bg-elevated-hover border border-b-border hover:border-gold/30 text-xs font-mono text-gold transition-all group tabular-nums"
                  >
                    <span>{status.txHash.slice(0, 10)}...{status.txHash.slice(-10)}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          ) : isFailed ? (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-bearish/10 text-bearish mx-auto flex items-center justify-center border border-bearish/30">
                <XCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-bearish">Transaction Failed</h4>
              <p className="text-xs text-text-secondary">{status.error || status.message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto" />
              <p className="text-sm font-semibold text-text-primary">{status.message}</p>
              <p className="text-[10px] text-text-tertiary">Communicating with Stellar consensus network...</p>
            </div>
          )}
        </div>

        {/* ── Footer Action ── */}
        {(isConfirmed || isFailed) && (
          <button
            onClick={onClose}
            className="mt-4 w-full py-3 rounded-xl bg-elevated hover:bg-elevated-hover border border-b-border font-semibold text-text-primary text-sm transition-all"
          >
            Back to Exchange
          </button>
        )}
      </div>
    </div>
  );
};
