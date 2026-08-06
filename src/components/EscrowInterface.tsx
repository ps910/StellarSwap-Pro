import React, { useState } from 'react';
import { WalletState, EscrowItem } from '../types';
import { Lock, ArrowRight, Clock, RefreshCw, CheckCircle2, AlertCircle, PlusCircle, Copy, Check } from 'lucide-react';
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
            <Clock className="w-3 h-3" /> CREATED
          </span>
        );
      case 'Funded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-bold font-mono">
            <Lock className="w-3 h-3" /> FUNDED
          </span>
        );
      case 'Released':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
            <CheckCircle2 className="w-3 h-3" /> RELEASED
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold font-mono">
            <RefreshCw className="w-3 h-3" /> REFUNDED
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3 mb-6">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <span>03 // SOROBAN ESCROW VAULT</span>
        </div>

        {/* Contract ID Copy Pill */}
        <button
          onClick={handleCopyContract}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#050505] border border-neutral-800 text-slate-400 hover:text-white transition-colors text-[10px]"
        >
          <span>CONTRACT: #{STELLAR_CONFIG.escrowContractId.slice(0, 8)}...</span>
          {copiedContract ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <span className="text-xs font-bold text-slate-300">
          AGREEMENTS ({escrows.length})
        </span>

        <div className="flex bg-[#050505] p-1 rounded-xl border border-neutral-800 text-xs">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'list'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ACTIVE LIST
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
              activeSubTab === 'create'
                ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>NEW ESCROW</span>
          </button>
        </div>
      </div>

      {/* View: Create Escrow Form */}
      {activeSubTab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-2 font-bold">PAYEE RECIPIENT STELLAR ADDRESS</label>
            <input
              type="text"
              required
              placeholder="e.g. GCDTK94L...M28A"
              value={payeeAddress}
              onChange={(e) => setPayeeAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-neutral-800 text-white placeholder-slate-600 focus:outline-none focus:border-lime-400 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-2 font-bold">ASSET TOKEN</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-neutral-800 text-white focus:outline-none focus:border-lime-400 text-xs font-mono"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.icon} {t.symbol} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-2 font-bold">LOCKUP AMOUNT</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-neutral-800 text-white focus:outline-none focus:border-lime-400 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-bold">LOCKUP DURATION (BEFORE REFUND TIMEOUT)</label>
            <select
              value={lockupHours}
              onChange={(e) => setLockupHours(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#050505] border border-neutral-800 text-white focus:outline-none focus:border-lime-400 text-xs font-mono"
            >
              <option value="1">1 Hour</option>
              <option value="24">24 Hours (1 Day)</option>
              <option value="72">72 Hours (3 Days)</option>
              <option value="168">168 Hours (1 Week)</option>
            </select>
          </div>

          {!walletState.isConnected ? (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="w-full py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-all label-mono"
            >
              CONNECT FREIGHTER TO INITIALIZE ESCROW
            </button>
          ) : (
            <button
              type="submit"
              disabled={isProcessing || !payeeAddress}
              className="w-full py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs shadow-lg shadow-lime-400/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 label-mono"
            >
              <Lock className="w-4 h-4 text-black" />
              <span>INITIALIZE SOROBAN ESCROW</span>
            </button>
          )}
        </form>
      )}

      {/* View: Escrows List */}
      {activeSubTab === 'list' && (
        <div className="space-y-4 text-xs">
          {escrows.length === 0 ? (
            <div className="p-8 text-center bg-[#050505] rounded-xl border border-neutral-800">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No active agreement vaults found.</p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="mt-3 px-4 py-2 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold hover:bg-lime-400/20"
              >
                + CREATE FIRST ESCROW
              </button>
            </div>
          ) : (
            escrows.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[#050505] border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
              >
                {/* Header & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">ESCROW #{item.id}</span>
                    {getStatusBadge(item.state)}
                  </div>
                  <span className="text-lime-400 font-extrabold text-sm">{item.amount} {item.token}</span>
                </div>

                {/* Timeline Visualizer */}
                <div className="p-3 rounded-lg bg-[#09090b] border border-neutral-800/80 text-[10px] space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span className={item.state === 'Created' || item.state === 'Funded' || item.state === 'Released' ? 'text-lime-400 font-bold' : ''}>1. CREATED</span>
                    <span className={item.state === 'Funded' || item.state === 'Released' ? 'text-lime-400 font-bold' : ''}>2. FUNDED</span>
                    <span className={item.state === 'Released' ? 'text-lime-400 font-bold' : item.state === 'Refunded' ? 'text-purple-400 font-bold' : ''}>3. {item.state === 'Refunded' ? 'REFUNDED' : 'RELEASED'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-950 rounded-full flex overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        item.state === 'Released'
                          ? 'bg-lime-400 w-full'
                          : item.state === 'Refunded'
                          ? 'bg-purple-400 w-full'
                          : item.state === 'Funded'
                          ? 'bg-lime-400 w-2/3'
                          : 'bg-amber-400 w-1/3'
                      }`}
                    />
                  </div>
                </div>

                {/* Account Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>PAYER: {item.payer}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span>PAYEE: {item.payee}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{item.createdAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 justify-end">
                  {item.state === 'Created' && (
                    <button
                      onClick={() => onFundEscrow(item.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs shadow-md shadow-lime-400/20 transition-all disabled:opacity-50 label-mono"
                    >
                      FUND ESCROW
                    </button>
                  )}

                  {item.state === 'Funded' && (
                    <>
                      <button
                        onClick={() => onReleaseEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs shadow-md shadow-lime-400/20 transition-all disabled:opacity-50 label-mono"
                      >
                        RELEASE FUNDS
                      </button>
                      <button
                        onClick={() => onRefundEscrow(item.id)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs transition-all disabled:opacity-50 label-mono"
                      >
                        REFUND RECLAIM
                      </button>
                    </>
                  )}

                  {(item.state === 'Released' || item.state === 'Refunded') && (
                    <a
                      href={`${STELLAR_CONFIG.explorerUrl}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#09090b] border border-neutral-800 text-slate-400 hover:text-lime-400 text-[11px] font-mono"
                    >
                      VIEW EXPLORER ↗
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
