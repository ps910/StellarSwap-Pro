import React, { useState } from 'react';
import { WalletState, EscrowItem } from '../types';
import {
  Lock,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  Gavel,
  Sliders,
  Users,
  Layers,
} from 'lucide-react';
import { SUPPORTED_TOKENS, STELLAR_CONFIG } from '../config/stellar';

interface EscrowInterfaceProps {
  walletState: WalletState;
  escrows: EscrowItem[];
  onOpenWalletModal: () => void;
  onCreateEscrow: (
    payee: string,
    arbiter: string | undefined,
    token: string,
    amount: string,
    lockupHours: number,
    description: string
  ) => Promise<void>;
  onFundEscrow: (escrowId: number) => Promise<void>;
  onApproveEscrow: (escrowId: number, role: 'payer' | 'payee' | 'arbiter') => Promise<void>;
  onReleaseEscrow: (escrowId: number) => Promise<void>;
  onRefundEscrow: (escrowId: number) => Promise<void>;
  onDisputeEscrow: (escrowId: number) => Promise<void>;
  onResolveDispute: (escrowId: number, payeeShareBps: number) => Promise<void>;
  isProcessing: boolean;
}

export const EscrowInterface: React.FC<EscrowInterfaceProps> = ({
  walletState,
  escrows,
  onOpenWalletModal,
  onCreateEscrow,
  onFundEscrow,
  onApproveEscrow,
  onReleaseEscrow,
  onRefundEscrow,
  onDisputeEscrow,
  onResolveDispute,
  isProcessing,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'multisig' | 'disputed' | 'settled'>('all');
  const [copiedContract, setCopiedContract] = useState(false);

  // Form State
  const [payeeAddress, setPayeeAddress] = useState('');
  const [arbiterAddress, setArbiterAddress] = useState('');
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('500');
  const [lockupHours, setLockupHours] = useState('24');
  const [description, setDescription] = useState('');

  // Dispute Modal State
  const [disputeModalEscrowId, setDisputeModalEscrowId] = useState<number | null>(null);
  const [payeeSplitBps, setPayeeSplitBps] = useState(7000); // 70% default

  const handleCopyContract = () => {
    navigator.clipboard.writeText(STELLAR_CONFIG.escrowContractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 1500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeAddress) return;
    await onCreateEscrow(
      payeeAddress,
      arbiterAddress.trim() || undefined,
      token,
      amount,
      parseInt(lockupHours, 10),
      description || 'Smart Contract Agreement'
    );
    setPayeeAddress('');
    setArbiterAddress('');
    setDescription('');
    setActiveSubTab('list');
  };

  const handleResolveSubmit = async () => {
    if (disputeModalEscrowId === null) return;
    await onResolveDispute(disputeModalEscrowId, payeeSplitBps);
    setDisputeModalEscrowId(null);
  };

  const filteredEscrows = escrows.filter((item) => {
    if (filterMode === 'active') return item.state === 'Created' || item.state === 'Funded';
    if (filterMode === 'multisig') return !!item.arbiter;
    if (filterMode === 'disputed') return item.state === 'Disputed';
    if (filterMode === 'settled') return item.state === 'Released' || item.state === 'Refunded' || item.state === 'Resolved';
    return true;
  });

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
      case 'Disputed':
        return (
          <span className="bg-bearish/20 text-bearish border border-bearish/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> DISPUTED
          </span>
        );
      case 'Resolved':
        return (
          <span className="bg-gold/20 text-gold border border-gold/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
            <Gavel className="w-3 h-3" /> RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="card-surface p-6 animate-fade-in mb-6 select-none border-border/80 shadow-2xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-b-border pb-3.5 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold/10 border border-gold/20 text-gold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary tracking-tight">Soroban Multi-Sig Escrow Vault</h2>
              <span className="badge-gold text-[9px] font-extrabold">2-of-3 MULTI-SIG</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Non-custodial smart contracts with SAC token transfers, arbiter dispute resolution, and persistent TTL scaling.
            </p>
          </div>
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

      {/* Subtab Navigation + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] bg-canvas p-1 rounded-xl border border-b-border">
          {(['all', 'active', 'multisig', 'disputed', 'settled'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all ${
                filterMode === mode
                  ? 'bg-elevated text-gold border border-gold/30'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Action Toggle */}
        <div className="flex bg-canvas p-1 rounded-xl border border-b-border text-xs">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 ${
              activeSubTab === 'list'
                ? 'bg-gold text-black shadow-sm'
                : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            ACTIVE LIST ({filteredEscrows.length})
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

      {/* ── View: Create Escrow Form ── */}
      {activeSubTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs animate-fade-in">
          <div>
            <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
              Recipient Stellar Address (Payee) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GCDTK94LM77M1B4P7M8N28A..."
              value={payeeAddress}
              onChange={(e) => setPayeeAddress(e.target.value)}
              className="input-elevated text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Third-Party Arbiter Address (Optional for 2-of-3 Multi-Sig Dispute Mediation)</span>
              <span className="text-gold font-normal">Level 6 Advanced</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GAYK749LM99P2C1R4M6Z99Q... (Leave empty for 2-party escrow)"
              value={arbiterAddress}
              onChange={(e) => setArbiterAddress(e.target.value)}
              className="input-elevated text-xs font-mono"
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
                className="input-elevated text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                Timeout Ledger Duration (Before Refund Reclamation)
              </label>
              <select
                value={lockupHours}
                onChange={(e) => setLockupHours(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-b-border text-text-primary focus:outline-none focus:border-gold text-xs font-mono cursor-pointer"
              >
                <option value="1" className="bg-surface text-text-primary">1 Hour (~720 Ledgers)</option>
                <option value="24" className="bg-surface text-text-primary">24 Hours (~17,280 Ledgers)</option>
                <option value="72" className="bg-surface text-text-primary">72 Hours (~51,840 Ledgers)</option>
                <option value="168" className="bg-surface text-text-primary">168 Hours (1 Week)</option>
              </select>
            </div>

            <div>
              <label className="block text-text-tertiary mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                Contract Agreement Reference / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Milestone 1: Soroban Rust Audit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-elevated text-xs"
              />
            </div>
          </div>

          {/* Protocol Fee Notice */}
          <div className="p-3 rounded-xl bg-canvas border border-b-border text-[11px] flex items-center justify-between text-text-tertiary">
            <span>Protocol Settlement Fee (0.5% on release):</span>
            <span className="text-gold font-mono font-bold">
              {((parseFloat(amount) || 0) * 0.005).toFixed(2)} {token}
            </span>
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
              className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-black text-xs shadow-lg shadow-gold/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-black" />
              <span>INITIALIZE 2-OF-3 MULTI-SIG ESCROW</span>
            </button>
          )}
        </form>
      )}

      {/* ── View: Escrows List ── */}
      {activeSubTab === 'list' && (
        <div className="space-y-3 text-xs">
          {filteredEscrows.length === 0 ? (
            <div className="p-8 text-center bg-canvas rounded-xl border border-b-border">
              <AlertCircle className="w-8 h-8 text-text-disabled mx-auto mb-2" />
              <p className="text-xs text-text-tertiary">No agreement vaults matching filter "{filterMode}".</p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-3 px-4 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/30 font-bold hover:bg-gold/20 text-xs transition-all"
              >
                + Create Multi-Sig Escrow
              </button>
            </div>
          ) : (
            filteredEscrows.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-elevated border border-b-border hover:border-b-border-light transition-all space-y-3"
              >
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary font-mono">ESCROW #{item.id}</span>
                    {getStatusBadge(item.state)}
                    {item.arbiter && (
                      <span className="text-[10px] bg-gold/10 text-gold border border-gold/30 px-1.5 py-0.2 rounded font-bold">
                        2-of-3 Multi-Sig
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gold font-extrabold text-sm font-mono tabular-nums">
                      {item.amount} {item.token}
                    </span>
                    {item.feeAmount && (
                      <span className="block text-[10px] text-text-tertiary font-mono">
                        (Fee: {item.feeAmount} {item.token})
                      </span>
                    )}
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-text-secondary font-medium bg-canvas/60 p-2 rounded-lg border border-b-border/40">
                    "{item.description}"
                  </p>
                )}

                {/* Multi-Signature Status Indicators */}
                <div className="p-2.5 rounded-lg bg-canvas border border-b-border/60 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-text-tertiary">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Multi-Sig Signatures:</span>
                    <span className="font-mono text-[10px]">
                      {((item.payerApproved ? 1 : 0) + (item.payeeApproved ? 1 : 0) + (item.arbiterApproved ? 1 : 0))}/
                      {item.arbiter ? '3 Required (2-of-3)' : '2 Required'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div className={`p-1.5 rounded border text-center ${item.payerApproved ? 'bg-bullish/10 border-bullish/40 text-bullish font-bold' : 'bg-elevated border-b-border text-text-tertiary'}`}>
                      Payer: {item.payerApproved ? '✅ Approved' : '⏳ Awaiting'}
                    </div>
                    <div className={`p-1.5 rounded border text-center ${item.payeeApproved ? 'bg-bullish/10 border-bullish/40 text-bullish font-bold' : 'bg-elevated border-b-border text-text-tertiary'}`}>
                      Payee: {item.payeeApproved ? '✅ Approved' : '⏳ Awaiting'}
                    </div>
                    <div className={`p-1.5 rounded border text-center ${item.arbiterApproved ? 'bg-bullish/10 border-bullish/40 text-bullish font-bold' : 'bg-elevated border-b-border text-text-tertiary'}`}>
                      Arbiter: {item.arbiter ? (item.arbiterApproved ? '✅ Approved' : '⏳ Pending') : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-text-tertiary font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Payer: {item.payer.slice(0, 6)}...{item.payer.slice(-4)}</span>
                    <ArrowRight className="w-3 h-3 text-text-disabled" />
                    <span>Payee: {item.payee.slice(0, 6)}...{item.payee.slice(-4)}</span>
                    {item.arbiter && (
                      <span className="text-gold text-[10px]">
                        (Arbiter: {item.arbiter.slice(0, 4)}...{item.arbiter.slice(-4)})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-disabled">{item.createdAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 justify-end flex-wrap">
                  {item.state === 'Created' && (
                    <button
                      onClick={() => onFundEscrow(item.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-black font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                    >
                      Fund Escrow Vault
                    </button>
                  )}

                  {item.state === 'Funded' && (
                    <>
                      {/* Approve Multi-Sig button */}
                      <button
                        onClick={() => onApproveEscrow(item.id, 'payer')}
                        disabled={isProcessing || item.payerApproved}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                          item.payerApproved
                            ? 'bg-bullish/10 text-bullish border border-bullish/30 cursor-default'
                            : 'bg-gold hover:bg-gold-hover text-black'
                        }`}
                      >
                        {item.payerApproved ? '✓ Payer Signed' : 'Sign Approval'}
                      </button>

                      {/* Direct Release */}
                      <button
                        onClick={() => onReleaseEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-bullish hover:bg-bullish/90 text-black font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                      >
                        Release Funds
                      </button>

                      {/* Raise Dispute button */}
                      <button
                        onClick={() => onDisputeEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-bearish/10 hover:bg-bearish/20 text-bearish border border-bearish/30 font-bold text-xs transition-all disabled:opacity-50"
                      >
                        Raise Dispute
                      </button>

                      {/* Refund Reclaim */}
                      <button
                        onClick={() => onRefundEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-canvas hover:bg-elevated text-text-tertiary border border-b-border font-medium text-xs transition-all disabled:opacity-50"
                      >
                        Refund Reclaim
                      </button>
                    </>
                  )}

                  {item.state === 'Disputed' && (
                    <button
                      onClick={() => setDisputeModalEscrowId(item.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-black font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Arbiter Adjudication Modal</span>
                    </button>
                  )}

                  {(item.state === 'Released' || item.state === 'Refunded' || item.state === 'Resolved') && (
                    <a
                      href={`${STELLAR_CONFIG.explorerUrl}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-canvas border border-b-border text-text-secondary hover:text-gold hover:border-gold/30 text-[11px] font-mono transition-all"
                    >
                      <span>Explorer Tx</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Dispute Resolution Modal ── */}
      {disputeModalEscrowId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-md animate-fade-in">
          <div className="card-surface p-6 max-w-lg w-full rounded-2xl border-gold/30 shadow-2xl shadow-gold/10 space-y-4">
            <div className="flex items-center gap-2 text-gold border-b border-b-border pb-3">
              <Gavel className="w-5 h-5" />
              <h3 className="text-base font-bold text-text-primary">
                Arbiter Dispute Adjudication — Escrow #{disputeModalEscrowId}
              </h3>
            </div>

            <p className="text-xs text-text-secondary">
              As the designated third-party Arbiter on this smart contract, select the payout split percentage between Payee and Payer based on milestone delivery evidence.
            </p>

            <div className="p-4 rounded-xl bg-canvas border border-b-border space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-bullish">Payee Receives: {(payeeSplitBps / 100).toFixed(0)}%</span>
                <span className="text-gold">Payer Refund: {(100 - payeeSplitBps / 100).toFixed(0)}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={payeeSplitBps}
                onChange={(e) => setPayeeSplitBps(parseInt(e.target.value, 10))}
                className="w-full accent-gold cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
                <span>0% (Full Refund)</span>
                <span>50% (50/50 Split)</span>
                <span>100% (Full Payout)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisputeModalEscrowId(null)}
                className="px-4 py-2 rounded-xl bg-elevated hover:bg-elevated-hover text-text-secondary text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleResolveSubmit}
                className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs shadow-lg shadow-gold/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Gavel className="w-4 h-4" />
                <span>Execute Split Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
