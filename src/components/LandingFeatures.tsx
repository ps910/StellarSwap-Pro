import React from 'react';
import { Wallet, Repeat, Lock, BarChart3, ShieldCheck, Layers } from 'lucide-react';

const FEATURES = [
  {
    id: '01',
    title: 'Connect',
    description: 'Freighter & Albedo. Keys never leave the extension — non-custodial and zero secret key risk for signed transaction envelopes.',
    icon: <Wallet className="w-5 h-5" />,
    color: 'lime',
  },
  {
    id: '02',
    title: 'Swap',
    description: 'Trades execute via path payments across native orderbooks with minimal price impact and zero smart contract vulnerability.',
    icon: <Repeat className="w-5 h-5" />,
    color: 'cyan',
  },
  {
    id: '03',
    title: 'Escrow',
    description: 'A Soroban contract lockup vault. Release funds to payee when work is done, or refund when timeout sequence expires.',
    icon: <Lock className="w-5 h-5" />,
    color: 'emerald',
  },
  {
    id: '04',
    title: 'Analytics',
    description: 'Real-time platform metrics: swap volume, escrow activity, user growth, and satisfaction ratings — all tracked live.',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'blue',
  },
  {
    id: '05',
    title: 'Security',
    description: 'Content Security Policy, Sentry error tracking, exponential backoff RPC retries, and ErrorBoundary crash recovery.',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'amber',
  },
  {
    id: '06',
    title: 'Multi-Wallet',
    description: 'StellarWalletsKit supports Freighter, Albedo, Lobstr, xBull, Rabet, and a 1-click Demo Testnet Account for instant access.',
    icon: <Layers className="w-5 h-5" />,
    color: 'purple',
  },
];

const COLOR_MAP: Record<string, { icon: string; border: string; bg: string }> = {
  lime: { icon: 'text-lime-400', border: 'border-lime-400/30', bg: 'bg-lime-400/10' },
  cyan: { icon: 'text-cyan-400', border: 'border-cyan-400/30', bg: 'bg-cyan-400/10' },
  emerald: { icon: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  blue: { icon: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/10' },
  amber: { icon: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  purple: { icon: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/10' },
};

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="text-lime-400 font-bold text-xs font-mono block mb-2">FEATURES</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-sans">
          Everything You Need to <span className="text-lime-400">Trade & Escrow</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => {
          const c = COLOR_MAP[feature.color];
          return (
            <div
              key={feature.id}
              className="p-6 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-3 group hover:border-neutral-700 hover:shadow-lg transition-all cursor-default"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} border ${c.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <div>
                  <span className={`${c.icon} font-bold block text-[10px] font-mono`}>{feature.id}</span>
                  <h3 className="text-sm font-bold text-white font-sans">{feature.title}</h3>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
