import React from 'react';
import { ArrowRight, Lock, ExternalLink, Shield, Users, Activity, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
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
          <div className="flex items-center gap-2.5 text-xs text-text-tertiary">
            <span className="badge-gold">LEVEL 6 BLACK BELT</span>
            <span>·</span>
            <span className="text-text-secondary font-medium">MAINNET-READY DEX</span>
            <span>·</span>
            <span className="text-bullish font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-bullish" />
              SOROBAN AMM
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]">
            Swap it.<br />
            Escrow it.<br />
            <span className="text-gold block font-black">
              Settle it.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
            Institutional-grade decentralized exchange on Stellar. High-throughput Path Payment routing across native orderbooks and automated Soroban smart contract escrow vaults.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onConnectWallet}
              className="btn-gold text-sm py-3.5 px-8 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-black" />
              <span>Connect Wallet to Trade</span>
            </button>

            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-surface text-xs py-3.5 px-6 flex items-center justify-center gap-2"
            >
              <span>Get Freighter Wallet</span>
              <ExternalLink className="w-3.5 h-3.5 text-text-tertiary" />
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-b-border text-text-secondary">
              <Users className="w-3.5 h-3.5 text-gold" />
              <span><span className="text-text-primary font-bold tabular-nums">52+</span> Onboarded Users</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-b-border text-text-secondary">
              <Activity className="w-3.5 h-3.5 text-bullish" />
              <span><span className="text-text-primary font-bold tabular-nums">170+</span> Live Transactions</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-b-border text-text-secondary">
              <TrendingUp className="w-3.5 h-3.5 text-protocol-blue" />
              <span><span className="text-text-primary font-bold tabular-nums">99.9%</span> SLA Consensus</span>
            </div>
          </div>
        </div>

        {/* Right Column: Custody Path Diagram (FIG. 1) */}
        <div className="lg:col-span-5">
          <div className="card-surface p-6 shadow-2xl relative overflow-hidden text-xs">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-b-border pb-3.5 mb-5">
              <span className="text-text-tertiary font-bold text-[11px] uppercase tracking-wider">FIG. 1 – SOROBAN SETTLEMENT PIPELINE</span>
              <span className="badge-gold">
                SOROBAN RUST L2
              </span>
            </div>

            {/* Visual Node Graph Matching Pro Layout */}
            <div className="space-y-3.5">
              {/* Payer Box */}
              <div className="p-3.5 rounded-xl bg-canvas border border-b-border flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-bold block text-xs">PAYER WALLET</span>
                  <span className="text-[10px] text-text-tertiary font-mono tabular-nums">GBXKQ...Y54B</span>
                </div>
                <span className="badge-blue text-[10px]">DEPOSITS ASSET</span>
              </div>

              {/* Fund Connector */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-gold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="font-bold">fund() ── atomic lockup</span>
                <ArrowRight className="w-3 h-3 text-gold" />
              </div>

              {/* Escrow Central Contract Box */}
              <div className="p-4 rounded-xl bg-elevated border border-gold/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gold" />
                    <span className="text-gold font-bold text-xs">ESCROW CONTRACT</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary font-mono tabular-nums">
                    #{STELLAR_CONFIG.escrowContractId.slice(0, 6)}
                  </span>
                </div>
                <div className="text-[11px] text-text-tertiary space-y-1 pt-1.5 border-t border-b-border font-mono tabular-nums">
                  <div className="flex justify-between">
                    <span>payer:</span>
                    <span className="text-text-secondary">GBXKQ73U...Y54B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>payee:</span>
                    <span className="text-text-secondary">GCDTK94L...M28A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>timelock:</span>
                    <span className="text-text-secondary">54,000 ledger</span>
                  </div>
                </div>
              </div>

              {/* Split Paths: Release & Refund */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                {/* Release Path */}
                <div className="p-3 rounded-xl bg-bullish/10 border border-bullish/30 space-y-1">
                  <div className="flex items-center justify-between text-bullish font-bold">
                    <span>release()</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-text-primary block text-[10px] font-semibold">PAYEE SETTLEMENT</span>
                  <span className="text-text-tertiary text-[9px]">Direct payout</span>
                </div>

                {/* Refund Path */}
                <div className="p-3 rounded-xl bg-bearish/10 border border-bearish/30 border-dashed space-y-1">
                  <div className="flex items-center justify-between text-bearish font-bold">
                    <span>refund()</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-text-primary block text-[10px] font-semibold">PAYER RECLAIM</span>
                  <span className="text-text-tertiary text-[9px]">After timeout ledger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
