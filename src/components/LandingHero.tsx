import React from 'react';
import { ArrowRight, Lock, ExternalLink, Shield, Users, Activity, Zap, TrendingUp } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

interface LandingHeroProps {
  onConnectWallet: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onConnectWallet }) => {
  return (
    <section className="py-12 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Section Tags */}
          <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
            <span className="hover:text-lime-400 transition-colors">01 // FLOW</span>
            <span>|</span>
            <span className="hover:text-lime-400 transition-colors">02 // ENGINE</span>
            <span>|</span>
            <span className="hover:text-lime-400 transition-colors">03 // TESTNET</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-[1.05] font-sans">
            Swap it.<br />
            Escrow it.<br />
            <span className="text-lime-400 block font-black">
              Settle it.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-sans">
            Path payment swaps across Stellar's native orderbook, and a Soroban escrow vault. Instant transactions and zero smart contract risk for standard path swaps; automated Escrow when trust is in the middle.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onConnectWallet}
              className="px-8 py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-sm shadow-xl shadow-lime-400/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 label-mono"
            >
              <Shield className="w-4 h-4 text-black" />
              <span>CONNECT FREIGHTER</span>
            </button>

            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all font-mono"
            >
              <span>NO WALLET YET</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* Trust Badges — Level 5 addition */}
          <div className="flex flex-wrap items-center gap-4 pt-4 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300">
              <Users className="w-3.5 h-3.5 text-lime-400" />
              <span><span className="text-lime-400 font-bold">50+</span> Testnet Users</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span><span className="text-cyan-400 font-bold">170+</span> Transactions</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span><span className="text-amber-400 font-bold">99.8%</span> Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Column: Custody Path Diagram (FIG. 1) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#09090b] border border-neutral-800 shadow-2xl relative overflow-hidden font-mono text-xs">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
              <span className="text-slate-400 font-bold text-[11px]">FIG. 1 – CUSTODY PATH</span>
              <span className="px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-bold">
                SOROBAN RUST L2
              </span>
            </div>

            {/* Visual Node Graph Matching Figma */}
            <div className="space-y-4">
              {/* Payer Box */}
              <div className="p-3.5 rounded-xl bg-[#050505] border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block text-xs">PAYER WALLET</span>
                  <span className="text-[10px] text-slate-500 font-mono">GBXKQ...Y54B</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px]">INSERTS FUNDS</span>
              </div>

              {/* Fund Connector */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-lime-400">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping"></span>
                <span className="font-bold">fund() ── deposit asset</span>
                <ArrowRight className="w-3 h-3 text-lime-400" />
              </div>

              {/* Escrow Central Contract Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-lime-400/50 glow-lime-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-lime-400" />
                    <span className="text-lime-400 font-bold text-xs">ESCROW CONTRACT</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ID: #{STELLAR_CONFIG.escrowContractId.slice(0, 6)}</span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-neutral-900">
                  <div className="flex justify-between">
                    <span>payer:</span>
                    <span className="text-slate-200">GBXKQ73U...Y54B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>payee:</span>
                    <span className="text-slate-200">GCDTK94L...M28A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>timeout:</span>
                    <span className="text-slate-200">54,000 ledger</span>
                  </div>
                </div>
              </div>

              {/* Split Paths: Release & Refund */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[10px]">
                {/* Release Path */}
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>release()</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 block text-[9px]">PAYEE WALLET</span>
                  <span className="text-slate-500 text-[9px]">Final Settlement</span>
                </div>

                {/* Refund Path */}
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 border-dashed space-y-1">
                  <div className="flex items-center justify-between text-purple-400 font-bold">
                    <span>refund()</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-slate-300 block text-[9px]">PAYER (REFUND)</span>
                  <span className="text-slate-500 text-[9px]">After Timeout Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
