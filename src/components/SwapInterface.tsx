import React, { useState } from 'react';
import { WalletState, PoolReserves } from '../types';
import { SUPPORTED_TOKENS } from '../config/stellar';
import { ArrowDown, RefreshCw, Settings, Coins, Flame, Layers } from 'lucide-react';

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

  // Compute estimated output using constant product formula
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
    <div className="w-full max-w-lg mx-auto">
      {/* Tab Selectors */}
      <div className="flex p-1.5 mb-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'swap'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Token Swap</span>
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'deposit'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Deposit Reserve</span>
        </button>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {activeTab === 'swap' ? 'Instant Swap' : 'Add Liquidity Reserve'}
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] border border-cyan-800/50">
                Soroban V1
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTab === 'swap'
                ? 'Trade Stellar assets instantly with automated pricing'
                : 'Provide liquidity to the testnet DEX pool'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>{slippage}%</span>
            </div>
          </div>
        </div>

        {activeTab === 'swap' ? (
          /* SWAP FORM */
          <div className="space-y-4">
            {/* Pay Input Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>You Pay</span>
                <span>
                  Balance: {tokenIn === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc} {tokenIn}
                </span>
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
                  className="bg-slate-900 border border-slate-700 text-white font-semibold text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.icon} {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Direction Toggle */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-cyan-500 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md group"
              >
                <ArrowDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Receive Output Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>You Receive (Estimated)</span>
                <span>
                  Balance: {tokenOut === 'XLM' ? walletState.balanceXlm : walletState.balanceUsdc} {tokenOut}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  readOnly
                  value={estimatedOutput}
                  className="w-full bg-transparent text-2xl font-bold text-cyan-400 focus:outline-none font-mono"
                />
                <select
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-semibold text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.icon} {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Details summary */}
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Rate</span>
                <span className="font-mono text-slate-200">
                  1 XLM ≈ 0.0995 USDC
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Minimum Received</span>
                <span className="font-mono text-slate-200">
                  {minReceived} {tokenOut}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Liquidity Pool Fee (0.3%)</span>
                <span className="font-mono text-slate-200">
                  {(numericAmountIn * 0.003).toFixed(4)} {tokenIn}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* DEPOSIT FORM */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Deposit Amount</span>
                <span>Select Asset</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none font-mono"
                />
                <select
                  value={depositToken}
                  onChange={(e) => setDepositToken(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-semibold text-sm rounded-xl px-3 py-2"
                >
                  {SUPPORTED_TOKENS.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.icon} {t.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-300">
              <p className="flex items-center gap-1.5 font-semibold">
                <Flame className="w-4 h-4 text-cyan-400" />
                Soroban Liquidity Pool Rewards
              </p>
              <p className="mt-1 text-slate-400 leading-relaxed">
                Depositing tokens into the Soroban smart contract reserve enables DEX trading and earns you 0.3% protocol fee distributions proportional to your pool share.
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={isProcessing}
          className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 font-bold text-white text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Processing Soroban Tx...</span>
            </>
          ) : !walletState.isConnected ? (
            <span>Connect Wallet to Continue</span>
          ) : activeTab === 'swap' ? (
            <span>Execute Swap ({tokenIn} → {tokenOut})</span>
          ) : (
            <span>Deposit {depositAmount} {depositToken}</span>
          )}
        </button>

        {/* Pool Reserve Statistics Summary */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Pool Reserve State:</span>
          <div className="flex items-center gap-3 font-mono font-medium text-slate-200">
            <span>{reserves.xlm} XLM</span>
            <span>•</span>
            <span>{reserves.usdc} USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
