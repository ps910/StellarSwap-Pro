import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface TrustlineCheckProps {
  asset: string;
  hasTrustline: boolean;
  onAuthorizeTrustline: () => void;
  isAuthorizing?: boolean;
}

export const TrustlineCheck: React.FC<TrustlineCheckProps> = ({
  asset,
  hasTrustline,
  onAuthorizeTrustline,
  isAuthorizing = false,
}) => {
  if (hasTrustline) return null;

  return (
    <div className="p-3.5 rounded-xl bg-gold/8 border border-gold/25 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-gold/15 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-gold" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-gold mb-1">Trustline Required</h4>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            First-time swap for <span className="text-text-primary font-semibold">{asset}</span>.
            Stellar requires a one-time trustline authorization (locks ~0.5 XLM reserve).
          </p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onAuthorizeTrustline}
              disabled={isAuthorizing}
              className="px-4 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-black text-xs font-bold transition-all disabled:opacity-50"
            >
              {isAuthorizing ? 'Authorizing...' : `Add ${asset} Trustline`}
            </button>
            <span className="text-[10px] text-text-tertiary">
              Gas: ~100 stroops (0.00001 XLM)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
