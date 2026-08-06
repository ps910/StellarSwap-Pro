import React, { useState } from 'react';
import { ContractEvent } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { ExternalLink, RefreshCw, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ActivityTableProps {
  events: ContractEvent[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ events }) => {
  const [filter, setFilter] = useState<'all' | 'swap' | 'escrow'>('all');

  const filteredEvents = events.filter((e) => {
    if (filter === 'swap') return e.type === 'swap' || e.type === 'deposit';
    if (filter === 'escrow') return e.type.startsWith('escrow');
    return true;
  });

  const getOperationBadge = (type: ContractEvent['type']) => {
    switch (type) {
      case 'swap':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-mono">
            <RefreshCw className="w-3 h-3" /> PATH SWAP
          </span>
        );
      case 'deposit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            <ArrowUpRight className="w-3 h-3" /> DEPOSIT
          </span>
        );
      case 'escrow_create':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
            <Lock className="w-3 h-3" /> ESCROW CREATE
          </span>
        );
      case 'escrow_fund':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
            <Lock className="w-3 h-3" /> ESCROW FUND
          </span>
        );
      case 'escrow_release':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            <CheckCircle2 className="w-3 h-3" /> ESCROW RELEASE
          </span>
        );
      case 'escrow_refund':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono">
            <RefreshCw className="w-3 h-3" /> ESCROW REFUND
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3 mb-6">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <span>04 // ON-CHAIN ACTIVITY TELEMETRY</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-[#050505] p-1 rounded-xl border border-neutral-800 text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filter === 'all'
                ? 'bg-neutral-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('swap')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filter === 'swap'
                ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SWAPS
          </button>
          <button
            onClick={() => setFilter('escrow')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filter === 'escrow'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ESCROW
          </button>
        </div>
      </div>

      {/* Operations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-slate-500 text-[10px]">
              <th className="py-3 px-4 font-semibold">OPERATION</th>
              <th className="py-3 px-4 font-semibold">DETAILS</th>
              <th className="py-3 px-4 font-semibold">ACCOUNT</th>
              <th className="py-3 px-4 font-semibold">LEDGER</th>
              <th className="py-3 px-4 font-semibold">FEE</th>
              <th className="py-3 px-4 font-semibold">AGE</th>
              <th className="py-3 px-4 font-semibold text-right">HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-[11px]">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No operations recorded yet.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt, idx) => (
                <tr key={evt.id} className="hover:bg-[#050505] transition-colors">
                  <td className="py-3.5 px-4 font-bold">{getOperationBadge(evt.type)}</td>
                  <td className="py-3.5 px-4 text-white font-mono">
                    {evt.amountIn && evt.amountOut ? (
                      <span>{evt.amountIn} {evt.tokenIn} → {evt.amountOut} {evt.tokenOut}</span>
                    ) : evt.escrowId ? (
                      <span>Escrow #{evt.escrowId} {evt.amount ? `(${evt.amount} ${evt.token})` : ''}</span>
                    ) : (
                      <span>{evt.amount} {evt.token}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{evt.user}</td>
                  <td className="py-3.5 px-4 text-slate-300">#{54200 + idx * 3}</td>
                  <td className="py-3.5 px-4 text-lime-400">0.00001 XLM</td>
                  <td className="py-3.5 px-4 text-slate-400">{evt.timestamp}</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`${STELLAR_CONFIG.explorerUrl}/tx/${evt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lime-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      <span>{evt.txHash.slice(0, 6)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
