import React from 'react';
import { Wallet, Repeat, Lock, BarChart3, ShieldCheck, Layers } from 'lucide-react';

const FEATURES = [
  {
    id: '01',
    title: 'Non-Custodial Connect',
    description: 'Freighter & Albedo integration. Keys never leave the wallet — zero secret key exposure for signed XDR transaction envelopes.',
    icon: <Wallet className="w-5 h-5" />,
    color: 'gold',
  },
  {
    id: '02',
    title: 'Soroban Path Swap',
    description: 'Trades execute via path payments across Stellar orderbooks with minimal price impact and Soroban AMM liquidity routing.',
    icon: <Repeat className="w-5 h-5" />,
    color: 'bullish',
  },
  {
    id: '03',
    title: 'Timelocked Escrow',
    description: 'Soroban smart contract vault. Release funds to payee when conditions are satisfied, or reclaim via timeout refund sequence.',
    icon: <Lock className="w-5 h-5" />,
    color: 'gold',
  },
  {
    id: '04',
    title: 'Live Telemetry',
    description: 'Real-time on-chain analytics: volume, escrow states, user onboarding growth, and transaction latency tracked live.',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'blue',
  },
  {
    id: '05',
    title: 'Enterprise Security',
    description: 'Strict Content Security Policy, Sentry error monitoring, exponential backoff RPC retries, and ErrorBoundary recovery.',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'bullish',
  },
  {
    id: '06',
    title: 'Multi-Wallet Kit',
    description: 'StellarWalletsKit supports Freighter, Albedo, Lobstr, xBull, Rabet, and a 1-click Demo Account for zero-friction testing.',
    icon: <Layers className="w-5 h-5" />,
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
