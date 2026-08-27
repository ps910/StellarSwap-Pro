import React from 'react';
import { Wallet, Repeat, Lock, BarChart3, ShieldCheck, Layers } from 'lucide-react';

const FEATURES = [
  {
    id: '01',
    title: 'Hardware & Multi-Wallet',
    description: 'Direct Ledger, Trezor, and Keystone hardware security (EAL6+ HSM & Air-Gapped QR) plus Freighter, Albedo, Lobstr, and xBull.',
    icon: <Wallet className="w-5 h-5" />,
    color: 'gold',
  },
  {
    id: '02',
    title: 'TradingView Pro Charts',
    description: 'Interactive candlestick charts with 7 timeframes (1m-1W), SMA/EMA/RSI technical indicators, and live Soroban orderbook feeds.',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'bullish',
  },
  {
    id: '03',
    title: 'Batch Escrow Operations',
    description: 'Multi-select batch funding, bulk 2-of-3 signing, milestone release, and CSV multi-recipient automated vault deployment.',
    icon: <Layers className="w-5 h-5" />,
    color: 'gold',
  },
  {
    id: '04',
    title: 'Real-Time Price Alerts',
    description: 'Custom threshold monitoring across 10 token pairs with in-app audio chimes and browser Notification API alerts.',
    icon: <Repeat className="w-5 h-5" />,
    color: 'blue',
  },
  {
    id: '05',
    title: '10+ Token Pairs & AMM',
    description: 'High-velocity swaps across XLM, USDC, EURC, yXLM, AQUA, BTC, ETH, SHX, yUSDC, and SLT with path payment aggregation.',
    icon: <Repeat className="w-5 h-5" />,
    color: 'bullish',
  },
  {
    id: '06',
    title: 'Cryptographic History Export',
    description: 'Instant CSV export and signed JSON audit proofs for on-chain telemetry, accounting, and institutional compliance.',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'gold',
  },
];

const COLOR_MAP: Record<string, { icon: string; border: string; bg: string }> = {
  gold: { icon: 'text-gold', border: 'border-gold/30', bg: 'bg-gold/10' },
  bullish: { icon: 'text-bullish', border: 'border-bullish/30', bg: 'bg-bullish/10' },
  blue: { icon: 'text-protocol-blue', border: 'border-protocol-blue/30', bg: 'bg-protocol-blue/10' },
};

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-b-border">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="badge-gold mb-2">FEATURES & ARCHITECTURE</span>
        <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-2">
          Everything You Need to <span className="text-gold">Trade & Escrow</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature) => {
          const c = COLOR_MAP[feature.color] || COLOR_MAP.gold;
          return (
            <div
              key={feature.id}
              className="p-6 rounded-2xl bg-surface border border-b-border space-y-3 group hover:border-gold/40 hover:bg-surface-hover transition-all duration-200 cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} border ${c.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  {feature.icon}
                </div>
                <div>
                  <span className={`${c.icon} font-bold block text-[10px] font-mono tabular-nums`}>{feature.id}</span>
                  <h3 className="text-sm font-bold text-text-primary">{feature.title}</h3>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
