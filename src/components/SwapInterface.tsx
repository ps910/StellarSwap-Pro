import React, { useState } from 'react';
import { WalletState, PoolReserves } from '../types';
import { SUPPORTED_TOKENS } from '../config/stellar';
import { ArrowDownUp, RefreshCw, Settings, ArrowRight, ShieldCheck, Percent, X } from 'lucide-react';
import { TrustlineCheck } from './TrustlineCheck';
import { AccountBalancesData, hasTrustline } from '../services/accountBalances';

interface SwapInterfaceProps {
  walletState: WalletState;
  reserves: PoolReserves;
  balancesData?: AccountBalancesData | null;
  onOpenWalletModal: () => void;
  onExecuteSwap: (tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string) => void;
  onExecuteDeposit: (token: string, amount: string) => void;
  isProcessing: boolean;
}

const TOKEN_ICONS: Record<string, { bg: string; char: string }> = {
  XLM: { bg: 'bg-gradient-to-br from-[#0E76FD] to-[#1B4DFF]', char: '✦' },
  USDC: { bg: 'bg-gradient-to-br from-[#2775CA] to-[#1A5BB5]', char: '$' },
};

export const SwapInterface: React.FC<SwapInterfaceProps> = ({
  walletState,
  reserves,
  balancesData,
  onOpenWalletModal,
  onExecuteSwap,
  onExecuteDeposit,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'deposit'>('swap');
  const [tokenIn, setTokenIn] = useState('XLM');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amountIn, setAmountIn] = useState('100');
  const [depositAmount, setDepositAmount] = useState('500');
  const [depositToken, setDepositToken] = useState('XLM');
  const [slippage, setSlippage] = useState('0.5');
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [customSlippage, setCustomSlippage] = useState('');

  const numericAmountIn = parseFloat(amountIn) || 0;
  const estimatedOutput =
    tokenIn === 'XLM'
      ? (numericAmountIn * 0.0992).toFixed(4)
      : (numericAmountIn * 10.05).toFixed(4);

  const minReceived = (parseFloat(estimatedOutput) * (1 - parseFloat(slippage) / 100)).toFixed(4);
  const priceImpact = numericAmountIn > 5000 ? '0.12' : numericAmountIn > 1000 ? '0.04' : '<0.01';

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  const handlePercentClick = (pct: number) => {
    const bal = tokenIn === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc;
    const numBal = parseFloat(bal.replace(/,/g, '')) || 0;
    setAmountIn((numBal * pct / 100).toFixed(2));
  };

  const handleAction = () => {
    if (!walletState.isConnected) {
      onOpenWalletModal();
      return;
    }
    if (activeTab === 'swap') {
      onExecuteSwap(tokenIn, tokenOut, amountIn, minReceived);
    } else {
      onExecuteDeposit(depositToken, depositAmount);
    }
  };

  const slippagePresets = ['0.1', '0.5', '1.0'];
  const tokenIconIn = TOKEN_ICONS[tokenIn] || { bg: 'bg-elevated', char: '◆' };
  const tokenIconOut = TOKEN_ICONS[tokenOut] || { bg: 'bg-elevated', char: '◆' };

  return (
    <div className="card-surface p-6 animate-fade-in relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-text-primary">
            {activeTab === 'swap' ? 'Instant Swap' : 'Add Liquidity'}
          </h2>
          <span className="badge-bullish">Soroban AMM</span>
        </div>
        <button
          onClick={() => setShowSlippageSettings(!showSlippageSettings)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-tertiary hover:text-gold hover:bg-gold/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-medium tabular-nums">{slippage}%</span>
        </button>
      </div>

      {/* ── Slippage Settings Popup ── */}
      {showSlippageSettings && (
        <div className="absolute right-6 top-16 z-20 w-72 card-elevated p-4 shadow-2xl shadow-canvas/60 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-text-primary">Slippage Tolerance</h4>
            <button onClick={() => setShowSlippageSettings(false)} className="text-text-tertiary hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {slippagePresets.map((pct) => (
              <button
                key={pct}
                onClick={() => { setSlippage(pct); setCustomSlippage(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  slippage === pct && !customSlippage
                    ? 'bg-gold text-black'
                    : 'bg-canvas border border-b-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value);
                if (parseFloat(e.target.value) > 0) setSlippage(e.target.value);
              }}
              className="input-elevated text-xs py-1.5"
            />
            <Percent className="w-4 h-4 text-text-tertiary" />
          </div>
          {parseFloat(slippage) > 1 && (
            <p className="text-[10px] text-gold mt-2">⚠ High slippage may result in unfavorable execution.</p>
          )}
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className="flex p-1 mb-5 rounded-xl bg-canvas border border-b-border text-xs">
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 ${
            activeTab === 'swap'
              ? 'bg-gold text-black shadow-sm'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          TOKEN SWAP
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-200 ${
            activeTab === 'deposit'
              ? 'bg-gold text-black shadow-sm'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          ADD LIQUIDITY
        </button>
      </div>

      {activeTab === 'swap' ? (
        <div className="space-y-3">
          {/* ── PAY (You Send) ── */}
          <div className="p-4 rounded-xl bg-elevated border border-transparent hover:border-b-border-light transition-all duration-200 group">
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-xs font-medium">You Pay</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="tabular-nums">
                  Balance: {tokenIn === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-bold text-text-primary focus:outline-none tabular-nums"
              />
              {/* Token Selector Button */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-canvas border border-b-border">
                <div className={`w-6 h-6 rounded-full ${tokenIconIn.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {tokenIconIn.char}
                </div>
                <select
                  value={tokenIn}
                  onChange={(e) => setTokenIn(e.target.value)}
                  className="bg-transparent text-text-primary font-bold text-sm focus:outline-none cursor-pointer appearance-none pr-2"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol} className="bg-surface text-text-primary">
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Percentage Presets */}
            <div className="flex items-center gap-1.5 mt-3">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handlePercentClick(pct)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold/8 text-gold border border-gold/20 hover:bg-gold/15 hover:border-gold/40 transition-all"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Swap Direction Button ── */}
          <div className="flex justify-center -my-1.5 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="w-10 h-10 rounded-xl bg-surface border-4 border-canvas hover:bg-gold hover:border-gold/30 text-text-tertiary hover:text-black flex items-center justify-center transition-all duration-300 group shadow-lg shadow-canvas/50"
            >
              <ArrowDownUp className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* ── RECEIVE (You Get) ── */}
          <div className="p-4 rounded-xl bg-elevated border border-transparent hover:border-b-border-light transition-all duration-200">
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-xs font-medium">You Receive (Estimated)</span>
              <span className="text-xs tabular-nums">
                Balance: {tokenOut === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                readOnly
                value={estimatedOutput}
                className="w-full bg-transparent text-2xl font-bold text-bullish focus:outline-none tabular-nums"
              />
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-canvas border border-b-border">
                <div className={`w-6 h-6 rounded-full ${tokenIconOut.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {tokenIconOut.char}
                </div>
                <select
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  className="bg-transparent text-text-primary font-bold text-sm focus:outline-none cursor-pointer appearance-none pr-2"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol} className="bg-surface text-text-primary">
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Trustline Pre-flight Check ── */}
          {walletState.isConnected && tokenOut !== 'XLM' && balancesData?.funded && !hasTrustline(balancesData?.balances, tokenOut) && (
            <TrustlineCheck
              asset={tokenOut}
              hasTrustline={false}
              onAuthorizeTrustline={() => {
                alert(`Trustline authorization for ${tokenOut} simulated successfully.`);
              }}
            />
          )}

          {/* ── Price & Routing Telemetry ── */}
          <div className="p-3.5 rounded-xl bg-canvas/60 border border-b-border/60 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-text-tertiary">
              <span>Exchange Rate</span>
              <span className="text-text-secondary tabular-nums font-medium">
                1 {tokenIn} = {tokenIn === 'XLM' ? '0.0992' : '10.0500'} {tokenOut}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-tertiary">
              <span>Price Impact</span>
              <span className={`font-semibold tabular-nums ${parseFloat(priceImpact) > 0.1 ? 'text-gold' : 'text-bullish'}`}>
                {priceImpact}%
              </span>
            </div>
            <div className="flex items-center justify-between text-text-tertiary">
              <span>Guaranteed Minimum</span>
              <span className="text-text-primary font-medium tabular-nums">
                {minReceived} {tokenOut}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-tertiary">
              <span>Network Routing</span>
              <span className="text-bullish flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3" />
                {tokenIn} <ArrowRight className="w-2.5 h-2.5 text-text-disabled" /> Soroban AMM <ArrowRight className="w-2.5 h-2.5 text-text-disabled" /> {tokenOut}
              </span>
            </div>
            <div className="flex items-center justify-between text-text-tertiary">
              <span>Network Fee</span>
              <span className="text-text-secondary font-medium tabular-nums">~0.00001 XLM</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── DEPOSIT FORM ── */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-elevated border border-transparent hover:border-b-border-light transition-all">
            <div className="flex items-center justify-between text-text-tertiary mb-2">
              <span className="text-xs font-medium">Deposit Amount</span>
              <span className="text-xs">Select Asset</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-text-primary focus:outline-none tabular-nums"
              />
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-canvas border border-b-border">
                <div className={`w-6 h-6 rounded-full ${(TOKEN_ICONS[depositToken] || { bg: 'bg-elevated' }).bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                  {(TOKEN_ICONS[depositToken] || { char: '◆' }).char}
                </div>
                <select
                  value={depositToken}
                  onChange={(e) => setDepositToken(e.target.value)}
                  className="bg-transparent text-text-primary font-bold text-sm focus:outline-none cursor-pointer appearance-none pr-2"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol} className="bg-surface text-text-primary">
                      {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA Button ── */}
      <button
        onClick={handleAction}
        disabled={isProcessing}
        className="mt-5 w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold/15 hover:shadow-gold/25"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>SUBMITTING TRANSACTION...</span>
          </>
        ) : !walletState.isConnected ? (
          <span>CONNECT WALLET TO SWAP</span>
        ) : activeTab === 'swap' ? (
          <span>SWAP {tokenIn} → {tokenOut}</span>
        ) : (
          <span>DEPOSIT {depositAmount} {depositToken}</span>
        )}
      </button>
    </div>
  );
};
