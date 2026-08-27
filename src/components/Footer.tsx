import React from 'react';
import { ExternalLink, Terminal, Shield, FileText, Video, ClipboardList } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-b-border bg-canvas text-text-tertiary py-10 px-4 sm:px-6 lg:px-8 mt-20 relative z-10 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Pitch */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="font-extrabold text-sm text-text-primary font-sans">
              StellEx <span className="text-gold">Pro</span>
            </span>
            <span className="badge-gold">
              Level 6 Black Belt
            </span>
          </div>
          <p className="text-text-disabled text-[11px]">
            Institutional-grade DEX, 2-of-3 multi-sig escrows, TradingView Pro charts & hardware security on Stellar.
          </p>
        </div>

        {/* Right: Technical Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-[11px]">
          <a
            href={`${STELLAR_CONFIG.explorerUrl}/contract/${STELLAR_CONFIG.escrowContractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <span>CONTRACT</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href={`${STELLAR_CONFIG.explorerUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <span>EXPLORER</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/1rwjibmRmoN6Qp0fkED-tAXiDno5CZB-bnLlBET3puHg/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <ClipboardList className="w-3 h-3" />
            <span>FEEDBACK FORM</span>
          </a>

          <a
            href="./docs/pitch-deck.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>PITCH DECK</span>
          </a>

          <a
            href="https://github.com/ps910/StellarSwap-Pro/blob/main/docs/demo-video.md"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <Video className="w-3 h-3" />
            <span>DEMO VIDEO</span>
          </a>

          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors flex items-center gap-1"
          >
            <span>FREIGHTER</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-b-border/60 mt-6 pt-6 text-center text-text-disabled text-[10px]">
        © 2026 StellEx Pro • Open Source MIT License • Deployed on Stellar Mainnet & Testnet • Level 6 Black Belt Final
      </div>
    </footer>
  );
};
