import React from 'react';

export const LandingFeatures: React.FC = () => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-900 font-mono text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feature 01: Connect */}
        <div className="space-y-2">
          <span className="text-lime-400 font-bold block text-sm">01</span>
          <h3 className="text-base font-bold text-white font-sans">Connect</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Freighter & Albedo. Keys never leave the extension — non-custodial and zero secret key risk for signed transaction envelopes.
          </p>
        </div>

        {/* Feature 02: Swap */}
        <div className="space-y-2">
          <span className="text-lime-400 font-bold block text-sm">02</span>
          <h3 className="text-base font-bold text-white font-sans">Swap</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Trades execute via path payments across native orderbooks with minimal price impact and zero smart contract vulnerability.
          </p>
        </div>

        {/* Feature 03: Escrow */}
        <div className="space-y-2">
          <span className="text-lime-400 font-bold block text-sm">03</span>
          <h3 className="text-base font-bold text-white font-sans">Escrow</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            A Soroban contract lockup vault. Release funds to payee when work is done, or refund when timeout sequence expires.
          </p>
        </div>
      </div>
    </section>
  );
};
