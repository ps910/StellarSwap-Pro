import React from 'react';
import { ExternalLink, Terminal, Shield } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-20 relative z-10 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Pitch */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="font-extrabold text-sm text-white font-sans">
              Stellar<span className="text-emerald-400">Swap+</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              Green Belt Level 4
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Non-custodial path payment DEX & Soroban automated contract escrow engine on Stellar Testnet.
          </p>
        </div>

        {/* Right: Technical Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px]">
          <a
            href={`${STELLAR_CONFIG.explorerUrl}/contract/${STELLAR_CONFIG.escrowContractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>CONTRACT</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={`${STELLAR_CONFIG.explorerUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>EXPLORER</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://laboratory.stellar.org/#account-creator?network=test"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>FRIENDBOT</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <span>FREIGHTER</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-6 pt-6 text-center text-slate-600 text-[10px]">
        © 2026 StellarSwap+ • Open Source MIT License • Deployed on Stellar Testnet
      </div>
    </footer>
  );
};
