import React from 'react';
import { ContractEvent } from '../types';
import { STELLAR_CONFIG } from '../config/stellar';
import { Activity, ArrowRightLeft, PlusCircle, ExternalLink, Zap } from 'lucide-react';

interface EventFeedProps {
  events: ContractEvent[];
}

export const EventFeed: React.FC<EventFeedProps> = ({ events }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl shadow-cyan-950/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Real-Time Soroban Events</h3>
            <p className="text-xs text-slate-400">Live RPC event stream for Soroban smart contract</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 text-xs font-medium border border-emerald-800/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Live Sync
        </span>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No contract events detected yet. Initiate a swap to emit events!
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70 hover:border-cyan-500/40 transition-all text-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evt.type === 'swap' ? (
                    <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                      <PlusCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="font-semibold text-white capitalize">{evt.type} Event</span>
                  <span className="text-[10px] text-slate-400 font-mono">by {evt.user}</span>
                </div>
                <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
              </div>

              {/* Trade Details */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-slate-300 font-mono">
                {evt.type === 'swap' ? (
                  <span>
                    {evt.amountIn} {evt.tokenIn} →{' '}
                    <span className="text-cyan-400 font-bold">{evt.amountOut} {evt.tokenOut}</span>
                  </span>
                ) : (
                  <span>
                    Deposited <span className="text-indigo-400 font-bold">{evt.amount} {evt.token}</span>
                  </span>
                )}

                <a
                  href={`${STELLAR_CONFIG.explorerUrl}/tx/${evt.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-0.5 text-[10px]"
                  title="View transaction on Stellar Expert"
                >
                  <span>Tx</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
        <Zap className="w-3 h-3 text-cyan-400" />
        Subscribed to Soroban `getEvents` Topic Filter
      </div>
    </div>
  );
};
