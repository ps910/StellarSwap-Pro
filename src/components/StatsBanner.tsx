import React from 'react';
import { PoolReserves } from '../types';
import { Layers, Activity, TrendingUp, ShieldCheck } from 'lucide-react';

interface StatsBannerProps {
  reserves: PoolReserves;
  connectedWallet: string | null;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ reserves, connectedWallet }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              XLM Pool Reserve
            </span>
            <span className="text-lg font-bold text-white font-mono">{reserves.xlm} XLM</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              USDC Pool Reserve
            </span>
            <span className="text-lg font-bold text-white font-mono">${reserves.usdc} USDC</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Contract Protocol Fee
            </span>
            <span className="text-lg font-bold text-white font-mono">0.30% (30 bps)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Active Wallet Kit
            </span>
            <span className="text-sm font-bold text-white capitalize font-mono">
              {connectedWallet ? `${connectedWallet} Connected` : 'Multi-Wallet Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
