import React, { useState } from 'react';
import { WalletState, PoolReserves } from '../types';
import { SUPPORTED_TOKENS } from '../config/stellar';
import { ArrowDown, RefreshCw, Settings, ArrowRight } from 'lucide-react';

interface SwapInterfaceProps {
  walletState: WalletState;
  reserves: PoolReserves;
  onOpenWalletModal: () => void;
  onExecuteSwap: (tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string) => void;
  onExecuteDeposit: (token: string, amount: string) => void;
  isProcessing: boolean;
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({
  walletState,
  reserves,
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

  const numericAmountIn = parseFloat(amountIn) || 0;
  const estimatedOutput =
    tokenIn === 'XLM'
      ? (numericAmountIn * 0.0992).toFixed(4)
      : (numericAmountIn * 10.05).toFixed(4);

  const minReceived = (parseFloat(estimatedOutput) * (1 - parseFloat(slippage) / 100)).toFixed(4);

  const handleSwapTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  };

  const handleMaxClick = () => {
    const bal = tokenIn === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc;
    setAmountIn(bal.replace(/,/g, ''));
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

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
        <div className="flex items-center gap-2 text-lime-400 font-bold">
          <span>02 // PATH PAYMENT SWAP ENGINE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Settings className="w-3.5 h-3.5" />
          <span>SLIPPAGE: {slippage}%</span>
        </div>
      </div>

      {/* Subtab Selectors */}
      <div className="flex p-1 mb-6 rounded-xl bg-[#050505] border border-neutral-800 text-xs">
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'swap'
              ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          TOKEN SWAP
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'deposit'
              ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          RESERVE DEPOSIT
        </button>
      </div>

      {activeTab === 'swap' ? (
        <div className="space-y-4">
          {/* YOU SEND BOX */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-bold text-slate-300">YOU SEND</span>
              <div className="flex items-center gap-2">
                <span>BAL: {tokenIn === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc}</span>
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/30 text-[10px] font-bold hover:bg-lime-400/20"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none font-mono"
              />
              <select
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value)}
                className="bg-[#09090b] border border-neutral-700 text-white font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-lime-400 cursor-pointer font-mono"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.icon} {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Direction Switcher */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="w-9 h-9 rounded-xl bg-[#09090b] hover:bg-lime-400 border border-neutral-700 text-slate-300 hover:text-black flex items-center justify-center transition-all shadow-md group"
            >
              <ArrowDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* YOU RECEIVE BOX */}
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-bold text-slate-300">YOU RECEIVE (ESTIMATED)</span>
              <span>BAL: {tokenOut === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                readOnly
                value={estimatedOutput}
                className="w-full bg-transparent text-2xl font-bold text-lime-400 focus:outline-none font-mono"
              />
              <select
                value={tokenOut}
                onChange={(e) => setTokenOut(e.target.value)}
                className="bg-[#09090b] border border-neutral-700 text-white font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-lime-400 cursor-pointer font-mono"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.icon} {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Path Indicator */}
          <div className="p-3 rounded-xl bg-[#050505] border border-neutral-800/80 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>ROUTE PATH</span>
              <span className="text-lime-400 flex items-center gap-1 font-bold">
                {tokenIn} <ArrowRight className="w-3 h-3 text-slate-600" /> Path Payments <ArrowRight className="w-3 h-3 text-slate-600" /> {tokenOut}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>MINIMUM RECEIVED</span>
              <span className="text-white font-semibold">{minReceived} {tokenOut}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>ESTIMATED NETWORK FEE</span>
              <span className="text-lime-400 font-semibold">0.00001 XLM</span>
            </div>
          </div>
        </div>
      ) : (
        /* DEPOSIT FORM */
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-[#050505] border border-neutral-800">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-bold text-slate-300">DEPOSIT LIQUIDITY</span>
              <span>SELECT ASSET</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none font-mono"
              />
              <select
                value={depositToken}
                onChange={(e) => setDepositToken(e.target.value)}
                className="bg-[#09090b] border border-neutral-700 text-white font-bold text-xs rounded-lg px-3 py-2"
              >
                {SUPPORTED_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.icon} {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={isProcessing}
        className="mt-6 w-full py-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs shadow-lg shadow-lime-400/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 label-mono"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>SUBMITTING TRANSACTIONS...</span>
          </>
        ) : !walletState.isConnected ? (
          <span>CONNECT FREIGHTER TO SWAP</span>
        ) : activeTab === 'swap' ? (
          <span>SWAP {tokenIn} → {tokenOut}</span>
        ) : (
          <span>DEPOSIT {depositAmount} {depositToken}</span>
        )}
      </button>
    </div>
  );
};
