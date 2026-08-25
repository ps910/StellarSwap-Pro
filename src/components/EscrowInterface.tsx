import React, { useState } from 'react';
import { WalletState, EscrowItem } from '../types';
import { Lock, ArrowRight, Clock, RefreshCw, CheckCircle2, AlertCircle, PlusCircle, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { SUPPORTED_TOKENS, STELLAR_CONFIG } from '../config/stellar';

interface EscrowInterfaceProps {
  walletState: WalletState;
  escrows: EscrowItem[];
  onOpenWalletModal: () => void;
  onCreateEscrow: (payee: string, token: string, amount: string, lockupHours: number) => Promise<void>;
  onFundEscrow: (escrowId: number) => Promise<void>;
  onReleaseEscrow: (escrowId: number) => Promise<void>;
  onRefundEscrow: (escrowId: number) => Promise<void>;
  isProcessing: boolean;
}

export const EscrowInterface: React.FC<EscrowInterfaceProps> = ({
  walletState,
  escrows,
  onOpenWalletModal,
  onCreateEscrow,
  onFundEscrow,
  onReleaseEscrow,
  onRefundEscrow,
  isProcessing,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [copiedContract, setCopiedContract] = useState(false);

  // Form State
  const [payeeAddress, setPayeeAddress] = useState('');
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('100');
  const [lockupHours, setLockupHours] = useState('24');

  const handleCopyContract = () => {
    navigator.clipboard.writeText(STELLAR_CONFIG.escrowContractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 1500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeAddress) return;
    await onCreateEscrow(payeeAddress, token, amount, parseInt(lockupHours, 10));
    setPayeeAddress('');
    setActiveSubTab('list');
  };

  const getStatusBadge = (state: EscrowItem['state']) => {
    switch (state) {
      case 'Created':
        return (
          <span className="badge-gold">
            <Clock className="w-3 h-3" /> CREATED
          </span>
        );
      case 'Funded':
        return (
          <span className="badge-bullish">
            <Lock className="w-3 h-3" /> FUNDED
          </span>
        );
      case 'Released':
        return (
          <span className="badge-bullish">
            <CheckCircle2 className="w-3 h-3" /> RELEASED
          </span>
        );
      case 'Refunded':
        return (
          <span className="badge-bearish">
            <RefreshCw className="w-3 h-3" /> REFUNDED
          </span>
        );
    }
  };

  return (
    <div className="card-surface p-6 animate-fade-in mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-b-border pb-3.5 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-text-primary">Soroban Escrow Vault</h2>
          <span className="badge-gold">TIMELOCKED</span>
        </div>

        {/* Contract ID Copy Pill */}
        <button
          onClick={handleCopyContract}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas border border-b-border text-text-tertiary hover:text-text-primary hover:border-gold/30 transition-all text-[11px]"
        >
          <span className="font-mono tabular-nums">#{STELLAR_CONFIG.escrowContractId.slice(0, 8)}...</span>
          {copiedContract ? <Check className="w-3 h-3 text-bullish" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          Agreements ({escrows.length})
        </span>

        <div className="flex bg-canvas p-1 rounded-xl border border-b-border text-xs">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 ${
              activeSubTab === 'list'
                ? 'bg-gold text-black shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            ACTIVE LIST
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all duration-200 ${
              activeSubTab === 'create'
                ? 'bg-gold text-black shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>NEW ESCROW</span>
          </button>
        </div>
      </div>

      {/* View: Create Escrow Form */}
      {activeSubTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs animate-fade-in">
          <div>
            <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              Recipient Stellar Address (Payee)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GCDTK94L...M28A"
              value={payeeAddress}
              onChange={(e) => setPayeeAddress(e.target.value)}
              className="input-elevated text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                Asset Token
              </label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-b-border text-text-primary focus:outline-none focus:border-gold text-xs font-mono cursor-pointer"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol} className="bg-surface text-text-primary">
                    {t.symbol} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                Lockup Amount
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-elevated text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              Lockup Duration (Before Refund Timeout)
            </label>
            <select
              value={lockupHours}
              onChange={(e) => setLockupHours(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-elevated border border-b-border text-text-primary focus:outline-none focus:border-gold text-xs font-mono cursor-pointer"
            >
              <option value="1" className="bg-surface text-text-primary">1 Hour (Quick Test)</option>
              <option value="24" className="bg-surface text-text-primary">24 Hours (1 Day)</option>
              <option value="72" className="bg-surface text-text-primary">72 Hours (3 Days)</option>
              <option value="168" className="bg-surface text-text-primary">168 Hours (1 Week)</option>
            </select>
          </div>

          {!walletState.isConnected ? (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="w-full py-3.5 rounded-xl bg-elevated hover:bg-elevated-hover border border-b-border text-text-primary font-bold text-xs transition-all"
            >
              CONNECT WALLET TO INITIALIZE ESCROW
            </button>
          ) : (
            <button
              type="submit"
              disabled={isProcessing || !payeeAddress}
              className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs shadow-lg shadow-gold/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-black" />
              <span>INITIALIZE SOROBAN ESCROW</span>
            </button>
          )}
        </form>
      )}

      {/* View: Escrows List */}
      {activeSubTab === 'list' && (
        <div className="space-y-3 text-xs">
          {escrows.length === 0 ? (
            <div className="p-8 text-center bg-canvas rounded-xl border border-b-border">
              <AlertCircle className="w-8 h-8 text-text-disabled mx-auto mb-2" />
              <p className="text-xs text-text-tertiary">No active agreement vaults found.</p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-3 px-4 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/30 font-bold hover:bg-gold/20 text-xs transition-all"
              >
                + Create First Escrow
              </button>
            </div>
          ) : (
            escrows.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-elevated border border-b-border hover:border-b-border-light transition-all space-y-2.5"
              >
                {/* Header & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">ESCROW #{item.id}</span>
                    {getStatusBadge(item.state)}
                  </div>
                  <span className="text-gold font-extrabold text-sm tabular-nums">{item.amount} {item.token}</span>
                </div>

                {/* Timeline Visualizer */}
                <div className="p-2.5 rounded-lg bg-canvas border border-b-border/60 text-[10px] space-y-1.5">
                  <div className="flex justify-between text-text-tertiary">
                    <span className={item.state === 'Created' || item.state === 'Funded' || item.state === 'Released' ? 'text-gold font-bold' : ''}>1. CREATED</span>
                    <span className={item.state === 'Funded' || item.state === 'Released' ? 'text-bullish font-bold' : ''}>2. FUNDED</span>
                    <span className={item.state === 'Released' ? 'text-bullish font-bold' : item.state === 'Refunded' ? 'text-bearish font-bold' : ''}>
                      3. {item.state === 'Refunded' ? 'REFUNDED' : 'RELEASED'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-elevated rounded-full flex overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.state === 'Released'
                          ? 'bg-bullish w-full'
                          : item.state === 'Refunded'
                          ? 'bg-bearish w-full'
                          : item.state === 'Funded'
                          ? 'bg-bullish w-2/3'
                          : 'bg-gold w-1/3'
                      }`}
                    />
                  </div>
                </div>

                {/* Account Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-text-tertiary">
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <span>From: {item.payer.slice(0, 6)}...</span>
                    <ArrowRight className="w-3 h-3 text-text-disabled" />
                    <span>To: {item.payee.slice(0, 6)}...</span>
                  </div>
                  <span className="text-[10px] text-text-disabled">{item.createdAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 justify-end">
                  {item.state === 'Created' && (
                    <button
                      onClick={() => onFundEscrow(item.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-black font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                    >
                      Fund Escrow
                    </button>
                  )}

                  {item.state === 'Funded' && (
                    <>
                      <button
                        onClick={() => onReleaseEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-lg bg-bullish hover:bg-bullish/90 text-black font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                      >
                        Release Funds
                      </button>
                      <button
                        onClick={() => onRefundEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-lg bg-bearish/15 hover:bg-bearish/25 text-bearish border border-bearish/30 font-bold text-xs transition-all disabled:opacity-50"
                      >
                        Refund Reclaim
                      </button>
                    </>
                  )}

                  {(item.state === 'Released' || item.state === 'Refunded') && (
                    <a
                      href={`${STELLAR_CONFIG.explorerUrl}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-canvas border border-b-border text-text-secondary hover:text-gold hover:border-gold/30 text-[11px] font-mono transition-all"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
