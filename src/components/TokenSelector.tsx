import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TokenSelectorProps {
  symbol: string;
  name: string;
  icon?: string;
  verified?: boolean;
  onClick?: () => void;
  className?: string;
}

const TOKEN_COLORS: Record<string, string> = {
  XLM: 'bg-[#14151A] border-[#2B313A]',
  USDC: 'bg-[#14151A] border-[#2B313A]',
};

const TOKEN_ICONS: Record<string, { bg: string; fg: string; char: string }> = {
  XLM: { bg: 'bg-gradient-to-br from-[#0E76FD] to-[#1B4DFF]', fg: 'text-white', char: '✦' },
  USDC: { bg: 'bg-gradient-to-br from-[#2775CA] to-[#1A5BB5]', fg: 'text-white', char: '$' },
};

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  symbol,
  name,
  icon,
  verified = true,
  onClick,
  className = '',
}) => {
  const tokenIcon = TOKEN_ICONS[symbol] || { bg: 'bg-elevated', fg: 'text-text-primary', char: '◆' };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-canvas border border-b-border hover:border-gold/30 transition-all duration-200 group ${className}`}
    >
      {/* Token Icon Circle */}
      <div className={`w-6 h-6 rounded-full ${tokenIcon.bg} flex items-center justify-center text-[10px] font-bold ${tokenIcon.fg} group-hover:scale-110 transition-transform`}>
        {tokenIcon.char}
      </div>

      {/* Symbol + Verified */}
      <span className="font-bold text-sm text-text-primary">{symbol}</span>
      {verified && (
        <CheckCircle2 className="w-3 h-3 text-bullish" />
      )}
    </button>
  );
};
