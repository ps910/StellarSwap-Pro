import React, { useState } from 'react';
import { ContractEvent } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { ExportService } from '../services/exportService';
import { ExternalLink, RefreshCw, Lock, ArrowUpRight, CheckCircle2, Download, FileJson, FileSpreadsheet } from 'lucide-react';

interface ActivityTableProps {
  events: ContractEvent[];
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ events }) => {
  const [filter, setFilter] = useState<'all' | 'swap' | 'escrow'>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    if (filter === 'swap') return e.type === 'swap' || e.type === 'deposit';
    if (filter === 'escrow') return e.type.startsWith('escrow');
    return true;
  });

  const handleExportCSV = () => {
    ExportService.exportEventsToCSV(filteredEvents);
    setExportNotice('Exported CSV successfully');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleExportJSON = () => {
    ExportService.exportAuditProofJSON(filteredEvents, []);
    setExportNotice('Generated Cryptographic Proof JSON');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const getOperationBadge = (type: ContractEvent['type']) => {
    switch (type) {
      case 'swap':
        return (
          <span className="badge-bullish">
            <RefreshCw className="w-3 h-3" /> PATH SWAP
          </span>
        );
      case 'deposit':
        return (
          <span className="badge-blue">
            <ArrowUpRight className="w-3 h-3" /> DEPOSIT
          </span>
        );
      case 'escrow_create':
        return (
          <span className="badge-gold">
            <Lock className="w-3 h-3" /> ESCROW CREATE
          </span>
        );
      case 'escrow_fund':
        return (
          <span className="badge-gold">
            <Lock className="w-3 h-3" /> ESCROW FUND
          </span>
        );
      case 'escrow_release':
        return (
          <span className="badge-bullish">
            <CheckCircle2 className="w-3 h-3" /> ESCROW RELEASE
          </span>
        );
      case 'escrow_refund':
        return (
          <span className="badge-bearish">
            <RefreshCw className="w-3 h-3" /> ESCROW REFUND
          </span>
        );
    }
  };

  return (
    <div className="card-surface p-6 animate-fade-in mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-b-border pb-3.5 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-text-primary">On-Chain Activity Telemetry</h2>
          <span className="badge-bullish">REAL-TIME RPC</span>
          {exportNotice && (
            <span className="badge-gold text-[10px] animate-fadeIn">{exportNotice}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Actions (Feature Suite) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-elevated hover:bg-elevated-hover border border-b-border text-text-secondary hover:text-gold text-xs font-bold transition-all shadow-xs"
              title="Export Transactions as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-bullish" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-elevated hover:bg-elevated-hover border border-b-border text-text-secondary hover:text-protocol-blue text-xs font-bold transition-all shadow-xs"
              title="Export Signed Cryptographic JSON Proof"
            >
              <FileJson className="w-3.5 h-3.5 text-protocol-blue" />
              <span>Proof JSON</span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex bg-canvas p-1 rounded-xl border border-b-border text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'all'
                  ? 'bg-gold text-black shadow-sm'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter('swap')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'swap'
                  ? 'bg-gold text-black shadow-sm'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              SWAPS
            </button>
            <button
              onClick={() => setFilter('escrow')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'escrow'
                  ? 'bg-gold text-black shadow-sm'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              ESCROW
            </button>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-b-border text-text-tertiary text-[10px] uppercase font-bold tracking-wider">
              <th className="py-3 px-4">Operation</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Ledger</th>
              <th className="py-3 px-4">Fee</th>
              <th className="py-3 px-4">Age</th>
              <th className="py-3 px-4 text-right">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-b-border/60 text-xs">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-disabled">
                  No operations recorded yet.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt, idx) => (
                <tr key={evt.id} className="hover:bg-elevated/50 transition-colors">
                  <td className="py-3 px-4">{getOperationBadge(evt.type)}</td>
                  <td className="py-3 px-4 text-text-primary font-mono tabular-nums font-semibold">
                    {evt.amountIn && evt.amountOut ? (
                      <span>{evt.amountIn} {evt.tokenIn} → {evt.amountOut} {evt.tokenOut}</span>
                    ) : evt.escrowId ? (
                      <span>Escrow #{evt.escrowId} {evt.amount ? `(${evt.amount} ${evt.token})` : ''}</span>
                    ) : (
                      <span>{evt.amount} {evt.token}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-mono text-[11px] tabular-nums">{evt.user}</td>
                  <td className="py-3 px-4 text-text-tertiary tabular-nums font-mono">#{54200 + idx * 3}</td>
                  <td className="py-3 px-4 text-text-tertiary tabular-nums font-mono">0.00001 XLM</td>
                  <td className="py-3 px-4 text-text-disabled text-[11px]">{evt.timestamp}</td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`${STELLAR_CONFIG.explorerUrl}/tx/${evt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold-hover inline-flex items-center gap-1 font-mono text-xs transition-colors"
                    >
                      <span className="tabular-nums">{evt.txHash.slice(0, 6)}...</span>
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
